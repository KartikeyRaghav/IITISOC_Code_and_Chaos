import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addEnvVar,
  deleteEnvVar,
  getEnvVars,
  updateEnvVar,
} from "../controllers/envVar.controller.js";

const envVarRouter = Router();
envVarRouter.use(verifyJWT);

envVarRouter.post("/", addEnvVar);
envVarRouter.get("/:projectId", getEnvVars);
envVarRouter.put("/:id", updateEnvVar);
envVarRouter.delete("/:id", deleteEnvVar);

export default envVarRouter;
