import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { cloneRepo } from "../controllers/build.controller.js";

const buildRouter = Router();

buildRouter.route("/cloneRepo").post(verifyJWT, cloneRepo);

export default buildRouter;
