const router = require("express").Router();
const User = require("../models/User");
const crypto = require("crypto");
const Property = require("../models/Property");
const {
  ensureLoggedin,
  mustBeAdminOrStaff,
  sendSms,
  sendEmail,
  messages,
} = require("../middleware/authe");
const { check, validationResult } = require("express-validator");
const axios = require("axios");

// get property Assignment Page for property
router.get("/:id", ensureLoggedin, mustBeAdminOrStaff, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id); //so you can display property name to be assigned
    const user = await User.findById(req.user.id); // to get req.user to dashboard
    const users = await User.find({ role: "Customer" }).sort({
      createdAt: "desc",
    }); // to get customers list
    if (property) {
      res.render("assign_property", {
        layout: "../layouts/dashboardLayout",
        title: "RevolutionPlus: Assign Property",
        user,
        users,
        property,
        // customer
      });
    } else {
      res.render("errors/404", {
        title: "Error",
      });
    }
  } catch (error) {
    res.render("errors/500", {
      title: "Error",
    });
  }
});

// get property assignment page for customer
router.get(
  "/cust/:id",
  ensureLoggedin,
  mustBeAdminOrStaff,
  async (req, res) => {
    const customer = await User.findById(req.params.id);
    const properties = await Property.find();

    res.render("assign_customer", {
      layout: "../layouts/dashboardLayout",
      title: "RevolutionPlus: Assign Property",
      user: req.user,
      properties,
      customer,
    });
  }
);

// property assignment handler for Customer

router.put(
  "/cust/:id/assign",
  ensureLoggedin,
  mustBeAdminOrStaff,
  [
    check("o_branch")
      .trim()
      .notEmpty()
      .withMessage("Please Enter Account Opening branch !!! "),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (errors.isEmpty()) {
        const customer = await User.findById(req.params.id);
        const property = await Property.findById(req.body.id);
        const image = property.image;
        const name = property.name;
        const id = customer.id;
        const propeId = property.id;
        const uuid = crypto.randomBytes(32).toString("hex");

        let {
          n_plots,
          o_branch,
          p_purchase,
          p_date,
          detail,
          p_p_plot,
          a_p_f_plots,
          reg_fee,
          reg_paid,
          surv_fee,
          surv_paid,
          legal_fee,
          legal_paid,
          dev_fee,
          dev_paid,
          elec_fee,

          n_c_piece,
          c_piece_price,
          c_piece_paid,
          comment,
          file_num,

          allocation,
          payOptions,
          plotNum,
          blockNum,
          elec_paid,
          rat_fee,
          rat_paid,
          defau_fee,
          defau_paid,
          service_fee,
          service_paid,
          deed_fee,
          deed_paid,
        } = req.body;

        // land analysis
        const landTotal = n_plots * p_p_plot;
        const landStatus = n_plots * p_p_plot - a_p_f_plots;
        const regisStatus = reg_fee - reg_paid;
        const cornerpieceTotal = n_c_piece * c_piece_price;
        const cornerpieceStatus = n_c_piece * c_piece_price - c_piece_paid;

        // survey analysis
        const surveStatus = surv_fee - surv_paid;
        // legal analysis
        const legalStatus = legal_fee - legal_paid;
        // service Status
        const serviceStatus = service_fee - service_paid;
        // deed Status
        const deedStatus = deed_fee - deed_paid;
        // devlop fee analysis
        const develStatus = dev_fee - dev_paid;
        // electri fee analysis
        const electStatus = elec_fee - elec_paid;
        //  ratif analysis
        const ratifStatus = rat_fee - rat_paid;
        // defaultee fee analysis
        const defauStatus = defau_fee - defau_paid;

        let grandTotalToPay = [
          landTotal,
          cornerpieceTotal,
          Number(reg_fee),
          Number(surv_fee),
          Number(legal_fee),
          Number(dev_fee),
          Number(elec_fee),
          Number(rat_fee),
          Number(defau_fee),
          Number(service_fee),
          Number(deed_fee),
        ];
        // calculate grand total to pay
        let grandTopay = 0;
        for (let i = 0; i < grandTotalToPay.length; i++) {
          grandTopay += grandTotalToPay[i];
        }

        const grandTotalPaid = [
          Number(a_p_f_plots),
          Number(c_piece_paid),
          Number(reg_paid),
          Number(surv_paid),
          Number(legal_paid),
          Number(dev_paid),
          Number(elec_paid),
          Number(rat_paid),
          Number(defau_paid),
          Number(service_paid),
          Number(deed_paid),
        ];
        //  calculate grand paid
        let grandPaid = 0;
        for (let i = 0; i < grandTotalPaid.length; i++) {
          grandPaid += grandTotalPaid[i];
        }
        const grandDebt = grandTopay - grandPaid;

        await customer.updateOne({
          $push: {
            properties: {
              uuid,
              propeId,
              id,
              name,
              image,
              n_plots,
              o_branch,
              p_purchase,
              detail,
              p_date,
              p_p_plot,
              a_p_f_plots,

              file_num,
              n_c_piece,
              c_piece_price,
              c_piece_paid,
              cornerpieceTotal,
              cornerpieceStatus,
              comment,

              reg_fee,
              reg_paid,
              surv_fee,
              surv_paid,
              legal_fee,
              legal_paid,
              dev_fee,
              dev_paid,
              elec_fee,
              allocation,
              payOptions,
              plotNum,
              blockNum,
              elec_paid,
              rat_fee,
              rat_paid,
              defau_fee,
              defau_paid,
              service_fee,
              service_paid,
              deed_fee,
              deed_paid,
              landTotal,
              landStatus,
              regisStatus,
              surveStatus,
              legalStatus,
              develStatus,
              electStatus,
              ratifStatus,
              defauStatus,
              serviceStatus,
              deedStatus,
              grandTopay,
              grandPaid,
              grandDebt,
            },
          },
        });

        //Send Email to customer
        if (customer.email) {
          sendEmail(
            customer.email,
            "Update From RevolutionPlus",
            messages.PropAssignemail(
              customer.name,
              grandPaid.toLocaleString(),
              name
            )
          );
        }

        // send Sms to customer
        req.flash("success_msg", "Property was successfully asigned");
        if (customer.phone) {
          sendSms(
            customer.phone,
            messages.PropAssignsms(
              customer.name,
              grandPaid.toLocaleString(),
              name
            )
          ); // send SMS alert to Customer
          req.flash("success_msg", "SMS sent to the client's Phone Number");
        }
        res.redirect("/api/v2/customers/customers/1");
      } else {
        const errorAlert = errors.array();
        const properties = await Property.find();
        const customer = await User.findById(req.params.id);
        res.render("assign_customer", {
          layout: "../layouts/dashboardLayout",
          title: "RevolutionPlus: Assign Property",
          user: req.user,
          errorAlert,
          properties,
          customer,
        });
      }
    } catch (error) {
      // res.render("errors/500", {
      //   title: "Error",
      // });

      console.log(error);
    }
  }
);

