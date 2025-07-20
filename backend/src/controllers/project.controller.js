import getPort from "get-port";
import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import fs from "fs";
import { execSync } from "child_process";

export const getAllProjects = asyncHandler(async (req, res) => {
  try {
    const user_id = req.user._id;

    // Find all projects where the user is the creator
    const projects = await Project.find({ createdBy: user_id });

    res.status(200).json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching projects" });
  }
});

export const getProject = asyncHandler(async (req, res) => {
  const { projectName } = req.query;

  // Validate input
  if (!projectName) {
    return res.status(400).json({ message: "Project name is required" });
  }

  try {
    // Ensure the project belongs to the logged-in user
    const project = await Project.findOne({
      $and: [{ name: projectName }, { createdBy: req.user._id }],
    });

    res.status(200).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching project" });
  }
});

export const checkName = asyncHandler(async (req, res) => {
  const { name } = req.body;

  // Validate name
  if (!name || name === "") {
    return res.status(400).json({ message: "No name sent" });
  }

  // Check for existing project
  const project = await Project.findOne({ name });

  if (project) {
    return res.status(200).json({ message: "Already exists" });
  }

  res.status(200).json({ message: "No project with this name found" });
});

// Helper: Generate nginx config for subdomain reverse proxy
function generateNginxConfig(subdomain, port) {
  return `server {
  listen 80;
  server_name ${subdomain}.deploy.princecodes.online;

  location / {
    proxy_pass http://localhost:${port};
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}`;
}

// Helper: Write and reload nginx config
function writeNginxConfig(subdomain, port) {
  const configPath = `/etc/nginx/conf.d/projects/${subdomain}.conf`;
  const content = generateNginxConfig(subdomain, port);
  fs.writeFileSync(configPath, content);
  execSync("sudo nginx -s reload");
}

export const createProjectByGithub = asyncHandler(async (req, res) => {
  const {
    name,
    branch,
    folder,
    repositoryUrl,
    framework,
    repoName,
    clonedPath,
  } = req.body;

  // Validate required fields
  if (name === "Select a repo" || !branch || !clonedPath || !repoName) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Prevent duplicate project for the same repo and branch
    const repoProjectExists = await Project.findOne({
      $and: [{ repositoryUrl }, { branch }],
    });

    if (repoProjectExists) {
      return res
        .status(409)
        .json({ message: "A project for this repo already exists" });
    }

    // Get user data
    const user = await User.findById(req.user._id);
    const livePort = await getPort();
    const previewPort = await getPort();

    await writeNginxConfig(name, livePort);
    await writeNginxConfig(name + "-preview", previewPort);

    // Create a new project entry
    const project = await Project.create({
      name,
      isGithub: true,
      github: { branch, folder, repositoryUrl, repoName },
      framework,
      createdBy: user,
      clonedPath,
      livePort,
      previewPort,
    });

    res.status(200).json({ message: "Project created" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating the project" });
  }
});

export const createProjectByZip = asyncHandler(async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  res.status(200).json({
    message: "File uploaded successfully",
    filePath: req.file.path,
    originalName: req.file.originalname,
  });
});
