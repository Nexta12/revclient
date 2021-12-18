const router = require("express").Router();
const User = require("../models/User");
const Statutory = require("../models/Statutory");
const { ensureLoggedin, mustBeAdminOrStaff } = require("../middleware/authe");
const { check, validationResult } = require("express-validator");



// get statutory List
router.get("/statutory", ensureLoggedin, mustBeAdminOrStaff, async (req, res) => {
  const statutories = await Statutory.find().sort({ createdAt: "desc" });
  res.render("statutories", {
    layout: "../layouts/dashboardLayout",
    title: "RevolutionPlus: Statutories",
    statutories,
    user: req.user,
  });
});


// get add statutory page
router.get("/add_new_statutory", ensureLoggedin, mustBeAdminOrStaff, async (req, res) => {
  res.render("add_new_statutory", {
    layout: "../layouts/dashboardLayout",
    title: "RevolutionPlus: Add Statutory",
    user: req.user,
  });
});

// post statutory
router.post(
  "/add_new_statutory",
  ensureLoggedin,
  mustBeAdminOrStaff,
  [
    check("name")
      .trim()
      .notEmpty()
      .withMessage("Provide Name for the Statutory Fee !!! "),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const { name, description } = req.body;
      const errorAlert = errors.array();
      res.render("add_new_statutory", {
        errorAlert,
        user: req.user,
        layout: "../layouts/dashboardLayout",
        title: "RevolutionPlus: Add Statutory",
        name,
        description,
      });
    } else {
      try {
        await Statutory.create(req.body);
        req.flash("success_msg", "Statutory Fee Created successfully");
        res.redirect("/api/v2/statutories/statutory");
      } catch (error) {
        console.log(error);
      }
    }
  }
);

// get edit page
router.get("/:id", ensureLoggedin, mustBeAdminOrStaff, async (req, res) => {
  try {
    const singleStatutory = await Statutory.findById(req.params.id);
    res.render("edit_statutory", {
      layout: "../layouts/dashboardLayout",
      title: "RevolutionPlus: Statutory Editing",
      user: req.user,
      singleStatutory,
    });
  } catch (error) {
    console.log(error);
  }
});

// update edited
router.put(
  "/add_new_statutory/:id",
  ensureLoggedin,
  mustBeAdminOrStaff,
  async (req, res) => {
    try {
      const updatedStatutory = await Statutory.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      req.flash("success_msg", "Statutory Fee Updated successfully");
      res.redirect("/api/v2/statutories/statutory");
    } catch (error) {
      console.log(error);
    }
  }
);

// delete statutory
router.delete(
  "/delete/:id",
  ensureLoggedin,
  mustBeAdminOrStaff,
  async (req, res) => {
    try {
      await Statutory.findByIdAndDelete(req.params.id);
       req.flash("success_msg", "Statutory Fee deleted successfully");
      res.redirect("/api/v2/statutories/statutory");
    } catch (error) {
      console.log(error);
    }
  }
);

module.exports = router;
