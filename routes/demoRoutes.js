const express = require("express");
const router = express.Router();
const {
  createDemoRequest,
  getAllDemoRequests,
  getDemoRequestById,
  updateDemoRequest,
  deleteDemoRequest,
} = require("../controllers/demoController");

// POST   /api/demos          → Submit a new demo request
// GET    /api/demos          → Get all demo requests (with filters & pagination)
router.route("/").post(createDemoRequest).get(getAllDemoRequests);

// GET    /api/demos/:id      → Get a single demo request
// PUT    /api/demos/:id      → Update a demo request
// DELETE /api/demos/:id      → Delete a demo request
router.route("/:id").get(getDemoRequestById).put(updateDemoRequest).delete(deleteDemoRequest);

module.exports = router;
