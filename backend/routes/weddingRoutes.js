const express = require("express");
const router = express.Router();
const {
  getWeddingDetails,
  updateWeddingDetails,
} = require("../controllers/weddingController");
const { protect } = require("../middleware/authMiddleware");

// GET is public, PUT is protected by admin auth
router.route("/").get(getWeddingDetails).put(
  protect,
  express.json({ limit: "1mb" }),
  express.urlencoded({ extended: true }),
  updateWeddingDetails,
);

module.exports = router;
