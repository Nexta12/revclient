const router = require("express").Router();
const User = require("../models/User");
const { mustBeAdminOrStaff, mustBeAdmin, ensureLoggedin, usernameToLowerCase  } = require('../middleware/authe');
const { check, validationResult } = require("express-validator");
const path = require("path");
const bcrypt = require("bcrypt");


// get staff List page

router.get("/staff", ensureLoggedin, mustBeAdminOrStaff, async (req, res) => {
  try {
    const allUsers = await User.find()
      .sort({ createdAt: "desc" })
      .exec();
     let staffList = [];
     allUsers.forEach(user =>{
       if(user.role != "Customer"){
         staffList.push(user)
       }
     })
      res.render("staff", {
        layout: "../layouts/dashboardLayout",
        title: "RevolutionPlus: All Staff",
        staffList,
        user: req.user,
      });
      
  } catch (error) {
    console.log(error)
  }
});

// get add new staff form

router.get("/add_new_staff", ensureLoggedin, mustBeAdmin, async (req, res) => {
  res.render("add_new_staff", {
    layout: "../layouts/dashboardLayout",
    title: "RevolutionPlus: Add New Staff",
    user: req.user,
  });
});

// create new staff
router.post(
  "/add_new_staff",
  ensureLoggedin,
  mustBeAdmin,
  [
    check("username")
      .trim()
      .toLowerCase()
      .notEmpty()
      .withMessage("Username cannot be empty !!! ")
      .custom((value, { req }) => {
        return User.findOne({ username: req.body.username }).then((user) => {
          if (user) {
            return Promise.reject("This Username Already Exists");
          }
        });
      })
      .isLength({ min: 4 })
      .withMessage("Username is too Short"),
    check("email")
      .trim()
      .toLowerCase()
      .isEmail()
      .normalizeEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: req.body.email }).then((user) => {
          if (user) {
            return Promise.reject("This Email is Already Registered");
          }
        });
      }),
    check("password")
      .notEmpty()
      .withMessage("Please Provide Password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 Characters Long")
      .trim(),
      check("password2")
        .exists()
        .custom((value, { req }) => {
          if (value !== req.body.password) {
            throw new Error("The passwords is not same!!!");
          }
          return true;
        }),
    check("firstname")
      .trim()
      .notEmpty()
      .withMessage("Please Provide First Name"),
    check("lastname").trim().notEmpty().withMessage("Please Provide Last Name"),
    check("role").notEmpty().withMessage("Please Select Register As"),
  ],
  usernameToLowerCase,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const {
        username,
        firstname,
        lastname,
        othernames,
        email,
        password,
        dept,
        position,
        phone,
        role,
        branch,
        profilePic,
      } = req.body;
      const errorAlert = errors.array();
      res.render("add_new_staff", {
        layout: "../layouts/dashboardLayout",
        title: "RevolutionPlus: Create New Staff ",
        user: req.user,
        errorAlert,
      });
    } else {
      try {
        if (!req.files || Object.keys(req.files).length === 0) {
          //No file uploaded
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(req.body.password, salt);
           await User.create({
            username: req.body.username,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            othernames: req.body.othernames,
            email: req.body.email,
            password: hashedPassword,
            dept: req.body.dept,
            position: req.body.position,
            phone: req.body.phone,
            role: req.body.role,
            branch: req.body.branch,
          });
          req.flash("success_msg", "Your registration was successful");
          res.redirect("/api/v2/users/staff");
        }{
          //  File/ image is uploaded
          const file = req.files.profilePic;

          const fileName = new Date().getTime().toString() + path.extname(file.name);
           
          const savePath = path.resolve("public/img/uploads/" + fileName);
          if (file.truncated) {
            throw new Error("Uploaded File is too big, should not be morethan 8 MB");
          }

          if (
            file.mimetype !== ("image/jpeg" || "image/png" || "image/svg+xml")
          ) {
            throw new Error(
              "Uploaded file type unsupported, only jpeg, jpg, png"
            );
          }
          await file.mv(savePath);
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(req.body.password, salt);
            await User.create({
            username: req.body.username,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            othernames: req.body.othernames,
            email: req.body.email,
            password: hashedPassword,
            dept: req.body.dept,
            position: req.body.position,
            phone: req.body.phone,
            role: req.body.role,
            branch: req.body.branch,
            profilePic: fileName,
          });
          req.flash("success_msg", "Your registration was successful");
          res.redirect("/api/v2/users/staff");
        }
      } catch (error) {
       req.flash("error_msg", error.message);
       res.redirect("/api/v2/users/add_new_staff");
      }
    }
  }
);

// show single User/Staff

router.get("/:id", ensureLoggedin, async (req, res) => {
  try {
    const userNow = await User.findById(req.params.id);

    if (userNow) {
      res.render("staffInfo", {
        layout: "../layouts/dashboardLayout",
        title: "RevolutionPlus: User Information ",
        userNow,
        user: req.user,
      });
    }
  } catch (err) {
    console.log(err);
  }
});

// get User update page/Edit profile

router.get("/edit/:id", ensureLoggedin, async (req, res) => {
  if (req.user.id === req.params.id || req.user.role === "Admin") {
    try {
      const userId = await User.findById(req.params.id);
      res.render("edit-profile", {
        layout: "../layouts/dashboardLayout",
        title: "RevolutionPlus: Edit Profile ",
        user: req.user,
        userId,
      });
    } catch (err) {
      console.log(err);
    }
  } else {
    res.status(403).json("You're not authorized to execute this action");
  }
});

