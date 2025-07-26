import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  cloneRepo,
  detectTechStack,
  generateDockerFile,
  generateDockerImage,
} from "../controllers/build.controller.js";

const buildRouter = Router();

buildRouter.use(verifyJWT);

buildRouter.route("/cloneRepo").post(cloneRepo);
buildRouter.route("/detectTechStack").post(detectTechStack);
buildRouter.route("/dockerFile").post(generateDockerFile);
buildRouter.route("/dockerImage").post(generateDockerImage);

export default buildRouter;
