import mongoose, { Schema } from "mongoose";

const webhookEventSchema = new Schema(
  {
    repo: {
      type: String,
      required: true,
    },
    installation_id: {
      type: Number,
      required: true,
    },
    event_type: {
      type: String,
      required: true,
      enum: ["push", "pull_request", "installation"],
    },
    ref: String,
    commit: String,
    status: {
      type: String,
      default: "received",
      enum: ["received", "deployed", "error"],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    rawPayload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

export const WebhookEvent = mongoose.model("WebhookEvent", webhookEventSchema);
