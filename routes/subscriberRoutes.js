const express = require("express");
const router = express.Router();
const {
  createSubscriber,
  getAllSubscribers,
  getSubscriberById,
  updateSubscriber,
  unsubscribeByEmail,
  deleteSubscriber,
} = require("../controllers/subscriberController");

// POST   /api/subscribers               → Subscribe with email
// GET    /api/subscribers               → Get all subscribers (with filters & pagination)
router.route("/").post(createSubscriber).get(getAllSubscribers);

// PATCH  /api/subscribers/unsubscribe   → Unsubscribe by email (must be before /:id)
router.patch("/unsubscribe", unsubscribeByEmail);

// GET    /api/subscribers/:id           → Get a single subscriber
// PUT    /api/subscribers/:id           → Update a subscriber
// DELETE /api/subscribers/:id           → Delete a subscriber
router.route("/:id").get(getSubscriberById).put(updateSubscriber).delete(deleteSubscriber);

module.exports = router;
