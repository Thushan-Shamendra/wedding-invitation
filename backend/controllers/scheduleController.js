const Schedule = require("../models/Schedule");

// @desc    Get all schedule events
// @route   GET /api/schedule
// @access  Public
const getScheduleEvents = async (req, res) => {
  try {
    const events = await Schedule.find().sort({ order: 1, startTime: 1 });
    res.json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Error retrieving schedule:", error);
    res.status(500).json({
      success: false,
      message: "Server error retrieving schedule events",
    });
  }
};

// @desc    Create a schedule event
// @route   POST /api/schedule
// @access  Private (Admin only)
const createScheduleEvent = async (req, res) => {
  try {
    const { eventName, eventDate, startTime, description, order } = req.body;

    if (!eventName || !eventName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Event name is required.",
      });
    }

    if (eventName.trim().length > 150) {
      return res.status(400).json({
        success: false,
        message: "Event name cannot exceed 150 characters.",
      });
    }

    if (!startTime || !startTime.trim()) {
      return res.status(400).json({
        success: false,
        message: "Start time is required.",
      });
    }

    if (description && description.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Description cannot exceed 1000 characters.",
      });
    }

    const orderNum = order !== undefined && order !== null && order !== "" ? Number(order) : 0;
    if (isNaN(orderNum) || orderNum < 0) {
      return res.status(400).json({
        success: false,
        message: "Order must be a valid non-negative number.",
      });
    }

    const event = await Schedule.create({
      eventName: eventName.trim(),
      eventDate: eventDate ? eventDate.trim() : "",
      startTime: startTime.trim(),
      description: description ? description.trim() : "",
      order: orderNum,
    });

    res.status(201).json({
      success: true,
      message: "Schedule event added successfully.",
      data: event,
    });
  } catch (error) {
    console.error("Error creating schedule event:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating schedule event",
    });
  }
};

// @desc    Update a schedule event
// @route   PUT /api/schedule/:id
// @access  Private (Admin only)
const updateScheduleEvent = async (req, res) => {
  try {
    const event = await Schedule.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Schedule event not found",
      });
    }

    const { eventName, eventDate, startTime, description, order } = req.body;

    if (eventName !== undefined) {
      if (!eventName.trim()) {
        return res.status(400).json({
          success: false,
          message: "Event name cannot be empty.",
        });
      }
      if (eventName.trim().length > 150) {
        return res.status(400).json({
          success: false,
          message: "Event name cannot exceed 150 characters.",
        });
      }
      event.eventName = eventName.trim();
    }

    if (startTime !== undefined) {
      if (!startTime.trim()) {
        return res.status(400).json({
          success: false,
          message: "Start time cannot be empty.",
        });
      }
      event.startTime = startTime.trim();
    }

    if (description !== undefined) {
      if (description.length > 1000) {
        return res.status(400).json({
          success: false,
          message: "Description cannot exceed 1000 characters.",
        });
      }
      event.description = description.trim();
    }

    if (eventDate !== undefined) {
      event.eventDate = eventDate.trim();
    }

    if (order !== undefined) {
      const orderNum = Number(order);
      if (isNaN(orderNum) || orderNum < 0) {
        return res.status(400).json({
          success: false,
          message: "Order must be a valid non-negative number.",
        });
      }
      event.order = orderNum;
    }

    const updatedEvent = await event.save();

    res.json({
      success: true,
      message: "Schedule event updated successfully.",
      data: updatedEvent,
    });
  } catch (error) {
    console.error("Error updating schedule event:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating schedule event",
    });
  }
};

// @desc    Delete a schedule event
// @route   DELETE /api/schedule/:id
// @access  Private (Admin only)
const deleteScheduleEvent = async (req, res) => {
  try {
    const event = await Schedule.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Schedule event not found",
      });
    }

    await Schedule.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Schedule event deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting schedule event:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting schedule event",
    });
  }
};

module.exports = {
  getScheduleEvents,
  createScheduleEvent,
  updateScheduleEvent,
  deleteScheduleEvent,
};
