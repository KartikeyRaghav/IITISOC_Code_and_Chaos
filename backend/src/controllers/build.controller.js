// Import utility for async error handling
import { asyncHandler } from "../utils/asyncHandler.util.js";

// Node.js built-in modules for command execution and file handling
import { execSync, spawn } from "child_process";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import {
  createDeploymentAndReturn,
  deployAndReturn,
  getVersionAndReturn,
} from "./deployment.controller.js";
import { Project } from "../models/project.model.js";
import { Deployment } from "../models/deployment.model.js";
import { rm } from "fs/promises";
import { EnvVar } from "../models/envVar.model.js";

// Get the current directory of the file (for ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Temporary directory to store cloned repositories
const TEMP_DIR = path.join(__dirname, "../../temp/repo_temp");

// Utility function to check if a cloned repo already exists
const checkCloneExists = async (pathName) => {
  try {
    const result = fs.existsSync(pathName);
    return result;
  } catch {
    return false;
  }
};

// Route handler to clone or pull a repository
export const cloneRepo = asyncHandler(async (req, res) => {
  const { repoName, cloneUrl, branch } = req.body;

  const targetDir = path.join(TEMP_DIR, repoName);

  // Ensure temp directory exists
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }

  // Set headers for streaming response
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Transfer-Encoding", "chunked");
  res.setHeader("Access-Control-Allow-Origin", `${process.env.FRONTEND_URL}`);
  res.setHeader("Access-Control-Allow-Credentials", "true");

  let clone = null;

  // If repo exists, pull the latest changes; otherwise clone
  const cloneExists = await checkCloneExists(targetDir);
  if (cloneExists) {
    clone = spawn("git", ["-C", targetDir, "pull"]);
  } else {
    clone = spawn("git", ["clone", "-b", branch, cloneUrl, targetDir]);
  }

  // Stream stdout to response
  clone.stdout.on("data", (data) => {
    res.write(`${data.toString()}\n\n`);
  });

  // Stream stderr to response
  clone.stderr.on("data", (data) => {
    res.write(`${data.toString()}\n\n`);
  });

  // Notify when cloning is complete
  clone.on("close", (code) => {
    res.write(`Git clone exited with code ${code}\n\n`);
    res.write(`[CLONE_COMPLETE] ${targetDir}\n\n`);
    res.end();
  });

  // Handle client disconnection
  req.on("close", () => {
    clone.kill();
  });
});

export const cloneRepositoryAndReturnPath = async (
  repoName,
  cloneUrl,
  branch
) => {
  const targetDir = path.join(TEMP_DIR, repoName);

  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }

  const cloneExists = await checkCloneExists(targetDir);

  const clone = cloneExists
    ? await execSync(`git -C ${targetDir} pull`)
    : await execSync(`git clone b ${branch} ${cloneUrl} ${targetDir}`);

  return targetDir;
};

// Route handler to detect the technology stack of the cloned project
export const detectTechStack = asyncHandler(async (req, res) => {
  const { clonedPath } = req.body;

  if (!clonedPath || !fs.existsSync(clonedPath)) {
    return res.status(400).json({ message: "Invalid cloned path" });
  }

  const packagePath = path.join(clonedPath, "package.json");

  // Detect using package.json dependencies
  if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
    const deps = pkg.dependencies || {};

    if (deps.next) return res.status(200).json({ stack: "next" });
    if (deps.react) return res.status(200).json({ stack: "react" });
    if (deps.vue) return res.status(200).json({ stack: "vue" });
    if (deps["@angular/core"])
      return res.status(200).json({ stack: "angular" });
    if (deps.svelte) return res.status(200).json({ stack: "svelte" });
    if (deps.express || deps.koa)
      return res.status(200).json({ stack: "node-api" });
  }

  // Fallback to checking for static HTML files
  const files = fs.readdirSync(clonedPath);
  if (files.some((f) => f.endsWith(".html")))
    return res.status(200).json({ stack: "static" });

  // Unknown stack
  res.status(400).json({ message: "unknown" });
});

export const detectTechStackAndReturn = async (clonedPath, projectName) => {
  if (!clonedPath || !fs.existsSync(clonedPath)) {
    return null;
  }

  console.log(clonedPath);
  let packagePath;
  if (projectName)
    packagePath = path.join(clonedPath, projectName, "package.json");
  else packagePath = path.join(clonedPath, "package.json");
  
  // Detect using package.json dependencies
  if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, "utf-8"));
    const deps = pkg.dependencies || {};
    console.log(deps);
    if (deps.next) return "next";
    if (deps.react) return "react";
    if (deps.vue) return "vue";
    if (deps["@angular/core"]) return "angular";
    if (deps.svelte) return "svelte";
    if (deps.express || deps.koa) return "node-api";
  }

  // Fallback to checking for static HTML files
  const files = fs.readdirSync(clonedPath);
  if (files.some((f) => f.endsWith(".html"))) return "static";

  // Unknown stack
  return "unknown";
};

