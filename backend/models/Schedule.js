const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: [true, "Event name is required"],
      trim: true,
      maxlength: [150, "Event name cannot exceed 150 characters"],
    },
    eventDate: {
      type: String,
      default: "",
      trim: true,
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    order: {
      type: Number,
      default: 0,
      min: [0, "Order must be a non-negative number"],
    },
  },
  {
    timestamps: true,
  }
);

// Index on order and startTime for efficient sorting
scheduleSchema.index({ order: 1, startTime: 1 });

module.exports = mongoose.model("Schedule", scheduleSchema);
