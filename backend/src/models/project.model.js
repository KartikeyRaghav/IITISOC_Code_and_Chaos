import mongoose, { Schema } from "mongoose";

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    isGithub: {
      type: Boolean,
      default: false,
    },
    github: {
      repoName: {
        type: String,
        required: true,
      },
      repositoryUrl: {
        type: String,
        trim: true,
      },
      branch: {
        type: String,
        default: "main",
        trim: true,
      },
      folder: {
        type: String,
        default: null,
        trim: true,
      },
    },
    clonedPath: {
      type: String,
      required: true,
    },
    deploymentHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Deployment",
        default: null,
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    framework: {
      type: String,
      required: true,
      trim: true,
    },
    customDomain: {
      type: String,
      trim: true,
      default: null,
    },
    livePort: {
      type: Number,
      default: null,
    },
    previewPort: {
      type: Number,
      default: null,
    },
    isLive: {
      type: Boolean,
      default: false,
    },
    sslStatus: {
      type: String,
      enum: ["pending", "issued", "failed"],
      default: "pending",
    },
    webhook: {
      type: Schema.Types.ObjectId,
      ref: "Webhook",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Project = mongoose.model("Project", projectSchema);