// Utility to generate Dockerfile content based on tech stack
function generateDockerfileContent(stack, projectName) {
  switch (stack) {
    case "react":
    case "vue":
    case "svelte":
      return `FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`;

    case "next":
      return `FROM node:18
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "start"]`;

    case "angular":
      return `FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build --prod

# Change 'your-app-name' below to your Angular app's actual name
FROM nginx:alpine
COPY --from=builder /app/dist/${projectName} /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`;

    case "node-api":
      return `FROM node:18
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["node", "index.js"]`;

    case "static":
      return `FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`;

    default:
      return `# Unknown stack\n# Manual Dockerfile creation required.`;
  }
}

// Route handler to create Dockerfile in the cloned repo
export const generateDockerFile = asyncHandler(async (req, res) => {
  const { clonedPath, techStack, projectName } = req.body;

  if (!clonedPath || !fs.existsSync(clonedPath) || !techStack) {
    return res
      .status(400)
      .json({ message: "Invalid or missing clonedPath or techStack" });
  }

  const project = await Project.findOne({ name: projectName });

  if (!project) {
    return res.status(400).json({ message: "No project found" });
  }

  const envs = await EnvVar.find({ projectId: project._id });

  const envContent = Object.entries(envs)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  // Write to `.env` in the cloned repo directory
  fs.writeFileSync(path.join(clonedPath, ".env"), envContent);

  const dockerfileContent = generateDockerfileContent(techStack, projectName);
  const dockerfilePath = path.join(clonedPath, "Dockerfile");

  // Write Dockerfile
  fs.writeFileSync(dockerfilePath, dockerfileContent);

  res.status(200).json({
    message: "Dockerfile generated successfully",
    dockerfilePath,
    stack: techStack,
  });
});

const generateDockerFileAndReturn = async (
  projectId,
  clonedPath,
  techStack
) => {
  if (!clonedPath || !fs.existsSync(clonedPath) || !techStack) {
    return null;
  }

  const envs = await EnvVar.find({ projectId });

  const envContent = Object.entries(envs)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  // Write to `.env` in the cloned repo directory
  fs.writeFileSync(path.join(clonedPath, ".env"), envContent);

  const dockerfileContent = generateDockerfileContent(techStack, projectId);
  const dockerfilePath = path.join(clonedPath, "Dockerfile");

  // Write Dockerfile
  fs.writeFileSync(dockerfilePath, dockerfileContent);

  return true;
};

// Route handler to build Docker image
export const generateDockerImage = asyncHandler(async (req, res) => {
  const { projectName, clonedPath, deploymentId } = req.body;
  if (!projectName || !clonedPath) {
    return res
      .status(400)
      .json({ message: "Missing repo name or cloned path" });
  }

  if (!deploymentId) {
    return res.status(400).json({ message: "Missing deployment id" });
  }

  const project = await Project.findOne({ name: projectName });

  const deployment = await Deployment.findById(deploymentId);
  const imageName = `app-${projectName.toLowerCase()}-${Date.now()}`;

  try {
    // Set headers for chunked streaming
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Access-Control-Allow-Origin", `${process.env.FRONTEND_URL}`);
    res.setHeader("Access-Control-Allow-Credentials", "true");

    // Build Docker image
    const build = spawn("docker", ["build", "-t", imageName, clonedPath]);

    build.stdout.on("data", (data) => {
      deployment.logs = [
        ...deployment.logs,
        { log: data.toString(), timestamp: new Date() },
      ];
      res.write(`${data.toString()}\n\n`);
    });

    build.stderr.on("data", (data) => {
      deployment.logs = [
        ...deployment.logs,
        { log: data.toString(), timestamp: new Date() },
      ];
      res.write(`${data.toString()}\n\n`);
    });

    build.on("close", async (code) => {
      res.write(`Docker image build exited with code ${code}\n\n`);
      if (code === 0) {
        deployment.logs = [
          ...deployment.logs,
          { log: `[BUILD_COMPLETE] ${imageName}\n\n`, timestamp: new Date() },
        ];
        deployment.imageName = imageName;
        res.write(`[BUILD_COMPLETE] ${imageName}\n\n`);
      } else {
        deployment.logs = [
          ...deployment.logs,
          {
            log: `[ERROR] Step failed with code ${code}\n\n`,
            timestamp: new Date(),
          },
        ];
        deployment.status = "failed";
        res.write(`[ERROR] Step failed with code ${code}\n\n`);
      }

      await rm(project.clonedPath, { recursive: true, force: true });

      await deployment.save({
        validateBeforeSave: false,
        optimisticConcurrency: false,
      });
      res.end();
    });

    req.on("close", () => {
      build.kill();
    });
  } catch (err) {
    console.error("Docker error:", err);
    res.status(500).json({ message: "Docker build failed", details: err });
  }
});

