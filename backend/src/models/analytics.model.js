import mongoose, { Schema } from "mongoose";

const analyticsSchema = new Schema(
  {
    views: {
      type: Number,
    },
    uniqueVisitors: {
      type: Number,
    },
    responseTimes: [
      {
        type: Number,
      },
    ],
    uptime: {
      type: Number,
    },
    errors: {
      type: Number,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
  },
  { timestamps: true }
);

export const Analytics = mongoose.model("Analytics", analyticsSchema);
