const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();

const authRoutes = require("./routes/authRoutes");
const weddingRoutes = require("./routes/weddingRoutes");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Wedding Invitation API is running",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/wedding", weddingRoutes);
app.use("/api/schedule", require("./routes/scheduleRoutes"));



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});