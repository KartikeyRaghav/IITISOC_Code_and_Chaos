import mongoose from "mongoose";
import { PageVisit } from "../models/pageVisit.model.js";
import { Project } from "../models/project.model.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { isbot } from "isbot";

export const trackPageVisit = asyncHandler(async (req, res) => {
  try {
    const { projectId } = req.body;
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];
    const referer = req.headers["referer"];

    const isBotRequest = isbot(userAgent);

    await PageVisit.create({
      projectId,
      ip,
      userAgent,
      referer,
      isBot: isBotRequest,
    });
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

  const project = await Project.findOne({ _id: projectId });

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
    data: visits[0],
    projectName: project.name,
  });
});

export const getUserProjectsWithAnalytics = asyncHandler(async (req, res) => {
  // 1. Get all projects by user
  const projects = await Project.find({ createdBy: req.user._id });

  const projectIds = projects.map((proj) => proj._id);

  // 2. Get analytics data grouped by projectId
  const analytics = await PageVisit.aggregate([
    {
      $match: {
        projectId: { $in: projectIds },
      },
    },
    {
      $group: {
        _id: "$projectId",
        totalVisits: { $sum: 1 },
        uniqueVisitors: { $addToSet: "$ip" }, // collect unique IPs
        lastVisitedAt: { $max: "$timestamp" },
      },
    },
    {
      $project: {
        _id: 1,
        totalVisits: 1,
        uniqueVisitors: { $size: "$uniqueVisitors" },
        lastVisitedAt: 1,
      },
    },
  ]);

  // 3. Map analytics to project list
  const analyticsMap = new Map(analytics.map((a) => [a._id.toString(), a]));

  const result = projects.map((project) => {
    const data = analyticsMap.get(project._id.toString()) || {
      totalVisits: 0,
      uniqueVisitors: 0,
      lastVisitedAt: null,
    };

    return {
      projectId: project._id,
      isLive: project.isLive,
      name: project.name,
      totalVisits: data.totalVisits,
      uniqueVisitors: data.uniqueVisitors,
      lastVisitedAt: data.lastVisitedAt,
    };
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});
