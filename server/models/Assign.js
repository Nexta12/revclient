const mongoose = require("mongoose");
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
      enum: ["Residential", "Commercial"]
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
        "12 Months Plan",
        "18 Months Plan",
        "24 Months Plan",
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
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assign", assignSchema);
