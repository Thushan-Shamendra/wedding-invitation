const express = require("express");
const router = express.Router();
const {
  getScheduleEvents,
  createScheduleEvent,
  updateScheduleEvent,
  deleteScheduleEvent,
} = require("../controllers/scheduleController");
const { protect } = require("../middleware/authMiddleware");

// Public GET, protected POST, PUT, DELETE
router
  .route("/")
  .get(getScheduleEvents)
  .post(protect, createScheduleEvent);

router
  .route("/:id")
  .put(protect, updateScheduleEvent)
  .delete(protect, deleteScheduleEvent);

module.exports = router;
