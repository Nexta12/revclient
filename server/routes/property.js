const router = require("express").Router();
const User = require("../models/User");
const Property = require("../models/Property");
const { ensureLoggedin, mustBeAdminOrStaff, numFomatter } = require("../middleware/authe");
const { check, validationResult } = require("express-validator");
const path = require("path");


// // get all Properties
router.get("/property", ensureLoggedin, async (req, res) => {
  
  const properties = await Property.find().sort({ createdAt: "desc" })
  const user = await User.findById(req.user.id)
  res.render("properties", {
    layout: "../layouts/dashboardLayout",
    title: "RevolutionPlus: Properties",
    properties,
    user,
    numFomatter,
  });
});
    

// // // get add property Page

router.get(
  "/add_new_property",
  ensureLoggedin,
  mustBeAdminOrStaff,
  async (req, res) => {
    const user = await User.findById(req.user.id);
    res.render("add_property", {
      layout: "../layouts/dashboardLayout",
      title: "RevolutionPlus: Add New Property",
      user,
    });
  }
);

// add property Handler
router.post(
  "/add_property",
  ensureLoggedin,
  mustBeAdminOrStaff,
  [
    check("name", "Please Enter The Property Name").notEmpty(),
    check("address", "Please Provide Property Location").notEmpty(),
   
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const {
        name,
        titleDoc,
        typeOfpro,
        sizeOfPlot,
        address,
        description,
        pricePerPlot,
        status,
      } = req.body;
      const errorAlert = errors.array();
      const user = await User.findById(req.user.id);
      res.render("add_property", {
        layout: "../layouts/dashboardLayout",
        title: "RevolutionPlus: Add Property",
        errorAlert,
        user,
        name,
        titleDoc,
        typeOfpro,
        sizeOfPlot,
        address,
        description,
        pricePerPlot,
        status,
      });
    } else {
      try {
        if (!req.files || Object.keys(req.files).length === 0) {
          //No file uploaded
          await Property.create({
            name: req.body.name,
            titleDoc: req.body.titleDoc,
            address: req.body.address,
            typeOfpro: req.body.typeOfpro,
            sizeOfPlot: req.body.sizeOfPlot,
            description: req.body.description,
            pricePerPlot: req.body.pricePerPlot,
            status: req.body.status,
          });
          req.flash("success_msg", "Property was Created  successfully");
          res.redirect("/api/v2/properties/property");
        } else {
          //  File/ image is uploaded
          const file = req.files.image;
          const fileName =
            new Date().getTime().toString() + path.extname(file.name);
          const savePath = path.resolve("public/img/uploads/" + fileName);
          if (file.truncated) {
            throw new Error("Uploaded File is too big, should not be morethan 8 MB");
          }

          // if (
          //   file.mimetype !== ("image/jpeg" || "image/png" || "image/svg+xml")
          // ) {
          //   throw new Error(
          //     "Uploaded file type unsupported, only jpeg, jpg, png"
          //   );
          // }

          await file.mv(savePath);
          await Property.create({
            name: req.body.name,
            titleDoc: req.body.titleDoc,
            address: req.body.address,
            typeOfpro: req.body.typeOfpro,
            sizeOfPlot: req.body.sizeOfPlot,
            description: req.body.description,
            pricePerPlot: req.body.pricePerPlot,
            status: req.body.status,
            image: fileName,
          });
          req.flash("success_msg", "Property was Created  successfully");
          res.redirect("/api/v2/properties/property");
        }
      } catch (error) {
        req.flash("error_msg", error.message);
        res.redirect("/api/v2/properties/add_new_property");
      }
    }
  }
);

// get One Property, one property buyers and total count of buyers
router.get("/:id", ensureLoggedin,  async (req, res) => {
  try {
    const singleProperty = await Property.findById(req.params.id);
    // getting all customers that bought a single property
    const singlePropertyOwners = await User.aggregate([
      { $unwind: "$properties" },
      { $match: { "properties.propeId": req.params.id } },
    ]);

    let totalDebt = [];
    singlePropertyOwners.forEach((x) => {
      if (x.properties.grandDebt != 0) {
        totalDebt.push(x.properties.grandDebt);
      }
    });

    let sumOfAllDebts = 0;
    for (let i = 0; i < totalDebt.length; i++) {
      sumOfAllDebts += totalDebt[i];
    }

    const allDebts = sumOfAllDebts.toLocaleString();

    // counting the number of customers that bought a single property
    function objectLength(obj) {
      var result = 0;
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          // or Object.prototype.hasOwnProperty.call(obj, prop)
          result++;
        }
      }
      return result;
    }
    const totalBuyers = objectLength(singlePropertyOwners);

    if (singleProperty) {
      res.render("single_property", {
        layout: "../layouts/dashboardLayout",
        title: "RevolutionPlus: Property view",
        singleProperty,
        user: req.user,
        singlePropertyOwners,
        totalBuyers,
        allDebts,
      });
    }
  } catch (error) {
    console.log(error);
  }
});



//get Edit Property Page
router.get(
  "/edit/:id",
  ensureLoggedin,
  mustBeAdminOrStaff,
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      const singlePropertyContent = await Property.findById(req.params.id);
      res.render("edit_property", {
        layout: "../layouts/dashboardLayout",
        title: "RevolutionPlus: Property Editing",
        user,
        singlePropertyContent,
      });
    } catch (error) {
      console.log(error);
    }
  }
);

// //update property handler

router.put("/:id", ensureLoggedin, mustBeAdminOrStaff, async (req, res) => {
  try {

    if(!req.files || Object.keys(req.files).length === 0){ // no file
       const updatedProperty = await Property.findByIdAndUpdate(
         req.params.id,
         {
           $set: req.body,
         },
         { new: true }
       );
       req.flash("success_msg", "Property was updated successfully");
       res.redirect("/api/v2/properties/property");
    }else{
      //  File/ image is uploaded
      const file = req.files.image;
      const fileName =
        new Date().getTime().toString() + path.extname(file.name);
        
      const savePath = path.resolve("public/img/uploads/" + fileName);
      if (file.truncated) {
        throw new Error(
          "Uploaded File is too big, should not be morethan 8 MB"
        );
      }

      await file.mv(savePath);

       await Property.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
          $set: { image: fileName },
        },
        { new: true }
      );
      req.flash("success_msg", "Property was updated successfully");
      res.redirect("/api/v2/properties/property");
    }
   
  } catch (error) {
   req.flash("error_msg", error.message);
   res.redirect(`/api/v2/properties/edit/${req.params.id}`);
  }
});

//delete Property
router.delete(
  "/delete/:id",
  ensureLoggedin,
  mustBeAdminOrStaff,
  async (req, res) => {
    try {
      await Property.findByIdAndDelete(req.params.id);
       req.flash("success_msg", "Property was deleted  successfully");
       res.redirect("/api/v2/properties/property");
    } catch (error) {
      console.log(error);
    }
  }
);


module.exports = router;
