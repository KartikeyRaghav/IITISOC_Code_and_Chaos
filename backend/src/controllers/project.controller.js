import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

export const checkName = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || name === "") {
    return res.status(400).json({ message: "No name sent" });
  }

  const project = Project.findOne({ name });

  if (project) {
    return res.status(200).json({ message: "Already exists" });
  }

  res.status(200).json({ message: "No project with this name found" });
});

export const createProject = asyncHandler(async (req, res) => {
  const { name, branch, folder, repositoryUrl, framework } = req.body;

  if (name === "Select a repo" || !branch) {
    return res.status(400).json({ message: "Name and branch are required" });
  }

  const user = await User.findById(req.user._id);

  const project = await Project.create({
    name,
    branch,
    folder,
    repositoryUrl,
    framework,
    createdBy: user,
  });
});