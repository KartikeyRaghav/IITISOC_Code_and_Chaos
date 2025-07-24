// Import utility for async error handling
import { asyncHandler } from "../utils/asyncHandler.util.js";

// Node.js built-in modules for command execution and file handling
import { execSync, spawn } from "child_process";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { Project } from "../models/project.model.js";
import { Deployment } from "../models/deployment.model.js";

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

// Utility to generate Dockerfile content based on tech stack
function generateDockerfileContent(stack) {
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

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
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
  const { clonedPath, techStack } = req.body;

  if (!clonedPath || !fs.existsSync(clonedPath) || !techStack) {
    return res
      .status(400)
      .json({ message: "Invalid or missing clonedPath or techStack" });
  }

  const dockerfileContent = generateDockerfileContent(techStack);
  const dockerfilePath = path.join(clonedPath, "Dockerfile");

  // Write Dockerfile
  fs.writeFileSync(dockerfilePath, dockerfileContent);

  res.status(200).json({
    message: "Dockerfile generated successfully",
    dockerfilePath,
    stack: techStack,
  });
});

const removePreviousPreviewDeployment = async (projectName) => {
  try {
    const project = await Project.findOne({ name: projectName });

    const containerName = execSync(
      `docker ps --filter "publish=${project.previewPort}" --format "{{.Names}}"`
    )
      .toString()
      .trim();
    console.log(containerName);
    if (containerName) {
      const imageName = `docker inspect --format='{{.Config.Image}}' ${containerName}`;
      const stopContainer = execSync(`sudo docker rm -f ${containerName}`);
      console.log(imageName);
      const prevDeployment = await Deployment.findOne({ imageName: imageName });
      console.log(prevDeployment);
      prevDeployment.endTime = new Date();
      prevDeployment.status = "in-preview";
      prevDeployment.save({ validateBeforeSave: false });
    }
  } catch (error) {
    console.error(error);
  }
};

// Route handler to build Docker image
export const generateDockerImage = asyncHandler(async (req, res) => {
  const { projectName, clonedPath, deploymentId } = req.body;
  if (!projectName || !clonedPath || !deploymentId) {
    return res
      .status(400)
      .json({ message: "Missing repo name or cloned path" });
  }

  await removePreviousPreviewDeployment(projectName);
  const newDeployment = await Deployment.findById(deploymentId);
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
      newDeployment.logs = [
        ...newDeployment.logs,
        { log: data.toString(), timestamp: new Date() },
      ];
      res.write(`${data.toString()}\n\n`);
    });

    build.stderr.on("data", (data) => {
      newDeployment.logs = [
        ...newDeployment.logs,
        { log: data.toString(), timestamp: new Date() },
      ];
      res.write(`${data.toString()}\n\n`);
    });

    build.on("close", async (code) => {
      res.write(`Docker image build exited with code ${code}\n\n`);
      if (code === 0) {
        newDeployment.logs = [
          ...newDeployment.logs,
          { log: `[BUILD_COMPLETE] ${imageName}\n\n`, timestamp: new Date() },
        ];
        newDeployment.imageName = imageName;
        res.write(`[BUILD_COMPLETE] ${imageName}\n\n`);
      } else {
        newDeployment.logs = [
          ...newDeployment.logs,
          {
            log: `[ERROR] Step failed with code ${code}\n\n`,
            timestamp: new Date(),
          },
        ];
        newDeployment.status = "failed";
        res.write(`[ERROR] Step failed with code ${code}\n\n`);
      }
      await newDeployment.save({ validateBeforeSave: false });
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

// Route handler to run a Docker container and setup reverse proxy via nginx
export const runDockerContainer = asyncHandler(async (req, res) => {
  const { imageName, projectName, deploymentId } = req.body;

  const project = await Project.findOne({ name: projectName });
  const containerName = `container-${projectName.toLowerCase()}-${Date.now()}`;
  const deployment = await Deployment.findOne({ _id: deploymentId });

  try {
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Access-Control-Allow-Origin", `${process.env.FRONTEND_URL}`);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "no-cache");

    // Run Docker container
    const run = spawn("docker", [
      "run",
      "-p",
      project.framework === "next"
        ? `${project.previewPort}:3000`
        : `${project.previewPort}:80`,
      "--name",
      containerName,
      imageName,
    ]);

    run.on("spawn", async () => {
      const logMsg = `[RUN_COMPLETE] http://${projectName}-preview.deploy.princecodes.online\n\n`;
      res.write(logMsg);
      res.flush?.();
      deployment.logs.push({ log: logMsg, timestamp: new Date() });
    });

    run.stdout.on("data", async (data) => {
      const logMsg = data.toString();
      res.write(`${logMsg}\n\n`);
      res.flush?.();
      deployment.logs.push({ log: logMsg, timestamp: new Date() });
    });

    run.stderr.on("data", async (data) => {
      const logMsg = `ERROR: ${data.toString()}`;
      res.write(`${logMsg}\n\n`);
      res.flush?.();
      deployment.logs.push({ log: logMsg, timestamp: new Date() });
    });

    run.on("close", async (code) => {
      const msg = `Docker container run exited with code ${code}\n\n`;
      res.write(msg);
      res.flush?.();
      deployment.logs.push({ log: msg, timestamp: new Date() });
      res.end();
    });

    await deployment.save({ validateBeforeSave: false });
    req.on("close", () => {
      run.kill();
    });
  } catch (err) {
    console.error("Docker run error:", err);
    res.status(500).json({ error: "Docker run failed", details: err });
  }
});
