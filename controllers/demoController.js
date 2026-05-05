const DemoRequest = require("../models/DemoRequest");

// ─── CREATE ──────────────────────────────────────────────────────────────────
// POST /api/demos
const createDemoRequest = async (req, res) => {
  try {
    const { fullName, businessEmail, company, role, message } = req.body;

    // Check for duplicate email (one active request at a time)
    const existing = await DemoRequest.findOne({
      businessEmail: businessEmail?.toLowerCase(),
      status: { $in: ["pending", "contacted", "scheduled"] },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A demo request with this email is already pending.",
      });
    }

    const demo = await DemoRequest.create({
      fullName,
      businessEmail,
      company,
      role,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Demo request submitted successfully.",
      data: demo,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: errors[0], errors });
    }
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// ─── READ ALL ─────────────────────────────────────────────────────────────────
// GET /api/demos
const getAllDemoRequests = async (req, res) => {
  try {
    const { status, role, page = 1, limit = 10, sort = "-createdAt" } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (role) filter.role = role;

    const skip = (Number(page) - 1) * Number(limit);

    const [demos, total] = await Promise.all([
      DemoRequest.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      DemoRequest.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: demos,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// ─── READ ONE ─────────────────────────────────────────────────────────────────
// GET /api/demos/:id
const getDemoRequestById = async (req, res) => {
  try {
    const demo = await DemoRequest.findById(req.params.id);

    if (!demo) {
      return res.status(404).json({ success: false, message: "Demo request not found." });
    }

    res.status(200).json({ success: true, data: demo });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid demo request ID." });
    }
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────
// PUT /api/demos/:id
const updateDemoRequest = async (req, res) => {
  try {
    const allowedFields = ["fullName", "businessEmail", "company", "role", "message", "status"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const demo = await DemoRequest.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!demo) {
      return res.status(404).json({ success: false, message: "Demo request not found." });
    }

    res.status(200).json({
      success: true,
      message: "Demo request updated successfully.",
      data: demo,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: errors[0], errors });
    }
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid demo request ID." });
    }
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────
// DELETE /api/demos/:id
const deleteDemoRequest = async (req, res) => {
  try {
    const demo = await DemoRequest.findByIdAndDelete(req.params.id);

    if (!demo) {
      return res.status(404).json({ success: false, message: "Demo request not found." });
    }

    res.status(200).json({
      success: true,
      message: "Demo request deleted successfully.",
      data: demo,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid demo request ID." });
    }
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

module.exports = {
  createDemoRequest,
  getAllDemoRequests,
  getDemoRequestById,
  updateDemoRequest,
  deleteDemoRequest,
};
