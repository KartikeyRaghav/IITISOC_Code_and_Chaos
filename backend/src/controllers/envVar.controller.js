import { EnvVar } from "../models/envVar.model.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

export const addEnvVar = asyncHandler(async (req, res) => {
  const { projectId, key, value, isSecret = false } = req.body;

  if (!projectId || !key || !value) {
    return res.status(400).json({
      success: false,
      message: "projectId, key, and value are required",
    });
  }

  const envVar = await EnvVar.create({
    projectId,
    key,
    value,
    isSecret,
  });

  res.status(201).json({ success: true, data: envVar });
});

export const getEnvVars = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    return res
      .status(400)
      .json({ success: false, message: "projectId is required" });
  }

  const envVars = await EnvVar.find({ projectId }).sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: envVars });
});

export const updateEnvVar = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const var_id = new Object(id);

  const envVar = await EnvVar.findOne({ _id: var_id });

  if (!envVar) {
    return res
      .status(404)
      .json({ success: false, message: "Environment variable not found" });
  }

  if (updates.key !== undefined) envVar.key = updates.key;
  if (updates.value !== undefined) envVar.value = updates.value;
  if (updates.isSecret !== undefined) envVar.isSecret = updates.isSecret;

  await envVar.save();

  res.status(200).json({ success: true, data: envVar });
});

export const deleteEnvVar = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const envVar = await EnvVar.findOne({ _id: id });
  if (!envVar) {
    return res
      .status(404)
      .json({ success: false, message: "Environment variable not found" });
  }

  await EnvVar.findByIdAndDelete(id);

  res
    .status(200)
    .json({ success: true, message: "Environment variable deleted" });
});
