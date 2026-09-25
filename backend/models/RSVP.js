const mongoose = require("mongoose");

const rsvpSchema = new mongoose.Schema(
  {
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guest",
      required: [true, "Guest reference is required"],
      unique: true, // One RSVP per guest
      index: true,
    },
    attendanceStatus: {
      type: String,
      enum: ["attending", "declined"],
      required: [true, "Attendance status is required"],
      index: true,
    },
    numberOfGuests: {
      type: Number,
      default: 1,
      min: [0, "Number of guests cannot be negative"],
    },
    mealPreference: {
      type: String,
      default: "",
      trim: true,
      maxlength: [100, "Meal preference cannot exceed 100 characters"],
    },
    message: {
      type: String,
      default: "",
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RSVP", rsvpSchema);
