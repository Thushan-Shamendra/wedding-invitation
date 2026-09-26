const express = require("express");
const router = express.Router();
const {
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/login", loginAdmin);
router.get("/me", protect, getAdminProfile);
router.put("/profile", protect, updateAdminProfile);
router.put("/change-password", protect, changeAdminPassword);

module.exports = router;
