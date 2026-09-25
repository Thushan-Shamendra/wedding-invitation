const RSVP = require("../models/RSVP");
const Guest = require("../models/Guest");

// @desc    Public: Submit or update an RSVP response via invitation token
// @route   POST /api/rsvp/:token
// @access  Public
const submitRSVPByToken = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Invitation token is required.",
      });
    }

    const guest = await Guest.findOne({ invitationToken: token.trim() });
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found.",
      });
    }

    const { attendanceStatus, numberOfGuests, mealPreference, message } = req.body;

    // Validate attendanceStatus
    if (!attendanceStatus || !["attending", "declined"].includes(attendanceStatus.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Attendance status must be either 'attending' or 'declined'.",
      });
    }

    const normalizedStatus = attendanceStatus.toLowerCase();
    let guestCount = 0;

    if (normalizedStatus === "attending") {
      const parsedCount =
        numberOfGuests !== undefined && numberOfGuests !== null && numberOfGuests !== ""
          ? Number(numberOfGuests)
          : 1;

      if (isNaN(parsedCount) || !Number.isInteger(parsedCount) || parsedCount < 1) {
        return res.status(400).json({
          success: false,
          message: "Please specify a valid number of guests attending (at least 1).",
        });
      }

      if (parsedCount > guest.maximumGuests) {
        return res.status(400).json({
          success: false,
          message: `Your invitation permits up to ${guest.maximumGuests} guest${
            guest.maximumGuests > 1 ? "s" : ""
          }.`,
        });
      }

      guestCount = parsedCount;
    } else {
      // If declined, numberOfGuests is always 0
      guestCount = 0;
    }

    // Validate message length
    if (message && message.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 1000 characters.",
      });
    }

    // Check if an RSVP already exists for this guest (Upsert pattern)
    let rsvp = await RSVP.findOne({ guest: guest._id });

    if (rsvp) {
      // Update existing response
      rsvp.attendanceStatus = normalizedStatus;
      rsvp.numberOfGuests = guestCount;
      rsvp.mealPreference = mealPreference ? mealPreference.trim() : "";
      rsvp.message = message ? message.trim() : "";
      rsvp.submittedAt = new Date();
      await rsvp.save();
    } else {
      // Create new RSVP
      rsvp = await RSVP.create({
        guest: guest._id,
        attendanceStatus: normalizedStatus,
        numberOfGuests: guestCount,
        mealPreference: mealPreference ? mealPreference.trim() : "",
        message: message ? message.trim() : "",
        submittedAt: new Date(),
      });
    }

    // Synchronize Guest model rsvpStatus
    guest.rsvpStatus = normalizedStatus;
    await guest.save();

    res.status(200).json({
      success: true,
      message:
        normalizedStatus === "attending"
          ? "RSVP submitted! We look forward to celebrating with you."
          : "RSVP submitted. We're sorry you can't make it, but thank you for letting us know.",
      data: {
        attendanceStatus: rsvp.attendanceStatus,
        numberOfGuests: rsvp.numberOfGuests,
        mealPreference: rsvp.mealPreference,
        message: rsvp.message,
        submittedAt: rsvp.submittedAt,
      },
    });
  } catch (error) {
    console.error("Error submitting RSVP:", error);
    res.status(500).json({
      success: false,
      message: "Server error while processing RSVP submission.",
    });
  }
};

// @desc    Public: Get RSVP response for a specific invitation token (if exists)
// @route   GET /api/rsvp/invite/:token
// @access  Public
const getRSVPByToken = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Invitation token is required.",
      });
    }

    const guest = await Guest.findOne({ invitationToken: token.trim() });
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "Invitation not found.",
      });
    }

    const rsvp = await RSVP.findOne({ guest: guest._id });

    if (!rsvp) {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }

    // Return safe public fields
    res.status(200).json({
      success: true,
      data: {
        attendanceStatus: rsvp.attendanceStatus,
        numberOfGuests: rsvp.numberOfGuests,
        mealPreference: rsvp.mealPreference,
        message: rsvp.message,
        submittedAt: rsvp.submittedAt,
      },
    });
  } catch (error) {
    console.error("Error retrieving RSVP by token:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving RSVP response.",
    });
  }
};

// @desc    Admin: Get all RSVP responses with search, status filter, and optional limit
// @route   GET /api/rsvp
// @access  Private (Admin only)
const getRSVPResponses = async (req, res) => {
  try {
    const { search, status, limit } = req.query;
    const filter = {};

    if (status && status !== "all") {
      filter.attendanceStatus = status.toLowerCase();
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      // Find matching guest IDs by name, email, or phone
      const matchingGuests = await Guest.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
        ],
      }).select("_id");

      const guestIds = matchingGuests.map((g) => g._id);

      filter.$or = [
        { guest: { $in: guestIds } },
        { message: searchRegex },
        { mealPreference: searchRegex },
      ];
    }

    let query = RSVP.find(filter)
      .populate("guest", "name email phone maximumGuests invitationToken rsvpStatus")
      .sort({ submittedAt: -1, createdAt: -1 });

    if (limit && !isNaN(Number(limit))) {
      query = query.limit(Number(limit));
    }

    const rsvps = await query.exec();

    // Filter out any RSVP where guest was deleted
    const validRsvps = rsvps.filter((r) => r.guest !== null);

    res.status(200).json({
      success: true,
      count: validRsvps.length,
      data: validRsvps,
    });
  } catch (error) {
    console.error("Error retrieving RSVP responses:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving RSVP responses.",
    });
  }
};

