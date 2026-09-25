const mongoose = require("mongoose");

const guestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Guest name is required"],
      trim: true,
      maxlength: [150, "Guest name cannot exceed 150 characters"],
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
      match: [
        /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    phone: {
      type: String,
      default: "",
      trim: true,
      maxlength: [30, "Phone number cannot exceed 30 characters"],
    },
    maximumGuests: {
      type: Number,
      default: 1,
      min: [1, "Maximum guests must be at least 1"],
      max: [20, "Maximum guests cannot exceed 20"],
    },
    personalMessage: {
      type: String,
      default: "",
      trim: true,
      maxlength: [1000, "Personal message cannot exceed 1000 characters"],
    },
    invitationToken: {
      type: String,
      required: [true, "Invitation token is required"],
      unique: true,
      index: true,
      trim: true,
    },
    rsvpStatus: {
      type: String,
      enum: ["pending", "attending", "declined"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Guest", guestSchema);
