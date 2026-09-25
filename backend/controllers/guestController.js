const crypto = require("crypto");
const Guest = require("../models/Guest");

// Helper to generate a unique readable invitation token
const generateInvitationToken = async (name) => {
  let slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!slug) {
    slug = "guest";
  }

  let token = `${slug}-${crypto.randomBytes(2).toString("hex")}`;

  // Guarantee uniqueness
  let exists = await Guest.findOne({ invitationToken: token });
  while (exists) {
    token = `${slug}-${crypto.randomBytes(2).toString("hex")}`;
    exists = await Guest.findOne({ invitationToken: token });
  }

  return token;
};

// @desc    Get all guests with optional search and status filter
// @route   GET /api/guests
// @access  Private (Admin only)
const getGuests = async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (status && status !== "all") {
      query.rsvpStatus = status.toLowerCase();
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    const guests = await Guest.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: guests.length,
      data: guests,
    });
  } catch (error) {
    console.error("Error retrieving guests:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving guest list",
    });
  }
};

// @desc    Get guest summary statistics
// @route   GET /api/guests/stats/summary
// @access  Private (Admin only)
const getGuestStats = async (req, res) => {
  try {
    const [totalGuests, attending, declined, pending] = await Promise.all([
      Guest.countDocuments(),
      Guest.countDocuments({ rsvpStatus: "attending" }),
      Guest.countDocuments({ rsvpStatus: "declined" }),
      Guest.countDocuments({ rsvpStatus: "pending" }),
    ]);

    res.json({
      success: true,
      data: {
        totalGuests,
        attending,
        declined,
        pending,
      },
    });
  } catch (error) {
    console.error("Error calculating guest stats:", error);
    res.status(500).json({
      success: false,
      message: "Server error calculating guest statistics",
    });
  }
};

// @desc    Get single guest by ID
// @route   GET /api/guests/:id
// @access  Private (Admin only)
const getGuestById = async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id);

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "Guest not found",
      });
    }

    res.json({
      success: true,
      data: guest,
    });
  } catch (error) {
    console.error("Error retrieving guest:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving guest details",
    });
  }
};

// @desc    Create a new guest & generate personalized invitation token
// @route   POST /api/guests
// @access  Private (Admin only)
const createGuest = async (req, res) => {
  try {
    const { name, email, phone, maximumGuests, personalMessage } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Guest name is required.",
      });
    }

    if (name.trim().length > 150) {
      return res.status(400).json({
        success: false,
        message: "Guest name cannot exceed 150 characters.",
      });
    }

    const maxGuestsNum =
      maximumGuests !== undefined && maximumGuests !== null && maximumGuests !== ""
        ? Number(maximumGuests)
        : 1;

    if (isNaN(maxGuestsNum) || maxGuestsNum < 1 || maxGuestsNum > 20) {
      return res.status(400).json({
        success: false,
        message: "Maximum guests must be a number between 1 and 20.",
      });
    }

    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address.",
        });
      }
    }

    if (personalMessage && personalMessage.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Personal message cannot exceed 1000 characters.",
      });
    }

    const invitationToken = await generateInvitationToken(name);

    const guest = await Guest.create({
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : "",
      phone: phone ? phone.trim() : "",
      maximumGuests: maxGuestsNum,
      personalMessage: personalMessage ? personalMessage.trim() : "",
      invitationToken,
      rsvpStatus: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Guest created successfully.",
      data: guest,
    });
  } catch (error) {
    console.error("Error creating guest:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating guest",
    });
  }
};

// @desc    Update guest information (keeps invitationToken stable)
// @route   PUT /api/guests/:id
// @access  Private (Admin only)
const updateGuest = async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id);

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "Guest not found",
      });
    }

    const { name, email, phone, maximumGuests, personalMessage, rsvpStatus } =
      req.body;

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Guest name cannot be empty.",
        });
      }
      if (name.trim().length > 150) {
        return res.status(400).json({
          success: false,
          message: "Guest name cannot exceed 150 characters.",
        });
      }
      guest.name = name.trim();
    }

    if (email !== undefined) {
      if (email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
          return res.status(400).json({
            success: false,
            message: "Please provide a valid email address.",
          });
        }
      }
      guest.email = email.trim().toLowerCase();
    }

    if (phone !== undefined) {
      guest.phone = phone.trim();
    }

    if (maximumGuests !== undefined) {
      const maxGuestsNum = Number(maximumGuests);
      if (isNaN(maxGuestsNum) || maxGuestsNum < 1 || maxGuestsNum > 20) {
        return res.status(400).json({
          success: false,
          message: "Maximum guests must be a number between 1 and 20.",
        });
      }
      guest.maximumGuests = maxGuestsNum;
    }

    if (personalMessage !== undefined) {
      if (personalMessage.length > 1000) {
        return res.status(400).json({
          success: false,
          message: "Personal message cannot exceed 1000 characters.",
        });
      }
      guest.personalMessage = personalMessage.trim();
    }

    if (rsvpStatus !== undefined) {
      const validStatuses = ["pending", "attending", "declined"];
      if (!validStatuses.includes(rsvpStatus.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: "Status must be pending, attending, or declined.",
        });
      }
      guest.rsvpStatus = rsvpStatus.toLowerCase();
    }

    // Notice: invitationToken is intentionally NOT modified to keep links permanent!
    const updatedGuest = await guest.save();

    res.json({
      success: true,
      message: "Guest updated successfully.",
      data: updatedGuest,
    });
  } catch (error) {
    console.error("Error updating guest:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating guest details",
    });
  }
};

// @desc    Delete a guest
// @route   DELETE /api/guests/:id
// @access  Private (Admin only)
const deleteGuest = async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id);

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "Guest not found",
      });
    }

    await Guest.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Guest deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting guest:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting guest",
    });
  }
};

// @desc    Get public personalized invitation details by token
// @route   GET /api/guests/invite/:token
// @access  Public
const getGuestByInvitationToken = async (req, res) => {
  try {
    const guest = await Guest.findOne({
      invitationToken: req.params.token.trim(),
    });

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found",
      });
    }

    // Expose only public-safe fields (omit phone, email, internal IDs)
    res.json({
      success: true,
      data: {
        name: guest.name,
        personalMessage: guest.personalMessage,
        maximumGuests: guest.maximumGuests,
        invitationToken: guest.invitationToken,
        rsvpStatus: guest.rsvpStatus,
      },
    });
  } catch (error) {
    console.error("Error retrieving invitation:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving personalized invitation",
    });
  }
};

module.exports = {
  getGuests,
  getGuestStats,
  getGuestById,
  createGuest,
  updateGuest,
  deleteGuest,
  getGuestByInvitationToken,
};
