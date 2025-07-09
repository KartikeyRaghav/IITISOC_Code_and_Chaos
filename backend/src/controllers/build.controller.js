// Import utility for async error handling
import { asyncHandler } from "../utils/asyncHandler.util.js";

// Node.js built-in modules for command execution and file handling
import { execSync, spawn } from "child_process";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import getPort from "get-port";
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

const removePreviousDeployment = async (projectName) => {
  const project = await Project.findOne({ name: projectName });

  if (project.deploymentHistory.length > 0) {
    const prevDeployment = await Deployment.findOne({
      _id: project.deploymentHistory[project.deploymentHistory.length - 1],
    });
    const imageName = prevDeployment.imageName;
    const containerName = execSync(
      `sudo docker ps -a --filter ancestor=${imageName} --format "{{.Names}}"`
    )
      .toString()
      .trim();
    const port = execSync(`sudo docker port ${containerName}`)
      .toString()
      .trim()
      .split(":")
      .pop();

    const stopContainer = execSync(`sudo docker rm -f ${containerName}`);
    return port;
  } else return null;
};

// Route handler to build Docker image
export const generateDockerImage = asyncHandler(async (req, res) => {
  const { projectName, clonedPath } = req.body;
  console.log(projectName);
  if (!projectName || !clonedPath) {
    return res
      .status(400)
      .json({ message: "Missing repo name or cloned path" });
  }

  const port = await removePreviousDeployment(projectName);

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
      res.write(`${data.toString()}\n\n`);
    });

    build.stderr.on("data", (data) => {
      res.write(`${data.toString()}\n\n`);
    });

    build.on("close", (code) => {
      res.write(`Docker image build exited with code ${code}\n\n`);
      if (code === 0) {
        res.write(`[BUILD_COMPLETE] ${imageName}\n\n`);
        if (port) {
          res.write(`[PREV_PORT] ${port}\n\n`);
        }
      } else {
        res.write(`[ERROR] Step failed with code ${code}\n\n`);
      }
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

// Route handler to run a Docker container and setup reverse proxy via nginx
export const runDockerContainer = asyncHandler(async (req, res) => {
  const { imageName, projectName, prevPort } = req.body;

  let port = null;
  if (prevPort) port = prevPort;
  else port = await getPort();
  const containerName = `container-${projectName.toLowerCase()}-${Date.now()}`;

  try {
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Access-Control-Allow-Origin", `${process.env.FRONTEND_URL}`);
    res.setHeader("Access-Control-Allow-Credentials", "true");

    // Run Docker container
    const run = spawn("docker", [
      "run",
      "-p",
      port + ":80",
      "--name",
      containerName,
      imageName,
    ]);

    run.stdout.on("data", (data) => {
      res.write(`${data.toString()}\n\n`);
      res.write(
        `[RUN_COMPLETE] http://${projectName}.deploy.princecodes.online\n\n`
      );
    });

    if (!prevPort) writeNginxConfig(projectName, port);

    run.stderr.on("data", (data) => {
      res.write(`ERROR: ${data.toString()}\n\n`);
    });

    run.on("close", (code) => {
      res.write(`Docker container run exited with code ${code}\n\n`);
      res.end();
    });

    req.on("close", () => {
      run.kill();
    });
  } catch (err) {
    console.error("Docker run error:", err);
    res.status(500).json({ error: "Docker run failed", details: err });
  }
});
