import getPort from "get-port";
import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import fs from "fs";
import { execSync } from "child_process";
import { detectTechStackAndReturn } from "./build.controller.js";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import extract from "extract-zip";
import { rm } from "fs/promises";

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
function generateNginxConfig(subdomain, port, projectId) {
  return `server {
  listen 80;
  server_name ${subdomain}.deploy.princecodes.online;

  # Redirect all HTTP to HTTPS
  return 301 https://${subdomain}.deploy.princecodes.online$request_uri;
}

server {
  listen 443 ssl;
  server_name ${subdomain}.deploy.princecodes.online;

  ssl_certificate /etc/letsencrypt/live/deploy.princecodes.online/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/deploy.princecodes.online/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_prefer_server_ciphers on;

  location / {
    proxy_pass http://localhost:${port};
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    sub_filter '</head>' '<script>window.__PROJECT_ID__="${projectId}";</script><script src="https://deploy.princecodes.online/analytics.js"></script></head>';
    sub_filter_once off;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    proxy_set_header Accept-Encoding "";
  }
}`;
}

// Helper: Write and reload nginx config
function writeNginxConfig(subdomain, port, projectId) {
  const configPath = `/etc/nginx/conf.d/projects/${subdomain}.conf`;
  const content = generateNginxConfig(subdomain, port, projectId);
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

    await writeNginxConfig(name, livePort, project._id);
    await writeNginxConfig(name + "-preview", previewPort, project._id);

    await rm(clonedPath, { recursive: true, force: true });

    res.status(200).json({ message: "Project created" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating the project" });
  }
});

export const createProjectByZip = asyncHandler(async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    console.log("file done");
    // 1. Create a unique directory to unzip
    const unzipPath = path.resolve(`./temp/unzipped/${uuidv4()}`);
    fs.mkdirSync(unzipPath, { recursive: true });

    // 2. Unzip if it's a zip file
    if (
      file.mimetype === "application/zip" ||
      file.originalname.endsWith(".zip")
    ) {
      console.log(file.originalname);
      await extract(file.path, { dir: unzipPath });
    } else {
      // It's a single HTML file
      fs.copyFileSync(file.path, path.join(unzipPath, "index.html"));
    }
    console.log("unzip done");

    // 3. Detect framework
    const framework = await detectTechStackAndReturn(
      unzipPath,
      file.mimetype === "application/zip" || file.originalname.endsWith(".zip")
        ? file.originalname.split(".zip")[0]
        : null
    );
    console.log(framework);
    // 4. Validate framework
    if (
      !["react", "next", "static", "vue", "angular", "node-api"].includes(
        framework
      )
    ) {
      return res
        .status(400)
        .json({ error: `Unsupported tech stack: ${framework}` });
    }
    console.log("framework done");

    const livePort = await getPort();
    const previewPort = await getPort();
    console.log("port done");

    // 5. Create
    const project = await Project.create({
      name: req.body.name, // Get name from formData
      isGithub: false,
      clonedPath: unzipPath,
      createdBy: req.user._id, // if auth middleware is used
      framework,
      livePort,
      previewPort,
    });

    await writeNginxConfig(req.body.name, livePort, project._id);
    await writeNginxConfig(
      req.body.name + "-preview",
      previewPort,
      project._id
    );

    return res.status(201).json({ success: true, project });
  } catch (error) {
    console.error("Error creating project by zip:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export const toggleAutoDeploy = asyncHandler(async (req, res) => {
  const { projectId, isAutoDeploy } = req.body;

  const project = await Project.findByIdAndUpdate(
    { _id: projectId },
    { $set: { isAutoDeploy } }
  );

  res.status(200).json({ isAutoDeploy: project.isAutoDeploy });
});
