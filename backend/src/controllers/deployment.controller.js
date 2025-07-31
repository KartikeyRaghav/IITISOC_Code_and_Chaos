// Import Mongoose models
import { Deployment } from "../models/deployment.model.js";
import { Project } from "../models/project.model.js";
import { execSync, spawn } from "child_process";

// Utility for centralized async error handling
import { asyncHandler } from "../utils/asyncHandler.util.js";

export const getVersion = asyncHandler(async (req, res) => {
  const { projectName } = req.body;

  // Validate request
  if (!projectName) {
    return res.status(400).json({ message: "Project name is required" });
  }

  try {
    // Find the project by name
    const project = await Project.findOne({ name: projectName });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const length = project.deploymentHistory.length;

    // If previous deployments exist, fetch the latest one
    if (length > 0) {
      const lastdeployment = await Deployment.findOne({
        _id: project.deploymentHistory[length - 1],
      });

      return res.status(200).json({ version: lastdeployment.version });
    }

    // Default version if no deployments found
    res.status(200).json({ version: "0" });
  } catch (error) {
    console.error("Error in getVersion:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export const getVersionAndReturn = async (projectName) => {
  if (!projectName) {
    return null;
  }

  try {
    // Find the project by name
    const project = await Project.findOne({ name: projectName });
    if (!project) {
      return null;
    }

    const length = project.deploymentHistory.length;

    // If previous deployments exist, fetch the latest one
    if (length > 0) {
      const lastdeployment = await Deployment.findOne({
        _id: project.deploymentHistory[length - 1],
      });

      return lastdeployment.version;
    }

    // Default version if no deployments found
    return "0";
  } catch (error) {
    console.error("Error in getVersion:", error);
    return null;
  }
};

export const createDeployment = asyncHandler(async (req, res) => {
  const { projectName, version, status } = req.body;

  // Validate required fields
  if (!projectName) {
    return res
      .status(400)
      .json({ message: "Project and image names are required" });
  }

  try {
    // Fetch the project
    const project = await Project.findOne({ name: projectName });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const projectUser = project.createdBy;

    // Check if the current user owns the project
    if (projectUser.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "Unauthorized to create this deployment" });
    }

    // Create a new deployment record
    const deployment = await Deployment.create({
      version,
      status,
      project,
      deployedBy: projectUser,
    });

    // Append to deployment history and save
    project.deploymentHistory.push(deployment);
    await project.save();

    res
      .status(201)
      .json({ _id: deployment._id, message: "Deployment created" });
  } catch (error) {
    console.error("Error in createDeployment:", error);
    res.status(500).json({ message: "Error creating a deployment" });
  }
});

export const createDeploymentAndReturn = async (
  projectName,
  version,
  status
) => {
  // Validate required fields
  if (!projectName) {
    return null;
  }

  try {
    // Fetch the project
    const project = await Project.findOne({ name: projectName });

    if (!project) {
      return null;
    }

    const projectUser = project.createdBy;

    // Create a new deployment record
    const deployment = await Deployment.create({
      version,
      status,
      project,
      deployedBy: projectUser,
    });

    // Append to deployment history and save
    project.deploymentHistory.push(deployment);
    await project.save();

    return deployment._id;
  } catch (error) {
    console.error("Error in createDeployment:", error);
    return null;
  }
};

export const updateDeployment = asyncHandler(async (req, res) => {
  const { _id, status } = req.body;

  try {
    // Find the deployment by ID
    const deployment = await Deployment.findOne({ _id });

    if (!deployment) {
      return res
        .status(400)
        .json({ message: "No deployment with this id found" });
    }

    // Authorization check
    if (deployment.deployedBy.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to update it" });
    }

    // Update the status and save
    deployment.status = status;
    if (status === "failed") {
      deployment.rollbackAvailable = false;
      deployment.imageName = "not-available";
    }

    if (deployment.status === "deployed" && status === "in-preview") {
      deployment.endTime = new Date();
    }

    if (status === "deployed") {
      deployment.startTime = new Date();
      deployment.endTime = null;
    }

    await deployment.save();

    res.status(200).json({ message: "Deployment status updated" });
  } catch (error) {
    console.error("Error in updateDeployment:", error);
    res.status(500).json({ message: "Failed to update deployment status" });
  }
});

export const getAllDeployments = asyncHandler(async (req, res) => {
  const { projectName } = req.query;

  const project = await Project.findOne({ name: projectName });

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  const deployments = await Deployment.find({ project: project._id });

  res.status(200).json(deployments);
});

export const getDeployment = asyncHandler(async (req, res) => {
  const { deploymentId } = req.query;

  const deployment = await Deployment.findOne({ _id: deploymentId });

  if (!deployment) {
    return res.status(404).json({ message: "Deployment not found" });
  }

  if (req.user._id.toString() !== deployment.deployedBy.toString())
    return res.status(401).json({ message: "Not authorized" });

  res.status(200).json(deployment);
});

const removePreviousDeployment = async (projectName, isLive) => {
  try {
    const project = await Project.findOne({ name: projectName });
    if (!project) {
      console.warn(`Project '${projectName}' not found`);
      return;
    }

    const port = isLive ? project.livePort : project.previewPort;
    const containerName = execSync(
      `docker ps --filter "publish=${port}" --format "{{.Names}}"`
    )
      .toString()
      .trim();

    if (!containerName) {
      console.log("No active container found on port", port);
      return;
    }

    console.log("Container name:", containerName);

    const imageNameRaw = execSync(
      `docker inspect --format='{{.Config.Image}}' ${containerName}`
    )
      .toString()
      .trim();

    const imageName = imageNameRaw.replace(/['"\n]/g, "").trim();
    console.log("Image name:", imageName);

    // Stop and remove the running container
    execSync(`docker rm -f ${containerName}`);
    console.log("Container stopped and removed");

    // Update previous deployment record
    const prevDeployment = await Deployment.findOne({ imageName });
    if (!prevDeployment) {
      console.warn("No previous deployment found with imageName:", imageName);
      return;
    }

    await Deployment.findByIdAndUpdate(
      prevDeployment._id,
      {
        $set: {
          endTime: new Date(),
          status: "in-preview",
        },
      },
      { new: true }
    );

    console.log("Previous deployment updated:", prevDeployment._id);
  } catch (error) {
    console.error("Error removing previous deployment:", error);
  }
};

export const deploy = asyncHandler(async (req, res) => {
  const { deploymentId, projectName, isLive } = req.body;

  try {
    const deployment = await Deployment.findOne({ _id: deploymentId });
    const project = await Project.findOne({ name: projectName });

    if (!deployment) {
      return res.status(404).json({ message: "Deployment not found" });
    }

    if (req.user._id.toString() !== deployment.deployedBy.toString())
      return res.status(401).json({ message: "Not authorized" });

    await removePreviousDeployment(projectName, isLive);

    const containerName = `container-${projectName}-${Date.now()}`;

    const run = spawn("docker", [
      "run",
      "-p",
      project.framework === "next"
        ? `${isLive ? project.livePort : project.previewPort}:3000`
        : `${isLive ? project.livePort : project.previewPort}:80`,
      "--name",
      containerName,
      deployment.imageName,
    ]);

    run.stdout.on("data", (data) => {
      deployment.logs = [
        ...deployment.logs,
        { log: data.toString(), timestamp: new Date() },
      ];
    });

    run.stderr.on("data", (data) => {
      deployment.logs = [
        ...deployment.logs,
        { log: data.toString(), timestamp: new Date() },
      ];
    });

    run.on("close", async (code) => {
      deployment.logs = [
        ...deployment.logs,
        {
          log: `Docker container run exited with code ${code}\n\n`,
          timestamp: new Date(),
        },
      ];
      if (code === 0) {
        deployment.logs = [
          ...deployment.logs,
          { log: `[RUN_COMPLETE] ${containerName}\n\n`, timestamp: new Date() },
        ];
      } else {
        deployment.logs = [
          ...deployment.logs,
          {
            log: `[ERROR] Step failed with code ${code}\n\n`,
            timestamp: new Date(),
          },
        ];
        deployment.status = "failed";
      }
      await deployment.save({
        validateBeforeSave: false,
        optimisticConcurrency: false,
      });
    });
    project.isLive = true;
    await project.save({
      validateBeforeSave: false,
      optimisticConcurrency: false,
    });
    res.status(200).json({ message: "complete" });
  } catch (error) {
    res.status(400).json({ message: "Error while deploying" });
  }
});

export const deployAndReturn = async (deploymentId, projectName) => {
  try {
    const deployment = await Deployment.findById(deploymentId);
    const project = await Project.findOne({ name: projectName });

    if (!deployment || !project) {
      console.warn("Deployment or Project not found");
      return null;
    }

    // Remove previous container if exists
    await removePreviousDeployment(projectName, true);
    console.log("Previous deployment removed");

    const containerName = `container-${projectName}-${Date.now()}`;
    const portMapping =
      project.framework === "next"
        ? `${project.livePort}:3000`
        : `${project.livePort}:80`;

    // Run docker container in detached mode
    const args = [
      "run",
      "-d", // detached mode
      "-p",
      portMapping,
      "--name",
      containerName,
      deployment.imageName,
    ];

    const run = spawn("docker", args);

    run.stdout.on("data", (data) => {
      deployment.logs.push({
        log: data.toString(),
        timestamp: new Date(),
      });
    });

    run.stderr.on("data", (data) => {
      deployment.logs.push({
        log: data.toString(),
        timestamp: new Date(),
      });
    });

    run.on("error", (err) => {
      console.error("Docker run error:", err);
      deployment.logs.push({
        log: `[ERROR] Docker failed: ${err.message}`,
        timestamp: new Date(),
      });
      deployment.status = "failed";
    });

    run.on("close", async (code) => {
      if (code === 0) {
        deployment.logs.push({
          log: `[RUN_STARTED] ${containerName}`,
          timestamp: new Date(),
        });
        deployment.startTime = new Date();
        deployment.status = "deployed";
        project.isLive = true;

        // Save updates
        await project.save({
          validateBeforeSave: false,
          optimisticConcurrency: false,
        });
        await deployment.save({
          validateBeforeSave: false,
          optimisticConcurrency: false,
        });
      } else {
        deployment.logs.push({
          log: `[ERROR] Docker run exited with code ${code}`,
          timestamp: new Date(),
        });
        deployment.status = "failed";
        await deployment.save({
          validateBeforeSave: false,
          optimisticConcurrency: false,
        });
      }
    });

    return true;
  } catch (error) {
    console.error("deployAndReturn failed:", error);
    return null;
  }
};

export const stopDeployment = asyncHandler(async (req, res) => {
  const { projectName } = req.params;

  await removePreviousDeployment(projectName, true);

  res.status(200).json({ message: "successful" });
});
