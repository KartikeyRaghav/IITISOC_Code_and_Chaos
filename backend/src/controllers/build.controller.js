import { asyncHandler } from "../utils/asyncHandler.util.js";
import { exec } from "child_process";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { runShellCommand } from "../utils/shellCommand.util.js";

export const cloneRepo = asyncHandler(async (req, res) => {
  const { repoName, cloneUrl } = req.body;

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const targetDir = path.join(__dirname, "../../temp/repo_temp", repoName);

  // const shellCommand = await runShellCommand(
  //   `git clone ${cloneUrl} "${targetDir}"`
  // );

  exec(`git clone ${cloneUrl} "${targetDir}"`, async (err, stdout, stderr) => {
    if (err) {
      console.error(`Clone failed:`, err);
      return res.status(500).json({ message: "Error cloning repository" });
    }
    return res.status(200).json({
      message: "Cloned successfully",
      location: `${targetDir}`,
    });
  });
});

export const detectTechStack = asyncHandler(async (req, res) => {
  const { clonedPath } = req.body;

  const packagePath = path.join(clonedPath, "package.json");
  if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, "utf-8"));

    if (pkg.dependencies?.next) return res.status(200).json({ stack: "next" });
    if (pkg.dependencies?.react)
      return res.status(200).json({ stack: "react" });
    if (pkg.dependencies?.vue) return res.status(200).json({ stack: "vue" });
    if (pkg.dependencies?.["@angular/core"])
      return res.status(200).json({ stack: "angular" });
    if (pkg.dependencies?.svelte)
      return res.status(200).json({ stack: "svelte" });
    if (pkg.dependencies?.express || pkg.dependencies?.koa)
      return res.status(200).json({ stack: "node-api" });
  }

  const files = fs.readdirSync(clonedPath);
  if (files.some((f) => f.endsWith(".html")))
    return res.status(200).json({ stack: "static" });

  res.status(400).json({ message: "unknown" });
});

// Helper function to generate Dockerfile content based on tech stack
function generateDockerfileContent(stack) {
  switch (stack) {
    case "react":
    case "vue":
    case "svelte":
      return `# Dockerfile for ${stack}
FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`;

    case "next":
      return `# Dockerfile for Next.js
FROM node:18
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "start"]`;

    case "angular":
      return `# Dockerfile for Angular
FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build --prod

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`;

    case "node-api":
      return `# Dockerfile for Node.js API
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["node", "index.js"]`;

    case "static":
      return `# Dockerfile for static HTML/CSS
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`;

    default:
      return `# Unknown stack
# Manual Dockerfile creation required.`;
  }
}

export const generateDockerFile = asyncHandler(async (req, res) => {
  try {
    const { clonedPath, techStack } = req.body;

    if (!clonedPath || !fs.existsSync(clonedPath) || !techStack) {
      return res
        .status(400)
        .json({ message: "Invalid or missing clonedPath or techStack" });
    }

    const dockerfileContent = generateDockerfileContent(techStack);

    const dockerfilePath = path.join(clonedPath, "Dockerfile");
    fs.writeFileSync(dockerfilePath, dockerfileContent);

    res.status(200).json({
      message: "Dockerfile generated successfully",
      stack: techStack,
      dockerfilePath,
    });
  } catch (error) {
    console.error("Error generating Dockerfile:", error);
    res.status(500).json({ message: "Failed to generate Dockerfile" });
  }
});

export const generateDockerImage = asyncHandler(async (req, res) => {
  const { repoName, clonedPath } = req.body;

  if (!repoName || !clonedPath) {
    return res.status(400).json({ error: "Missing repo name or cloned path" });
  }

  const imageName = `app-${repoName.toLowerCase()}-${Date.now()}`;

  try {
    const buildCmd = `docker build -t ${imageName} ${clonedPath}`;
    await runShellCommand(buildCmd);

    if (fs.existsSync(clonedPath)) {
      fs.rmSync(clonedPath, { recursive: true, force: true });
      console.log(`Deleted folder: ${clonedPath}`);
    } else {
      console.warn(`Folder not found: ${clonedPath}`);
    }

    res.status(200).json({
      message: "Image built successfully",
      imageName,
    });
  } catch (err) {
    console.error("Docker error:", err);
    res.status(500).json({ error: "Docker build failed", details: err });
  }
});

export const runDockerContainer = asyncHandler(async (req, res) => {
  const { port, imageName, repoName } = req.body;

  const containerName = `container-${repoName.toLowerCase()}-${Date.now()}`;

  try {
    const runCmd = `docker run -d -p ${port}:80 --name ${containerName} ${imageName}`;
    const containerId = await runShellCommand(runCmd);

    res.status(200).json({
      message: "App deployed successfully",
      imageName,
      containerName,
      containerId: containerId.trim(),
      url: `http://localhost:${port}`,
    });
  } catch (err) {
    console.error("Docker error:", err);
    res.status(500).json({ error: "Docker run failed", details: err });
  }
});
