const mongoose = require("mongoose");

const demoRequestSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
    },
    businessEmail: {
      type: String,
      required: [true, "Business email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: {
        values: ["pm", "analyst", "scientist", "engineer", "executive"],
        message: "Role must be one of: pm, analyst, scientist, engineer, executive",
      },
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "contacted", "scheduled", "completed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DemoRequest", demoRequestSchema);
