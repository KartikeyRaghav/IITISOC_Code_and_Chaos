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
      enum: ["pending", "in-progress", "completed", "failed"],
      default: "pending",
    },
    logUrl: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: Date,
      default: Date.now(),
      required: true,
    },
    endTime: {
      type: Date,
      default: null,
    },
    previewUrl: {
      type: String,
      required: true,
      trim: true,
    },
    rollbackAvailable: {
      type: Boolean,
      default: false,
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
