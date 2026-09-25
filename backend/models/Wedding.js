const mongoose = require("mongoose");

const weddingSchema = new mongoose.Schema(
  {
    weddingTitle: {
      type: String,
      default: "Our Wedding",
      trim: true,
      maxlength: [120, "Wedding title cannot exceed 120 characters"],
    },
    brideName: {
      type: String,
      default: "",
      trim: true,
      maxlength: [100, "Bride name cannot exceed 100 characters"],
    },
    brideDescription: {
      type: String,
      default: "",
      trim: true,
      maxlength: [2000, "Bride description cannot exceed 2000 characters"],
    },
    groomName: {
      type: String,
      default: "",
      trim: true,
      maxlength: [100, "Groom name cannot exceed 100 characters"],
    },
    groomDescription: {
      type: String,
      default: "",
      trim: true,
      maxlength: [2000, "Groom description cannot exceed 2000 characters"],
    },
    weddingDate: {
      type: String,
      default: "",
      trim: true,
    },
    startTime: {
      type: String,
      default: "",
      trim: true,
    },
    endTime: {
      type: String,
      default: "",
      trim: true,
    },
    dressCode: {
      type: String,
      default: "",
      trim: true,
      maxlength: [100, "Dress code cannot exceed 100 characters"],
    },
    contactBride: {
      type: String,
      default: "",
      trim: true,
      maxlength: [50, "Contact bride cannot exceed 50 characters"],
    },
    contactGroom: {
      type: String,
      default: "",
      trim: true,
      maxlength: [50, "Contact groom cannot exceed 50 characters"],
    },
    contactCoordinator: {
      type: String,
      default: "",
      trim: true,
      maxlength: [50, "Contact coordinator cannot exceed 50 characters"],
    },
    invitationHeading: {
      type: String,
      default: "We're Getting Married",
      trim: true,
      maxlength: [150, "Invitation heading cannot exceed 150 characters"],
    },
    personalGuestGreeting: {
      type: String,
      default: "Dear {{guestName}},",
      trim: true,
      maxlength: [200, "Personal guest greeting cannot exceed 200 characters"],
    },
    invitationMessage: {
      type: String,
      default: "",
      trim: true,
      maxlength: [3000, "Invitation message cannot exceed 3000 characters"],
    },
    footerMessage: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Footer message cannot exceed 500 characters"],
    },
    websiteStatus: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    // Ceremony Venue Details
    ceremonyVenueName: {
      type: String,
      default: "",
      trim: true,
      maxlength: [150, "Ceremony venue name cannot exceed 150 characters"],
    },
    ceremonyAddress: {
      type: String,
      default: "",
      trim: true,
      maxlength: [300, "Ceremony address cannot exceed 300 characters"],
    },
    ceremonyDate: {
      type: String,
      default: "",
      trim: true,
    },
    ceremonyTime: {
      type: String,
      default: "",
      trim: true,
    },
    ceremonyGoogleMapsUrl: {
      type: String,
      default: "",
      trim: true,
    },
    ceremonyLatitude: {
      type: Number,
      default: null,
      min: [-90, "Latitude must be between -90 and 90"],
      max: [90, "Latitude must be between -90 and 90"],
    },
    ceremonyLongitude: {
      type: Number,
      default: null,
      min: [-180, "Longitude must be between -180 and 180"],
      max: [180, "Longitude must be between -180 and 180"],
    },
    ceremonyDescription: {
      type: String,
      default: "",
      trim: true,
      maxlength: [2000, "Ceremony description cannot exceed 2000 characters"],
    },

    // Reception Venue Details
    receptionVenueName: {
      type: String,
      default: "",
      trim: true,
      maxlength: [150, "Reception venue name cannot exceed 150 characters"],
    },
    receptionAddress: {
      type: String,
      default: "",
      trim: true,
      maxlength: [300, "Reception address cannot exceed 300 characters"],
    },
    receptionDate: {
      type: String,
      default: "",
      trim: true,
    },
    receptionTime: {
      type: String,
      default: "",
      trim: true,
    },
    receptionGoogleMapsUrl: {
      type: String,
      default: "",
      trim: true,
    },
    receptionLatitude: {
      type: Number,
      default: null,
      min: [-90, "Latitude must be between -90 and 90"],
      max: [90, "Latitude must be between -90 and 90"],
    },
    receptionLongitude: {
      type: Number,
      default: null,
      min: [-180, "Longitude must be between -180 and 180"],
      max: [180, "Longitude must be between -180 and 180"],
    },
    receptionDescription: {
      type: String,
      default: "",
      trim: true,
      maxlength: [2000, "Reception description cannot exceed 2000 characters"],
    },

    // Theme & Appearance Configuration
    primaryColor: {
      type: String,
      default: "#C9A96E",
      trim: true,
    },
    secondaryColor: {
      type: String,
      default: "#D8B4A0",
      trim: true,
    },
    backgroundColor: {
      type: String,
      default: "#F8F6F1",
      trim: true,
    },
    textColor: {
      type: String,
      default: "#26231F",
      trim: true,
    },
    headingFont: {
      type: String,
      default: "Playfair Display",
      trim: true,
    },
    bodyFont: {
      type: String,
      default: "Inter",
      trim: true,
    },
    themeStyle: {
      type: String,
      enum: ["classic", "modern", "minimal", "luxury"],
      default: "luxury",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Wedding", weddingSchema);
