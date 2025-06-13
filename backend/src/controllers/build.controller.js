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

  const targetDir = path.join(__dirname, "../../public/repo_temp", repoName);

  // const shellCommand = await runShellCommand(
  //   `git clone ${cloneUrl} "${targetDir}"`
  // );

  exec(`git clone ${cloneUrl} "${targetDir}"`, async (err, stdout, stderr) => {
    if (err) {
      console.error(`Clone failed:`, err);
      return res.status(500).json({ message: "Error cloning repository" });
    }
    console.log("Cloned successfully");
    return res.status(200).json({
      message: "Cloned successfully",
      location: `${targetDir}`,
    });
  });
});

function detectTechStack(projectPath) {
  const packagePath = path.join(projectPath, "package.json");
  if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, "utf-8"));

    if (pkg.dependencies?.next) return "next";
    if (pkg.dependencies?.react) return "react";
    if (pkg.dependencies?.vue) return "vue";
    if (pkg.dependencies?.["@angular/core"]) return "angular";
    if (pkg.dependencies?.svelte) return "svelte";
    if (pkg.dependencies?.express || pkg.dependencies?.koa) return "node-api";
  }

  const files = fs.readdirSync(projectPath);
  if (files.some((f) => f.endsWith(".html"))) return "static";

  return "unknown";
}

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
    const { clonedPath } = req.body;

    if (!clonedPath || !fs.existsSync(clonedPath)) {
      return res.status(400).json({ message: "Invalid or missing clonedPath" });
    }

    const techStack = detectTechStack(clonedPath);
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

export const buildAndRunDocker = asyncHandler(async (req, res) => {
  const { clonedPath, port } = req.body;

  if (!clonedPath) {
    return res.status(400).json({ error: "Missing 'clonedPath'" });
  }

  const repoName = clonedPath.split("\\")[6];
  const imageName = `app-${repoName.toLowerCase()}-${Date.now()}`;
  const containerName = `container-${repoName.toLowerCase()}-${Date.now()}`;

  try {
    const buildCmd = `docker build -t ${imageName} ${clonedPath}`;
    await runShellCommand(buildCmd);

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
    res.status(500).json({ error: "Docker build or run failed", details: err });
  }
});
