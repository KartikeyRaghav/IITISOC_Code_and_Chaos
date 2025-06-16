import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const deploymentRouter = Router();

deploymentRouter.use(verifyJWT);

export default deploymentRouter;
