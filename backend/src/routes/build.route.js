import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  cloneRepo,
  detectTechStack,
  generateDockerFile,
  generateDockerImage,
} from "../controllers/build.controller.js";

const buildRouter = Router();

buildRouter.route("/cloneRepo").post(verifyJWT, cloneRepo);
buildRouter.route("/detectTechStack").post(verifyJWT, detectTechStack);
buildRouter.route("/dockerFile").post(verifyJWT, generateDockerFile);
buildRouter.route("/dockerImage").post(verifyJWT, generateDockerImage);
buildRouter.route("/full").post(generateDockerImage);

export default buildRouter;