// Property Assignment Handler for Property (Respect Me here)
router.put(
  "/:id/assign",
  ensureLoggedin,
  mustBeAdminOrStaff,
  [
    check("o_branch")
      .trim()
      .notEmpty()
      .withMessage("Please Enter Account Opening branch !!! "),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      try {
        const property = await Property.findById(req.params.id); // the property 2b assigned on params id
        const user = await User.findById(req.body.id); // this the specific user 2b assigned to on body
        const propeId = property.id; // get the id of the particular property and save in user account for ref
        const name = property.name; // save the name of property for reference sake
        const id = req.body.id; // this is the Id of the owner of the property for reference and identif
        const image = property.image;
        const uuid = crypto.randomBytes(32).toString("hex");

        let {
          n_plots,
          o_branch,
          p_purchase,
          p_date,
          detail,
          p_p_plot,
          a_p_f_plots,

          file_num,
          n_c_piece,
          c_piece_price,
          c_piece_paid,
          comment,

          reg_fee,
          reg_paid,
          surv_fee,
          surv_paid,
          legal_fee,
          legal_paid,
          dev_fee,
          dev_paid,
          elec_fee,
          allocation,
          payOptions,
          plotNum,
          blockNum,
          elec_paid,
          rat_fee,
          rat_paid,
          defau_fee,
          defau_paid,
          service_fee,
          service_paid,
          deed_fee,
          deed_paid,
        } = req.body;
        // land analysis
        const landTotal = n_plots * p_p_plot;
        const landStatus = n_plots * p_p_plot - a_p_f_plots;
        const regisStatus = reg_fee - reg_paid;

        const cornerpieceTotal = n_c_piece * c_piece_price;
        const cornerpieceStatus = n_c_piece * c_piece_price - c_piece_paid;

        // survey analysis
        const surveStatus = surv_fee - surv_paid;
        // legal analysis
        const legalStatus = legal_fee - legal_paid;
        // service Status
        const serviceStatus = service_fee - service_paid;
        // deed Status
        const deedStatus = deed_fee - deed_paid;
        // devlop fee analysis
        const develStatus = dev_fee - dev_paid;
        // electri fee analysis
        const electStatus = elec_fee - elec_paid;
        //  ratif analysis
        const ratifStatus = rat_fee - rat_paid;
        // defaultee fee analysis
        const defauStatus = defau_fee - defau_paid;

        let grandTotalToPay = [
          landTotal,
          Number(reg_fee),
          Number(surv_fee),
          Number(legal_fee),
          Number(dev_fee),
          Number(elec_fee),
          Number(rat_fee),
          Number(defau_fee),
          Number(service_fee),
          Number(deed_fee),
        ];
        // calculate grand total to pay
        let grandTopay = 0;
        for (let i = 0; i < grandTotalToPay.length; i++) {
          grandTopay += grandTotalToPay[i];
        }

        const grandTotalPaid = [
          Number(a_p_f_plots),
          Number(reg_paid),
          Number(surv_paid),
          Number(legal_paid),
          Number(dev_paid),
          Number(elec_paid),
          Number(rat_paid),
          Number(defau_paid),
          Number(service_paid),
          Number(deed_paid),
        ];
        //  calculate grand paid
        let grandPaid = 0;
        for (let i = 0; i < grandTotalPaid.length; i++) {
          grandPaid += grandTotalPaid[i];
        }
        const grandDebt = grandTopay - grandPaid;
        await user.updateOne({
          $push: {
            properties: {
              uuid,
              propeId,
              id,
              name,
              image,
              n_plots,
              o_branch,
              p_purchase,
              p_date,
              detail,
              p_p_plot,
              a_p_f_plots,

              file_num,
              n_c_piece,
              c_piece_price,
              c_piece_paid,
              cornerpieceTotal,
              cornerpieceStatus,
              comment,

              reg_fee,
              reg_paid,
              surv_fee,
              surv_paid,
              legal_fee,
              legal_paid,
              dev_fee,
              dev_paid,
              elec_fee,
              allocation,
              payOptions,
              plotNum,
              blockNum,
              elec_paid,
              rat_fee,
              rat_paid,
              defau_fee,
              defau_paid,
              service_fee,
              service_paid,
              deed_fee,
              deed_paid,
              landTotal,
              landStatus,
              regisStatus,
              surveStatus,
              legalStatus,
              develStatus,
              electStatus,
              ratifStatus,
              defauStatus,
              serviceStatus,
              deedStatus,
              grandTopay,
              grandPaid,
              grandDebt,
            },
          },
        });
        //Send Email to customer
        if (user.email) {
          sendEmail(
            user.email,
            "Update From RevolutionPlus",
            messages.PropAssignemail(
              user.name,
              grandPaid.toLocaleString(),
              name
            )
          );
        }

        req.flash("success_msg", "Property was successfully asigned");
        if (user.phone) {
          sendSms(
            user.phone,
            messages.PropAssignsms(
              customer.name,
              grandPaid.toLocaleString(),
              name
            )
          ); // send SMS alert to Customer
          req.flash("success_msg", "SMS sent to the client's Phone Number");
        }
        res.redirect("/api/v2/properties/property");
      } catch (error) {
        res.render("errors/500", {
          title: "Error",
        });
      }
    } else {
      const property = await Property.findById(req.params.id);
      const properties = await Property.find();
      const propertyId = await Property.findById(req.body.propertyId);
      const user = await User.findById(req.user.id);
      const users = await User.find({ role: "Customer" }).sort({
        createdAt: "desc",
      });

      const errorAlert = errors.array();
      res.render("assign_property", {
        layout: "../layouts/dashboardLayout",
        title: "RevolutionPlus: ASsign Property",
        user,
        users,
        errorAlert,
        property,
        properties,
        propertyId,
      });
    }
  }
);

