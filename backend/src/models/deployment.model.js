import mongoose, { Schema } from "mongoose";

const deploymentSchema = new Schema(
  {
    version: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "in-preview", "deployed", "completed", "failed"],
      default: "pending",
    },
    imageName: {
      type: String,
      default: null,
      trim: true,
    },
    startTime: {
      type: Date,
      default: null,
    },
    endTime: {
      type: Date,
      default: null,
    },
    logs: [
      {
        log: { type: String, default: null },
        timestamp: { type: Date, default: null },
      },
    ],
    rollbackAvailable: {
      type: Boolean,
      default: true,
    },
    deployedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Deployment = mongoose.model("Deployment", deploymentSchema);
