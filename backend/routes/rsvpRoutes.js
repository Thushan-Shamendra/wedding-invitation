const express = require("express");
const router = express.Router();
const {
  submitRSVPByToken,
  getRSVPByToken,
  getRSVPResponses,
  getRSVPStats,
  getRSVPById,
  updateRSVP,
  deleteRSVP,
} = require("../controllers/rsvpController");
const { protect } = require("../middleware/authMiddleware");

// ==========================================
// PUBLIC ROUTES (No authentication required)
// ==========================================

// Get existing RSVP for a personalized invitation token
router.get("/invite/:token", getRSVPByToken);

// Submit or update RSVP via personalized invitation token
router.post("/:token", submitRSVPByToken);

// ==========================================
// ADMIN ROUTES (JWT Protection required)
// ==========================================

// Get RSVP statistics summary
router.get("/stats/summary", protect, getRSVPStats);

// Get all RSVP responses with search/filter
router.get("/", protect, getRSVPResponses);

// Single RSVP management by ID
router.get("/:id", protect, getRSVPById);
router.put("/:id", protect, updateRSVP);
router.delete("/:id", protect, deleteRSVP);

module.exports = router;
