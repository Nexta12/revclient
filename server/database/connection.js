const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    let conn = mongoose.connect(process.env.MONGO_URI);
    console.log(`Server connected to Database`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;
