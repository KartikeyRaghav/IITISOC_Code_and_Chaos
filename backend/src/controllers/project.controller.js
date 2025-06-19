import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

export const getAllProjects = asyncHandler(async (req, res) => {
  try {
    const user_id = req.user._id;
    const projects = await Project.find({
      createdBy: user_id,
    });
    res.status(200).json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching projects" });
  }
});

export const getProject = asyncHandler(async (req, res) => {
  const { projectName } = req.query;
  console.log(projectName);

  if (!projectName) {
    res.status(400).json({ message: "Project name is required" });
  }

  try {
    const project = await Project.findOne({
      $and: [
        {
          name: projectName,
        },
        { createdBy: req.user._id },
      ],
    });
    res.status(200).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching project" });
  }
});

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

  try {
    const user = await User.findById(req.user._id);

    const project = await Project.create({
      name,
      branch,
      folder,
      repositoryUrl,
      framework,
      createdBy: user,
    });

    res.status(200).json({ message: "Project created" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating the project" });
  }
});
