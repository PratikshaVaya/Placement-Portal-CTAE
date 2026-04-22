require("dotenv").config();
const connectDB = require("../db/connect");

const UserModel = require("../models/User");
const StudentPersonalData = require("../models/StudentPersonalData");

const addPersonalData = async (studentPersonalInfo) => {
  await connectDB(process.env.MONGO_URI);
  try {
    const student_id = studentPersonalInfo.student_id;
    const student = await UserModel.findOne({
      _id: student_id,
      role: "student",
    });

    if (!student) {
      throw new Error(`No student found with id: ${student_id}`);
    }

    const personalData = await StudentPersonalData.create({
      ...studentPersonalInfo,
    });

    student.personal_details = personalData._id;
    await student.save();

    console.log(`Personal details created with id: ${personalData._id}`);
  } catch (error) {
    console.log("Failed to create batch", error);
  }
};

// Note: Use environment variables or secure imports for production data.