// @desc    Admin: Get RSVP statistics summary
// @route   GET /api/rsvp/stats/summary
// @access  Private (Admin only)
const getRSVPStats = async (req, res) => {
  try {
    const [totalResponses, attendingResponses, declinedResponses, attendingSum, pendingGuests] =
      await Promise.all([
        RSVP.countDocuments(),
        RSVP.countDocuments({ attendanceStatus: "attending" }),
        RSVP.countDocuments({ attendanceStatus: "declined" }),
        RSVP.aggregate([
          { $match: { attendanceStatus: "attending" } },
          { $group: { _id: null, total: { $sum: "$numberOfGuests" } } },
        ]),
        Guest.countDocuments({ rsvpStatus: "pending" }),
      ]);

    const totalGuestsAttending =
      attendingSum.length > 0 && attendingSum[0].total ? attendingSum[0].total : 0;

    res.status(200).json({
      success: true,
      data: {
        totalResponses,
        attendingResponses,
        declinedResponses,
        totalGuestsAttending,
        pendingGuests,
      },
    });
  } catch (error) {
    console.error("Error calculating RSVP statistics:", error);
    res.status(500).json({
      success: false,
      message: "Server error calculating RSVP statistics.",
    });
  }
};

// @desc    Admin: Get single RSVP response by ID
// @route   GET /api/rsvp/:id
// @access  Private (Admin only)
const getRSVPById = async (req, res) => {
  try {
    const rsvp = await RSVP.findById(req.params.id).populate(
      "guest",
      "name email phone maximumGuests invitationToken rsvpStatus"
    );

    if (!rsvp) {
      return res.status(404).json({
        success: false,
        message: "RSVP response not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: rsvp,
    });
  } catch (error) {
    console.error("Error retrieving RSVP by ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving RSVP details.",
    });
  }
};

// @desc    Admin: Update an RSVP response
// @route   PUT /api/rsvp/:id
// @access  Private (Admin only)
const updateRSVP = async (req, res) => {
  try {
    const rsvp = await RSVP.findById(req.params.id).populate("guest");

    if (!rsvp) {
      return res.status(404).json({
        success: false,
        message: "RSVP response not found.",
      });
    }

    const { attendanceStatus, numberOfGuests, mealPreference, message } = req.body;

    if (attendanceStatus !== undefined) {
      const normalizedStatus = attendanceStatus.toLowerCase();
      if (!["attending", "declined"].includes(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          message: "Attendance status must be 'attending' or 'declined'.",
        });
      }
      rsvp.attendanceStatus = normalizedStatus;
    }

    if (rsvp.attendanceStatus === "declined") {
      rsvp.numberOfGuests = 0;
    } else if (numberOfGuests !== undefined) {
      const parsedCount = Number(numberOfGuests);
      const maxAllowed = rsvp.guest ? rsvp.guest.maximumGuests : 20;

      if (isNaN(parsedCount) || !Number.isInteger(parsedCount) || parsedCount < 1) {
        return res.status(400).json({
          success: false,
          message: "Number of guests must be at least 1.",
        });
      }

      if (parsedCount > maxAllowed) {
        return res.status(400).json({
          success: false,
          message: `Number of guests cannot exceed guest limit of ${maxAllowed}.`,
        });
      }

      rsvp.numberOfGuests = parsedCount;
    }

    if (mealPreference !== undefined) {
      rsvp.mealPreference = mealPreference.trim();
    }

    if (message !== undefined) {
      if (message.length > 1000) {
        return res.status(400).json({
          success: false,
          message: "Message cannot exceed 1000 characters.",
        });
      }
      rsvp.message = message.trim();
    }

    await rsvp.save();

    // Synchronize Guest model rsvpStatus
    if (rsvp.guest) {
      await Guest.findByIdAndUpdate(rsvp.guest._id, {
        rsvpStatus: rsvp.attendanceStatus,
      });
    }

    const updatedRSVP = await RSVP.findById(rsvp._id).populate(
      "guest",
      "name email phone maximumGuests invitationToken rsvpStatus"
    );

    res.status(200).json({
      success: true,
      message: "RSVP response updated successfully.",
      data: updatedRSVP,
    });
  } catch (error) {
    console.error("Error updating RSVP:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating RSVP response.",
    });
  }
};

// @desc    Admin: Delete an RSVP response (resets guest rsvpStatus to pending)
// @route   DELETE /api/rsvp/:id
// @access  Private (Admin only)
const deleteRSVP = async (req, res) => {
  try {
    const rsvp = await RSVP.findById(req.params.id);

    if (!rsvp) {
      return res.status(404).json({
        success: false,
        message: "RSVP response not found.",
      });
    }

    const guestId = rsvp.guest;

    await RSVP.findByIdAndDelete(req.params.id);

    // Reset guest rsvpStatus to pending (do NOT delete the guest)
    if (guestId) {
      await Guest.findByIdAndUpdate(guestId, {
        rsvpStatus: "pending",
      });
    }

    res.status(200).json({
      success: true,
      message: "RSVP response deleted and guest status reset to pending.",
    });
  } catch (error) {
    console.error("Error deleting RSVP:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting RSVP response.",
    });
  }
};

module.exports = {
  submitRSVPByToken,
  getRSVPByToken,
  getRSVPResponses,
  getRSVPStats,
  getRSVPById,
  updateRSVP,
  deleteRSVP,
};
