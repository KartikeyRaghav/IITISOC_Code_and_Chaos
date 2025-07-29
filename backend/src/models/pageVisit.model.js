import { Schema, model } from "mongoose";

const pageVisitSchema = new Schema({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  timestamp: { type: Date, default: Date.now },
  ip: String,
  userAgent: String,
  referer: String,
  isBot: { type: Boolean, default: false },
});

export const PageVisit = model("PageVisit", pageVisitSchema);
