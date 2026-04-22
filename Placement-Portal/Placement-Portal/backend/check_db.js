require("dotenv").config();
const mongoose = require("mongoose");
const UserModel = require("./models/User");

async function checkDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const admin = await UserModel.findOne({ email: 'admin@gmail.com' });
    console.log(`Admin 'admin@gmail.com' Found: ${admin ? 'Yes' : 'No'}`);
    if (admin) {
        console.log(`Role: ${admin.role}`);
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
checkDb();
