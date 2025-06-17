import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const projectRouter = Router();

projectRouter.use(verifyJWT);

projectRouter.route('/create').post();

export default projectRouter;
