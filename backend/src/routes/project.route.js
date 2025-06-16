import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const projectRouter = Router();

projectRouter.use(verifyJWT);

export default projectRouter;
