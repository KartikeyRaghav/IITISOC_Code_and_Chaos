import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createDeployment,
  getVersion,
  updateDeployment,
} from "../controllers/deployment.controller.js";

const deploymentRouter = Router();

deploymentRouter.use(verifyJWT);

deploymentRouter.route("/version").post(getVersion);
deploymentRouter.route("/create").post(createDeployment);
deploymentRouter.route("/update").put(updateDeployment);

export default deploymentRouter;
