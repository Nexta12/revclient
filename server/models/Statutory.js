const mongoose = require("mongoose");
const domPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const htmlPurify = domPurify(new JSDOM().window);
const { stripHtml } = require("string-strip-html");
const statutorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    snippet: {
      type: String,
    },
  },
  { timestamps: true }
);

statutorySchema.pre("validate", function (next) {
  if (this.description) {
    this.description = htmlPurify.sanitize(this.description);
    this.snippet = stripHtml(this.description.substring(0, 150)).result;
  }
  next();
});

module.exports = mongoose.model("Statutory", statutorySchema);
