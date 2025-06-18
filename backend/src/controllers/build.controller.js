import { asyncHandler } from "../utils/asyncHandler.util.js";
import { exec, spawn } from "child_process";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEMP_DIR = path.join(__dirname, "../../temp/repo_temp");

const checkCloneExists = async (pathName) => {
  try {
    const result = fs.existsSync(pathName);
    return result;
  } catch {
    return false;
  }
};

export const cloneRepo = asyncHandler(async (req, res) => {
  const { repoName, cloneUrl } = req.body;

  const targetDir = path.join(TEMP_DIR, repoName);

  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }

  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Transfer-Encoding", "chunked");
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:4000");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  let clone = null;
  const cloneExists = await checkCloneExists(targetDir);
  if (cloneExists) {
    console.log("clone exists");
    clone = spawn("git", ["-C", targetDir, "pull"]);
  } else {
    console.log("clone doesn't exist");
    clone = spawn("git", ["clone", cloneUrl, targetDir]);
  }

  clone.stdout.on("data", (data) => {
    res.write(`${data.toString()}\n\n`);
  });

  clone.stderr.on("data", (data) => {
    res.write(`${data.toString()}\n\n`);
  });

  clone.on("close", (code) => {
    res.write(`Git clone exited with code ${code}\n\n`);
    res.write(`[CLONE_COMPLETE] ${targetDir}\n\n`);
    res.end();
  });

  req.on("close", () => {
    clone.kill();
  });
});

export const detectTechStack = asyncHandler(async (req, res) => {
  const { clonedPath } = req.body;

  if (!clonedPath || !fs.existsSync(clonedPath)) {
    return res.status(400).json({ message: "Invalid cloned path" });
  }

  const packagePath = path.join(clonedPath, "package.json");
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

  const files = fs.readdirSync(clonedPath);
  if (files.some((f) => f.endsWith(".html")))
    return res.status(200).json({ stack: "static" });

  res.status(400).json({ message: "unknown" });
});

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

export const generateDockerFile = asyncHandler(async (req, res) => {
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
    dockerfilePath,
    stack: techStack,
  });
});

export const generateDockerImage = asyncHandler(async (req, res) => {
  const { repoName, clonedPath } = req.body;

  if (!repoName || !clonedPath) {
    return res
      .status(400)
      .json({ message: "Missing repo name or cloned path" });
  }

  const imageName = `app-${repoName.toLowerCase()}-${Date.now()}`;

  try {
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:4000");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    const build = spawn("docker", ["build", "-t", imageName, clonedPath]);

    build.stdout.on("data", (data) => {
      res.write(`${data.toString()}\n\n`);
    });

    build.stderr.on("data", (data) => {
      res.write(`${data.toString()}\n\n`);
    });

    build.on("close", (code) => {
      res.write(`Docker image build exited with code ${code}\n\n`);
      res.write(`[BUILD_COMPLETE] ${imageName}\n\n`);
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

export const runDockerContainer = asyncHandler(async (req, res) => {
  const { port, imageName, repoName } = req.body;

  const containerName = `container-${repoName.toLowerCase()}-${Date.now()}`;

  try {
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:4000");
    res.setHeader("Access-Control-Allow-Credentials", "true");

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
    });

    run.stderr.on("data", (data) => {
      res.write(`${data.toString()}\n\n`);
    });

    run.on("close", (code) => {
      res.write(`Docker container run exited with code ${code}\n\n`);
      res.write(`[RUN_COMPLETE] http://localhost:${port}\n\n`);
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
