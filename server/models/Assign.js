const mongoose = require("mongoose");
const domPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const htmlPurify = domPurify(new JSDOM().window);
const assignSchema = new mongoose.Schema(
  {
    o_branch: {
      type: String,
    },

    n_plots: {
      type: Number,
    },
    numOfFlats: {
      type: String,
    },
    p_purchase: {
      type: String,
      enum: ["Residential", "Commercial"],
    },
    file_num:{
      type: String,
    },
    description: {
      type: String,
    },
    detail: {
      type: String,
    },
    p_f_house_c: {
      type: Number,
    },
    a_p_f_house: {
      type: Number,
    },
    p_p_plot: {
      type: Number,
      default: 0
    },
    n_c_piece: {
      type: Number,
    },
    c_piece_price: {
      type: Number,
    },
    c_piece_total: {
      type: Number,
    },
    c_piece_paid: {
      type: Number,
    },
    c_piece_status: {
      type: Number,
    },
    a_p_f_plots: {
      type: Number,
    },
    p_date: {
      type: String,
    },
    amountPaid: {
      type: Number,
    },
    payOptions: {
      type: String,
      enum: [
        "Outright Payment",
        "3 Months Plan",
        "5 Months Plan",
        "6 Months Plan",
        "1 Month Plan",
        "2 Month Plan",
        "9 Months Plan",
        "12 Months Plan",
        "18 Months Plan",
        "24 Months Plan",
        "30 Months Plan",
        "48 Months Plan",
        "3 Years",
        "5 Years",
      ],
    },
    allocation: {
      type: String,
      enum: ["Allocated", "Refunded", "Pending", "Out of Contract"],
    },
    plotNum: {
      type: String,
    },
    blockNum: {
      type: String,
    },
    flatNum: {
      type: String,
    },
    document: {
      type: String,
    },
    comment: {
      type: String,
    },
  },
  { timestamps: true }
);

assignSchema.pre("validate", function (next) {
  if (this.comment) {
    this.description = htmlPurify.sanitize(this.comment);
  }
  next();
});

module.exports = mongoose.model("Assign", assignSchema);