// Get edit assigned Property page
router.get(
  "/edit/:id/:propeId/:uuid",
  ensureLoggedin,
  mustBeAdminOrStaff,
  async (req, res) => {
    try {
      // get d customer that ownes the property with the params id
      const propertyOwner = await User.findById(req.params.id);
      let reqProperty;
      propertyOwner.properties.forEach((prop) => {
        //Filter out the required property from all his properties
        if (prop.uuid == req.params.uuid) {
          reqProperty = prop;
        }
      });
      res.render("edit-assigned-prop", {
        layout: "../layouts/dashboardLayout",
        title: "RevolutionPlus: Edit Assigned Property",
        user: req.user,
        reqProperty,
        propertyOwner,
      });
    } catch (error) {
      res.render("errors/500", {
        title: "Error",
      });
    }
  }
);

// Update Assigned Property Handler
router.put("/edit/:id/:propeId/:uuid", async (req, res) => {
  const user = await User.findById(req.params.id); // so to get the user's phone number
  const property = await Property.findById(req.params.propeId);

  try {
    // declare variables
    let {
      n_plots,
      o_branch,
      p_purchase,
      p_date,
      detail,
      p_p_plot,
      a_p_f_plots,
      reg_fee,
      reg_paid,
      surv_fee,
      surv_paid,
      legal_fee,
      legal_paid,
      dev_fee,
      dev_paid,
      elec_fee,
      allocation,
      payOptions,
      plotNum,
      blockNum,

      file_num,
      n_c_piece,
      c_piece_price,
      c_piece_paid,
      comment,

      elec_paid,
      rat_fee,
      rat_paid,
      defau_fee,
      defau_paid,
      service_fee,
      service_paid,
      deed_fee,
      deed_paid,
    } = req.body;

    // land analysis
    const landTotal = n_plots * p_p_plot;
    const landStatus = n_plots * p_p_plot - a_p_f_plots;

    const cornerpieceTotal = n_c_piece * c_piece_price;
    const cornerpieceStatus = n_c_piece * c_piece_price - c_piece_paid;

    const regisStatus = reg_fee - reg_paid;
    const surveStatus = surv_fee - surv_paid;
    const serviceStatus = service_fee - service_paid;
    const deedStatus = deed_fee - deed_paid;
    const legalStatus = legal_fee - legal_paid;
    const develStatus = dev_fee - dev_paid;
    const electStatus = elec_fee - elec_paid;
    const ratifStatus = rat_fee - rat_paid;
    const defauStatus = defau_fee - defau_paid;

    const grandTotalToPay = [
      landTotal,
      cornerpieceTotal,
      Number(reg_fee),
      Number(surv_fee),
      Number(legal_fee),
      Number(dev_fee),
      Number(elec_fee),
      Number(rat_fee),
      Number(defau_fee),
      Number(service_fee),
      Number(deed_fee),
    ];
    // calculate grand total to pay
    let grandTopay = 0;
    for (let i = 0; i < grandTotalToPay.length; i++) {
      grandTopay += grandTotalToPay[i];
    }

    const grandTotalPaid = [
      Number(a_p_f_plots),
      Number(c_piece_paid),
      Number(reg_paid),
      Number(surv_paid),
      Number(legal_paid),
      Number(dev_paid),
      Number(elec_paid),
      Number(rat_paid),
      Number(defau_paid),
      Number(service_paid),
      Number(deed_paid),
    ];
    //  calculate grand paid
    let grandPaid = 0;
    for (let i = 0; i < grandTotalPaid.length; i++) {
      grandPaid += grandTotalPaid[i];
    }
    const grandDebt = grandTopay - grandPaid;

    // 3. call the update function

    await User.findOneAndUpdate(
      { "properties.uuid": req.params.uuid },
      {
        $set: {
          "properties.$.propeId": req.params.propeId,
          "properties.$.image": req.body.image,
          "properties.$.p_purchase": req.body.p_purchase,
          "properties.$.p_date": req.body.p_date,
          "properties.$.detail": req.body.detail,
          "properties.$.o_branch": req.body.o_branch,
          "properties.$.n_plots": req.body.n_plots,
          "properties.$.p_p_plot": req.body.p_p_plot,
          "properties.$.a_p_f_plots": req.body.a_p_f_plots,

          "properties.$.n_c_piece": req.body.n_c_piece,
          "properties.$.c_piece_price": req.body.c_piece_price,
          "properties.$.c_piece_paid": req.body.c_piece_paid,

          "properties.$.file_num": req.body.file_num,
          "properties.$.reg_fee": req.body.reg_fee,
          "properties.$.reg_paid": req.body.reg_paid,
          "properties.$.allocation": req.body.allocation,
          "properties.$.payOptions": req.body.payOptions,
          "properties.$.plotNum": req.body.plotNum,
          "properties.$.blockNum": req.body.blockNum,
          "properties.$.surv_fee": req.body.surv_fee,
          "properties.$.surv_paid": req.body.surv_paid,
          "properties.$.service_fee": req.body.service_fee,
          "properties.$.service_paid": req.body.service_paid,
          "properties.$.deed_fee": req.body.deed_fee,
          "properties.$.deed_paid": req.body.deed_paid,
          "properties.$.legal_fee": req.body.legal_fee,
          "properties.$.legal_paid": req.body.legal_paid,
          "properties.$.dev_fee": req.body.dev_fee,
          "properties.$.dev_paid": req.body.dev_paid,
          "properties.$.elec_fee": req.body.elec_fee,
          "properties.$.elec_paid": req.body.elec_paid,
          "properties.$.rat_fee": req.body.rat_fee,
          "properties.$.rat_paid": req.body.rat_paid,
          "properties.$.defau_fee": req.body.defau_fee,
          "properties.$.defau_paid": req.body.defau_paid,
          "properties.$.landTotal": landTotal,

          "properties.$.cornerpieceTotal": cornerpieceTotal,
          "properties.$.cornerpieceStatus": cornerpieceStatus,

          "properties.$.landStatus": landStatus,
          "properties.$.regisStatus": regisStatus,
          "properties.$.surveStatus": surveStatus,
          "properties.$.legalStatus": legalStatus,
          "properties.$.develStatus": develStatus,
          "properties.$.electStatus": electStatus,
          "properties.$.ratifStatus": ratifStatus,
          "properties.$.defauStatus": defauStatus,
          "properties.$.serviceStatus": serviceStatus,
          "properties.$.deedStatus": deedStatus,
          "properties.$.grandTopay": grandTopay,
          "properties.$.grandPaid": grandPaid,
          "properties.$.grandDebt": grandDebt,
          "properties.$.comment": req.body.comment,
        },
      },

      { new: true, useFindAndModify: false },
      (err, data) => {
        if (!err) {
          //Send Email to customer
          if (user.email) {
            sendEmail(
              user.email,
              "Update From RevolutionPlus",
              messages.PropAssignemail(
                user.name,
                grandPaid.toLocaleString(),
                property.name
              )
            );
          }
          req.flash("success_msg", "Property Successfully Updated");

          // send SMS
          if (user.phone) {
            sendSms(
              user.phone,
              messages.PropAssignsms(
                user.name,
                grandPaid.toLocaleString(),
                property.name
              )
            ); // send SMS alert to Customer
            req.flash("success_msg", "SMS sent to the client's Phone Number");
          }
          res.redirect(
            `/api/v2/customers/single/${req.params.id}/${req.params.propeId}/${req.params.uuid}`
          );
        } else {
          req.flash(
            "error_msg",
            "Update Failed due to System error, please try again or contact IT"
          );
          res.redirect(
            `/api/v2/customers/single/${req.params.id}/${req.params.propeId}/${req.params.uuid}`
          );
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
});

//  delete assigned

router.put(
  "/delete/:id/:propeId/:uuid",
  ensureLoggedin,
  mustBeAdminOrStaff,
  async (req, res) => {
    if (req.user.role == "Admin" || req.user.role == "Staff") {
      try {
        const user = await User.findById(req.params.id);
        const property = await Property.findById(req.params.propeId);
        let reqproperty; // get the assigned property to delete
        user.properties.forEach((prop) => {
          if (prop.uuid == req.params.uuid) {
            reqproperty = prop;
          }
        });

        await User.updateOne(
          { "properties.uuid": reqproperty.uuid },
          {
            $pull: { properties: { uuid: reqproperty.uuid } },
          }
        );
        req.flash("success_msg", "Property has been Retrieved from the Client");
        res.redirect(`/api/v2/customers/${req.params.id}`);
      } catch (error) {
        console.log(error);
      }
    } else {
      req.flash("error_msg", "You're not permited to perform the action");
      res.redirect(
        `/api/v2/customers/single/${req.params.id}/${req.params.propeId}/${req.params.uuid}`
      );
    }
  }
);

module.exports = router;
