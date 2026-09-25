const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const Admin = require("../models/Admin");

dotenv.config({ path: path.join(__dirname, "../.env") });

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for admin seeding...");

    const email = process.env.ADMIN_EMAIL || "admin@wedding.com";
    const password = process.env.ADMIN_PASSWORD || "admin123456";
    const name = process.env.ADMIN_NAME || "Wedding Admin";

    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });

    if (existingAdmin) {
      console.log(`Admin account (${email}) already exists.`);
    } else {
      const admin = new Admin({
        name,
        email: email.toLowerCase(),
        password, // Pre-save hook will hash this
      });

      await admin.save();
      console.log(`Admin account created successfully!`);
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seeding Error:", error);
    process.exit(1);
  }
};

seedAdmin();
