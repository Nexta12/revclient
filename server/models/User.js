const mongoose = require("mongoose");
const domPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const htmlPurify = domPurify(new JSDOM().window);
const { stripHtml } = require("string-strip-html");
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      min: 4,
      trim: true,
    },
    firstname: {
      // first name, last name and other names for staff and admin
      type: String,
    },
    lastname: {
      type: String,
    },
    othernames: {
      type: String,
    },
    position: {
      type: String,
    },

    email: {
      type: String,
      email: true,
      trim: true,
    },
    password: {
      type: String,
      min: 6,
    },

    name: {
      //for customers
      type: String,
    },
    file_num: {
      //for customers
      type: String,
    },
    twitter: {
      type: String,
    },
    instagram: {
      type: String,
    },
    facebook: {
      type: String,
    },
    youtube: {
      type: String,
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      default: "Customer",
      enum: ["Admin", "Staff", "Customer"],
    },
    description: {
      type: String,
    },
    dept: {
      type: String,
      default: "Others",
      enum: [
        "ED",
        "MD",
        "HR",
        "Marketing",
        "IT Department",
        "Accounts",
        "Customer Care",
        "General Manager",
        "Others",
      ],
    },
    branch: {
      type: String,
      default: "Ikeja",
      enum: ["Ikeja", "Lekki", "abuja", "Port Harcourt", "ibadan"],
    },
    profilePic: {
      type: String,
      default: "man.png",
    },
    properties: {
      type: Array,
      default: [],
    },
    country: {
      type: String,
    },
    city: {
      type: String,
    },
    address: {
      type: String,
    },
    nameOfKin: {
      type: String,
    },
    phoneOfKin: {
      type: String,
    },
    emailOfKin: {
      type: String,
    },
    kinAddress: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("validate", function (next) {
  if (this.description) {
    this.description = htmlPurify.sanitize(this.description);
    this.snippet = stripHtml(this.description.substring(0, 150)).result;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
