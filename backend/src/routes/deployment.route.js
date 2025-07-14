import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createDeployment,
  getAllDeployments,
  getDeployment,
  getVersion,
  updateDeployment,
} from "../controllers/deployment.controller.js";

const deploymentRouter = Router();

deploymentRouter.use(verifyJWT);

deploymentRouter.route("/version").post(getVersion);
deploymentRouter.route("/create").post(createDeployment);
deploymentRouter.route("/update").put(updateDeployment);
deploymentRouter.route("/all").get(getAllDeployments);
deploymentRouter.route("/").get(getDeployment);

export default deploymentRouter;
