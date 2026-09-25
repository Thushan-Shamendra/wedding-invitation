const express = require("express");
const router = express.Router();
const {
  getGuests,
  getGuestStats,
  getGuestById,
  createGuest,
  updateGuest,
  deleteGuest,
  getGuestByInvitationToken,
} = require("../controllers/guestController");
const { protect } = require("../middleware/authMiddleware");

// Public invitation endpoint (must be declared before /:id)
router.get("/invite/:token", getGuestByInvitationToken);

// Protected statistics summary endpoint (must be declared before /:id)
router.get("/stats/summary", protect, getGuestStats);

// Protected Guest CRUD endpoints
router.route("/").get(protect, getGuests).post(protect, createGuest);

router
  .route("/:id")
  .get(protect, getGuestById)
  .put(protect, updateGuest)
  .delete(protect, deleteGuest);

module.exports = router;
