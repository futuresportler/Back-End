const mongoose = require("mongoose");
const connectDB = require("../config/database");
const User = require("../database/models/user");

const seedUsers = async () => {
  await connectDB();
  await User.create([{ username: "admin", password: "password123" }]);
  console.log("Users seeded");
  mongoose.connection.close();
};

seedUsers();
