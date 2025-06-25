import { Deployment } from "../models/deployment.model.js";
import { Project } from "../models/project.model.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

export const getVersion = asyncHandler(async (req, res) => {
  const { projectName } = req.body;

  if (!projectName) {
    return res.status(400).json({ message: "Project name is required" });
  }

  try {
    const project = await Project.findOne({ name: projectName });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const length = project.deploymentHistory.length;
    if (length > 0) {
      const lastdeployment = await Deployment.findOne({
        _id: project.deploymentHistory[length - 1],
      });

      res.status(200).json({ version: lastdeployment.version });
    }

    res.status(200).json({ version: "1" });
  } catch (error) {}
});

export const createDeployment = asyncHandler(async (req, res) => {
  const { projectName, imageName, version, status, logUrl, previewUrl } =
    req.body;

  if (!projectName || !imageName) {
    return res
      .status(400)
      .json({ message: "Project and image names are required" });
  }

  try {
    const project = await Project.findOne({ name: projectName });
    const projectUser = project.createdBy;

    if (projectUser.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "Unauthorized to create this deployment" });
    }

    const deployment = await Deployment.create({
      version,
      status,
      imageName,
      project,
      startTime: new Date(),
      deployedBy: projectUser,
      logUrl,
      previewUrl,
    });

    project.deploymentHistory.push(deployment);
    project.save();

    res
      .status(201)
      .json({ _id: deployment._id, message: "Deployment created" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating a deployment" });
  }
});

export const updateDeployment = asyncHandler(async (req, res) => {
  const { _id, status } = req.body;

  try {
    const deployment = await Deployment.findOne({ _id });

    if (!deployment) {
      return res
        .status(400)
        .json({ message: "No deployment with this id found" });
    }

    if (deployment.deployedBy != req.user) {
      return res.status(401).json({ message: "Not authorized to update it" });
    }

    deployment.status = status;
  } catch (error) {}
});
