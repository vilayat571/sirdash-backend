const Subscriber = require("../models/Subscriber");

// ─── CREATE ──────────────────────────────────────────────────────────────────
// POST /api/subscribers
const createSubscriber = async (req, res) => {
  try {
    const { email, source } = req.body;

    // If email exists but was unsubscribed, reactivate it
    const existing = await Subscriber.findOne({ email: email?.toLowerCase() });

    if (existing) {
      if (existing.isActive) {
        return res.status(409).json({
          success: false,
          message: "This email is already subscribed.",
        });
      }
      // Reactivate
      existing.isActive = true;
      existing.unsubscribedAt = null;
      await existing.save();

      return res.status(200).json({
        success: true,
        message: "Welcome back! You've been resubscribed.",
        data: existing,
      });
    }

    const subscriber = await Subscriber.create({ email, source });

    res.status(201).json({
      success: true,
      message: "Successfully subscribed!",
      data: subscriber,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "This email is already subscribed." });
    }
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: errors[0], errors });
    }
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// ─── READ ALL ─────────────────────────────────────────────────────────────────
// GET /api/subscribers
const getAllSubscribers = async (req, res) => {
  try {
    const { isActive, source, page = 1, limit = 10, sort = "-createdAt" } = req.query;

    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (source) filter.source = source;

    const skip = (Number(page) - 1) * Number(limit);

    const [subscribers, total] = await Promise.all([
      Subscriber.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      Subscriber.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: subscribers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// ─── READ ONE ─────────────────────────────────────────────────────────────────
// GET /api/subscribers/:id
const getSubscriberById = async (req, res) => {
  try {
    const subscriber = await Subscriber.findById(req.params.id);

    if (!subscriber) {
      return res.status(404).json({ success: false, message: "Subscriber not found." });
    }

    res.status(200).json({ success: true, data: subscriber });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid subscriber ID." });
    }
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────
// PUT /api/subscribers/:id
const updateSubscriber = async (req, res) => {
  try {
    const allowedFields = ["email", "isActive", "source"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Track unsubscribe time
    if (updates.isActive === false) {
      updates.unsubscribedAt = new Date();
    } else if (updates.isActive === true) {
      updates.unsubscribedAt = null;
    }

    const subscriber = await Subscriber.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!subscriber) {
      return res.status(404).json({ success: false, message: "Subscriber not found." });
    }

    res.status(200).json({
      success: true,
      message: "Subscriber updated successfully.",
      data: subscriber,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "This email is already in use." });
    }
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: errors[0], errors });
    }
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid subscriber ID." });
    }
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// ─── UNSUBSCRIBE BY EMAIL ─────────────────────────────────────────────────────
// PATCH /api/subscribers/unsubscribe
const unsubscribeByEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const subscriber = await Subscriber.findOneAndUpdate(
      { email: email?.toLowerCase() },
      { $set: { isActive: false, unsubscribedAt: new Date() } },
      { new: true }
    );

    if (!subscriber) {
      return res.status(404).json({ success: false, message: "Email not found in our list." });
    }

    res.status(200).json({
      success: true,
      message: "You have been unsubscribed successfully.",
      data: subscriber,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
// DELETE /api/subscribers/:id
const deleteSubscriber = async (req, res) => {
  try {
    const subscriber = await Subscriber.findByIdAndDelete(req.params.id);

    if (!subscriber) {
      return res.status(404).json({ success: false, message: "Subscriber not found." });
    }

    res.status(200).json({
      success: true,
      message: "Subscriber deleted successfully.",
      data: subscriber,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid subscriber ID." });
    }
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

module.exports = {
  createSubscriber,
  getAllSubscribers,
  getSubscriberById,
  updateSubscriber,
  unsubscribeByEmail,
  deleteSubscriber,
};
