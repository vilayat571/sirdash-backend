const mongoose = require("mongoose");

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    source: {
      type: String,
      enum: ["popup", "footer", "landing", "other"],
      default: "popup",
    },
    unsubscribedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Subscriber", subscriberSchema);
