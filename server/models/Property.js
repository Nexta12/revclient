const mongoose = require("mongoose");
const domPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const htmlPurify = domPurify(new JSDOM().window);
const { stripHtml } = require("string-strip-html");


const propertySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    titleDoc: {
      type: String,
    },
    address: {
      type: String,
    },
    typeOfpro: {
      type: String,
      default: "Plots of Land",
      enum: ["Duplex", "Block of Flats", "Plots of Land", "CornerPiece"],
    },
    sizeOfPlot: {
      type: String,
    },
    numOfFlats: {
      type: String,
    },
    description: {
      type: String,
    },
    snippet: {
      type: String,
    },
    pricePerPlot: {
      type: Number,
    },
    status: {
      type: String,
      default: "For Sale",
      enum: ["For Sale", "Sold Out"],
    },
    image: {
      type: String,
      default: "default Image.png",
    },
  },
  { timestamps: true }
);

propertySchema.pre("validate", function (next) {
  if (this.description) {
    this.description = htmlPurify.sanitize(this.description);
    this.snippet = stripHtml(this.description.substring(0, 50)).result;
  }
  next();
});

module.exports = mongoose.model("Property", propertySchema);