const generateDockerImageAndReturn = (
  projectName,
  clonedPath,
  deploymentId
) => {
  return new Promise((resolve, reject) => {
    if (!projectName || !clonedPath || !deploymentId) return resolve(null);

    const imageName = `app-${projectName.toLowerCase()}-${Date.now()}`;
    const build = spawn("docker", ["build", "-t", imageName, clonedPath]);

    build.stdout.on("data", async (data) => {
      await Deployment.findByIdAndUpdate(deploymentId, {
        $push: {
          logs: { $each: [{ log: data.toString(), timestamp: new Date() }] },
        },
      });
    });

    build.stderr.on("data", async (data) => {
      await Deployment.findByIdAndUpdate(deploymentId, {
        $push: {
          logs: { $each: [{ log: data.toString(), timestamp: new Date() }] },
        },
      });
    });

    build.on("close", async (code) => {
      if (code === 0) {
        await Deployment.findByIdAndUpdate(deploymentId, {
          $push: {
            logs: {
              $each: [
                { log: `[BUILD_COMPLETE] ${imageName}`, timestamp: new Date() },
              ],
            },
          },
          $set: { imageName },
        });
        resolve(imageName);
      } else {
        await Deployment.findByIdAndUpdate(deploymentId, {
          $push: {
            logs: {
              $each: [
                {
                  log: `[ERROR] Step failed with code ${code}`,
                  timestamp: new Date(),
                },
              ],
            },
          },
          $set: { status: "failed" },
        });
        resolve(null);
      }
    });

    build.on("error", (err) => {
      console.error("Build error:", err);
      reject(err);
    });
  });
};

export const fullBuildHandler = asyncHandler(async (req, res) => {
  console.log("request recieved");
  const { projectName } = req.body;
  console.log(projectName);
  const internalKey = req.headers["x-internal-key"];
  if (!internalKey || internalKey !== process.env.INTERNAL_API_SECRET) {
    console.log("Unauthorized Access");
    return res.status(401).json({ message: "Unauthorized Access" });
  }

  try {
    const project = await Project.findOne({ name: projectName });
    if (!project) return res.status(404).json({ message: "Project not found" });
    console.log("project found");

    const clonedPath = await cloneRepositoryAndReturnPath(
      project.github.repoName,
      project.github.repositoryUrl + ".git",
      project.github.branch
    );
    console.log("repo cloned", clonedPath);
    if (clonedPath === null) {
      console.log("no cloned path");
      return res.status(500).json({ message: "Error while cloning repo" });
    }
    const techStack = await detectTechStackAndReturn(clonedPath);
    if (techStack === null) {
      console.log("no tech stack");
      return res
        .status(500)
        .json({ message: "Error while detecting tech stack" });
    }
    if (techStack === "unknown") {
      console.log("unknown tech stack");
      return res.status(500).json({ message: "Unkown tech stack" });
    }
    console.log("tech stack", techStack);
    const dockerfile = await generateDockerFileAndReturn(
      clonedPath,
      project._id,
      techStack
    );
    if (dockerfile === null) {
      console.log("docker file error");
      return res
        .status(500)
        .json({ message: "Error while generating docker file" });
    }
    console.log("docker file");
    const prevVersion = await getVersionAndReturn(projectName);
    if (prevVersion === null) {
      console.log("previous version error");
      return res
        .status(500)
        .json({ message: "Error while getting previous version" });
    }
    const version = (Number(prevVersion) + 1).toString();
    const deploymentId = await createDeploymentAndReturn(
      projectName,
      version,
      "pending"
    );
    if (deploymentId === null) {
      console.log("deployment error");
      return res
        .status(500)
        .json({ message: "Error while creating new deployment" });
    }
    console.log("deployment", deploymentId);
    const imageName = await generateDockerImageAndReturn(
      projectName,
      clonedPath,
      deploymentId
    );
    if (imageName === null) {
      console.log("image error");
      return res
        .status(500)
        .json({ message: "Error while creating new docker image" });
    }
    console.log("docker image");
    const deployed = await deployAndReturn(deploymentId, projectName, true);
    if (deployed === null) {
      console.log("deploying error");
      return res.status(500).json({ message: "Error while deploying" });
    }
    console.log("deployed");

    res.status(200).json({ message: "Build started" });
  } catch (error) {
    console.error(error);
  }
});
