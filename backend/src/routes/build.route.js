import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { cloneRepo, generateDockerFile } from "../controllers/build.controller.js";

const buildRouter = Router();

buildRouter.route("/cloneRepo").post(verifyJWT, cloneRepo);
buildRouter.route("/dockerFile").post( generateDockerFile);

export default buildRouter;
