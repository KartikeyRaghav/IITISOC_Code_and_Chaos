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
    erros: {
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
