// Import Mongoose models
import { Deployment } from "../models/deployment.model.js";
import { Project } from "../models/project.model.js";

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
      startTime: new Date(),
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
      deployment.endTime = new Date();
      deployment.imageName = "not-available";
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

  if (req.user._id.toString() !== deployment.deployedBy.toString())
    return res.status(401).json({ message: "Not authorized" });

  if (!deployment) {
    return res.status(404).json({ message: "Deployment not found" });
  }

  res.status(200).json(deployment);
});
