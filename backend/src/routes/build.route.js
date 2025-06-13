import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  buildAndRunDocker,
  cloneRepo,
  generateDockerFile,
} from "../controllers/build.controller.js";

const buildRouter = Router();

buildRouter.route("/cloneRepo").post(verifyJWT, cloneRepo);
buildRouter.route("/dockerFile").post(verifyJWT, generateDockerFile);
buildRouter.route("/hostApp").post(verifyJWT, buildAndRunDocker);

export default buildRouter;