// create Updating a User account/edit profile
router.put(
  "/edit/:id",
  ensureLoggedin,
  usernameToLowerCase,
  async (req, res) => {
    if (req.user.id === req.params.id || req.user.role === "Admin") {
      try {
        if (!req.files || Object.keys(req.files).length === 0) {
          //No image Uploaded
          const user = await User.findById(req.params.id);
          await User.findByIdAndUpdate(
            req.params.id,
            {
              $set: req.body,
            },
            { new: true },
            (err, data) => {
              if (err) console.log(err);
            }
          ).clone();
           if (req.user.id === req.params.id) {
             req.flash("success_msg", "Update successful");
             res.redirect(`/api/v2/users/${user.id}`);
           } else {
             req.flash("success_msg", "Update successful");
             res.redirect("/api/v2/users/staff");
           }
        } else {
          //  File/ image is uploaded
          const file = req.files.profilePic;
           const fileName = new Date().getTime().toString() + path.extname(file.name);
           const savePath = path.resolve("public/img/uploads/" + fileName);
           await file.mv(savePath);

          const user = await User.findById(req.params.id);
          if(req.user.role != "Customer"){

            await User.findByIdAndUpdate(
              req.params.id,
              {
                $set: {
                  username: req.body.username,
                  firstname: req.body.firstname,
                  lastname: req.body.lastname,
                  othernames: req.body.othernames,
                  email: req.body.email,
                  position: req.body.position,
                  phone: req.body.phone,
                  twitter: req.body.twitter,
                  facebook: req.body.facebook,
                  instagram: req.body.instagram,
                  description: req.body.description,
                  profilePic: fileName,
                },
              },
              { new: true },
              (err, data) => {
                if (err) throw new Error("An Unknown Server error Occured");
              }
            ).clone();
            
          }else{

             await User.findByIdAndUpdate(
               req.params.id,
               {
                 $set: {
                   username: req.body.username,
                   name: req.body.name,
                   address: req.body.address,
                   email: req.body.email,
                   phone: req.body.phone,
                   description: req.body.description,
                   nameOfKin: req.body.nameOfKin,
                   emailOfKin: req.body.emailOfKin,
                   kinAddress: req.body.kinAddress,
                   phoneOfKin: req.body.phoneOfKin,
                   profilePic: fileName,
                 },
               },
               { new: true },
               (err, data) => {
                 if (err) throw new Error("An Unknown Server error Occured");
               }
             ).clone();

          }
          
          if(req.user.id === req.params.id){
            req.flash("success_msg", "Update successful");
            res.redirect(`/api/v2/users/${user.id}`);
          }else{
             req.flash("success_msg", "Update successful");
             res.redirect("/api/v2/users/staff");
          }
          
        }
      } catch (error) {
       req.flash("error_msg", error.message);
       res.redirect("/api/v2/users/edit-profile");
      }
    } else {
      req.flash("error_msg", "You're not authorized to perform this action");
      res.redirect("/api/v2/users/edit-profile");
    }
  }
);

// Edit LoggedIn User Password

router.get("/edit-password/:id", ensureLoggedin, async (req, res) => {
  try {
    const userId = await User.findById(req.params.id);

    res.render("edit-password", {
      layout: "../layouts/dashboardLayout",
      title: "RevolutionPlus: Edit Password ",
      user: req.user,
      userId,
    });
  } catch (error) {
    console.log(error);
  }
});

// edit password handler
router.put(
  "/edit-password/:id",
  ensureLoggedin,
  [
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 Characters Long")
      .trim(),
    check("password2")
      .exists()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("The passwords don't match");
        }
        return true;
      }),
  ],
  async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const { password, password2 } = req.body;
      const errorAlert = errors.array();

      try {
        const userId = await User.findById(req.params.id);

        res.render("edit-password", {
          layout: "../layouts/dashboardLayout",
          title: "RevolutionPlus: Edit Password ",
          user: req.user,
          userId,
          errorAlert,
        });
      } catch (error) {
        console.log(error);
      }
    } else {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);

      try {
        await User.findByIdAndUpdate(
          req.params.id,
          {
            $set: req.body,
          },
          { new: true },
          (err, data) => {
            if (err) console.log(err);
          }
        ).clone();
        req.flash("success_msg", "Password Updated Successfully");
         res.redirect(`/api/v2/users/${req.user.id}`);
      } catch (error) {
        console.log(error);
      }
    }
  }
);

// delete a User

router.delete("/del/:id", ensureLoggedin, async (req, res) => {
  if (req.user.id === req.params.id || req.user.role === "Admin") {
    try {
      await User.findByIdAndDelete(req.params.id);

      if (req.user.role === "Admin" && req.user.id != req.params.id) {
         req.flash("success_msg", " Delete successful");
         res.redirect("/api/v2/users/staff");
      } else {
         req.flash("success_msg", "You have deleted your account, please contact admin");
        res.redirect("/api/v2/secure/login");
      }
    } catch (err) {
      console.log(err);
    }
  } else {
    req.flash("error_msg", "You're not authorized to delete this user");
    res.redirect("/api/v2/users/staff");
  }
});

module.exports = router;
