import mongoose from "mongoose";

const envVarSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    key: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    isSecret: {
      type: Boolean,
      default: false,
    },
    environment: {
      type: String,
      enum: ["production", "preview"],
      default: "production",
    },
  },
  {
    timestamps: true,
  }
);

envVarSchema.index({ projectId: 1, key: 1, environment: 1 }, { unique: true });

export const EnvVar = mongoose.model("EnvVar", envVarSchema);
