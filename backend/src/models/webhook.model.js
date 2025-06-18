import mongoose, { Schema } from "mongoose";

const webhookSchema = new Schema(
  {
    repoUrl: {
      type: String,
      required: true,
      trim: true,
    },
    provider: {
      type: String,
      required: true,
    },
    secret: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

export const Webhook = mongoose.model("Webhook", webhookSchema);
