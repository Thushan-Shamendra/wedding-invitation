const Wedding = require("../models/Wedding");

// Helper to validate latitude
const isValidLatitude = (lat) => {
  const num = Number(lat);
  return !isNaN(num) && num >= -90 && num <= 90;
};

// Helper to validate longitude
const isValidLongitude = (lng) => {
  const num = Number(lng);
  return !isNaN(num) && num >= -180 && num <= 180;
};

// Helper to validate URL
const isValidUrl = (urlStr) => {
  if (!urlStr || typeof urlStr !== "string") return true;
  const trimmed = urlStr.trim();
  if (!trimmed) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

// @desc    Get wedding details (single document)
// @route   GET /api/wedding
// @access  Public
const getWeddingDetails = async (req, res) => {
  try {
    let wedding = await Wedding.findOne();

    // If no document exists yet, create one with default values
    if (!wedding) {
      wedding = await Wedding.create({
        weddingTitle: "Our Wedding",
        websiteStatus: "draft",
      });
    }

    res.json({
      success: true,
      data: wedding,
    });
  } catch (error) {
    console.error("Error retrieving wedding details:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving wedding details",
    });
  }
};

// @desc    Update wedding details
// @route   PUT /api/wedding
// @access  Private (Admin only)
const updateWeddingDetails = async (req, res) => {
  try {
    const allowedFields = [
      "weddingTitle",
      "brideName",
      "brideDescription",
      "groomName",
      "groomDescription",
      "weddingDate",
      "startTime",
      "endTime",
      "dressCode",
      "contactBride",
      "contactGroom",
      "contactCoordinator",
      "invitationHeading",
      "personalGuestGreeting",
      "invitationMessage",
      "footerMessage",
      "websiteStatus",
      // Ceremony fields
      "ceremonyVenueName",
      "ceremonyAddress",
      "ceremonyDate",
      "ceremonyTime",
      "ceremonyGoogleMapsUrl",
      "ceremonyLatitude",
      "ceremonyLongitude",
      "ceremonyDescription",
      // Reception fields
      "receptionVenueName",
      "receptionAddress",
      "receptionDate",
      "receptionTime",
      "receptionGoogleMapsUrl",
      "receptionLatitude",
      "receptionLongitude",
      "receptionDescription",
    ];

    // Core validation
    if (req.body.weddingTitle && req.body.weddingTitle.length > 120) {
      return res.status(400).json({
        success: false,
        message: "Wedding title cannot exceed 120 characters.",
      });
    }

    if (req.body.brideName && req.body.brideName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Bride name cannot exceed 100 characters.",
      });
    }

    if (req.body.groomName && req.body.groomName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Groom name cannot exceed 100 characters.",
      });
    }

    if (req.body.brideDescription && req.body.brideDescription.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Bride description cannot exceed 2000 characters.",
      });
    }

    if (req.body.groomDescription && req.body.groomDescription.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Groom description cannot exceed 2000 characters.",
      });
    }

    // Invitation message validation
    if (req.body.invitationHeading && req.body.invitationHeading.length > 150) {
      return res.status(400).json({
        success: false,
        message: "Invitation heading cannot exceed 150 characters.",
      });
    }

    if (
      req.body.personalGuestGreeting &&
      req.body.personalGuestGreeting.length > 200
    ) {
      return res.status(400).json({
        success: false,
        message: "Personal guest greeting cannot exceed 200 characters.",
      });
    }

    if (
      req.body.invitationMessage &&
      req.body.invitationMessage.length > 3000
    ) {
      return res.status(400).json({
        success: false,
        message: "Invitation message cannot exceed 3000 characters.",
      });
    }

    if (req.body.footerMessage && req.body.footerMessage.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Footer message cannot exceed 500 characters.",
      });
    }

    // Venue validation: Ceremony
    if (req.body.ceremonyVenueName && req.body.ceremonyVenueName.length > 150) {
      return res.status(400).json({
        success: false,
        message: "Ceremony venue name cannot exceed 150 characters.",
      });
    }

    if (req.body.ceremonyAddress && req.body.ceremonyAddress.length > 300) {
      return res.status(400).json({
        success: false,
        message: "Ceremony address cannot exceed 300 characters.",
      });
    }

    if (
      req.body.ceremonyDescription &&
      req.body.ceremonyDescription.length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "Ceremony description cannot exceed 2000 characters.",
      });
    }

    if (
      req.body.ceremonyGoogleMapsUrl &&
      !isValidUrl(req.body.ceremonyGoogleMapsUrl)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid Ceremony Google Maps URL.",
      });
    }

    if (
      req.body.ceremonyLatitude !== undefined &&
      req.body.ceremonyLatitude !== null &&
      req.body.ceremonyLatitude !== ""
    ) {
      if (!isValidLatitude(req.body.ceremonyLatitude)) {
        return res.status(400).json({
          success: false,
          message: "Ceremony latitude must be a valid number between -90 and 90.",
        });
      }
    }

    if (
      req.body.ceremonyLongitude !== undefined &&
      req.body.ceremonyLongitude !== null &&
      req.body.ceremonyLongitude !== ""
    ) {
      if (!isValidLongitude(req.body.ceremonyLongitude)) {
        return res.status(400).json({
          success: false,
          message: "Ceremony longitude must be a valid number between -180 and 180.",
        });
      }
    }

    // Venue validation: Reception
    if (req.body.receptionVenueName && req.body.receptionVenueName.length > 150) {
      return res.status(400).json({
        success: false,
        message: "Reception venue name cannot exceed 150 characters.",
      });
    }

    if (req.body.receptionAddress && req.body.receptionAddress.length > 300) {
      return res.status(400).json({
        success: false,
        message: "Reception address cannot exceed 300 characters.",
      });
    }

    if (
      req.body.receptionDescription &&
      req.body.receptionDescription.length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "Reception description cannot exceed 2000 characters.",
      });
    }

    if (
      req.body.receptionGoogleMapsUrl &&
      !isValidUrl(req.body.receptionGoogleMapsUrl)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid Reception Google Maps URL.",
      });
    }

    if (
      req.body.receptionLatitude !== undefined &&
      req.body.receptionLatitude !== null &&
      req.body.receptionLatitude !== ""
    ) {
      if (!isValidLatitude(req.body.receptionLatitude)) {
        return res.status(400).json({
          success: false,
          message: "Reception latitude must be a valid number between -90 and 90.",
        });
      }
    }

    if (
      req.body.receptionLongitude !== undefined &&
      req.body.receptionLongitude !== null &&
      req.body.receptionLongitude !== ""
    ) {
      if (!isValidLongitude(req.body.receptionLongitude)) {
        return res.status(400).json({
          success: false,
          message: "Reception longitude must be a valid number between -180 and 180.",
        });
      }
    }

    let wedding = await Wedding.findOne();

    if (!wedding) {
      wedding = new Wedding();
    }

    // Only update keys explicitly provided in req.body to preserve non-displayed fields
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        // Normalize empty string coordinates to null
        if (
          (field === "ceremonyLatitude" ||
            field === "ceremonyLongitude" ||
            field === "receptionLatitude" ||
            field === "receptionLongitude") &&
          (req.body[field] === "" || req.body[field] === null)
        ) {
          wedding[field] = null;
        } else if (
          field === "ceremonyLatitude" ||
          field === "ceremonyLongitude" ||
          field === "receptionLatitude" ||
          field === "receptionLongitude"
        ) {
          wedding[field] = Number(req.body[field]);
        } else {
          wedding[field] = req.body[field];
        }
      }
    });

    const updatedWedding = await wedding.save();

    res.json({
      success: true,
      message: "Wedding details updated successfully.",
      data: updatedWedding,
    });
  } catch (error) {
    console.error("Error updating wedding details:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating wedding details",
    });
  }
};

module.exports = {
  getWeddingDetails,
  updateWeddingDetails,
};
