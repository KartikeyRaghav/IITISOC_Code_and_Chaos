import { PageVisit } from "../models/pageVisit.model.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

export const trackPageVisit = asyncHandler(async (req, res) => {
  try {
    const { projectId } = req.body;
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];
    const referer = req.headers["referer"];

    await PageVisit.create({ projectId, ip, userAgent, referer });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging page visit" });
  }
});

export const getAnalytics = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const days = parseInt(req.query.days) || 30;
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);

  const visits = await PageVisit.aggregate([
    {
      $match: {
        projectId: new mongoose.Types.ObjectId(projectId),
        timestamp: { $gte: startDate },
      },
    },
    {
      $facet: {
        daily: [
          {
            $group: {
              _id: {
                year: { $year: "$timestamp" },
                month: { $month: "$timestamp" },
                day: { $dayOfMonth: "$timestamp" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
        ],
        weekly: [
          {
            $group: {
              _id: {
                year: { $isoWeekYear: "$timestamp" },
                week: { $isoWeek: "$timestamp" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.week": 1 } },
        ],
        monthly: [
          {
            $group: {
              _id: {
                year: { $year: "$timestamp" },
                month: { $month: "$timestamp" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ],
        uniqueVisitors: [
          {
            $group: {
              _id: "$ip",
              count: { $sum: 1 },
            },
          },
          {
            $group: {
              _id: null,
              uniqueCount: { $sum: 1 },
            },
          },
        ],
        referers: [
          {
            $group: {
              _id: "$referer",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ],
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: visits[0], // because facet returns a single element array
  });
});
