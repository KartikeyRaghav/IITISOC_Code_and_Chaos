import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkName } from "../controllers/project.controller.js";

const projectRouter = Router();

projectRouter.use(verifyJWT);

projectRouter.route("/checkName").post(checkName);
// projectRouter.route("/create").post();

export default projectRouter;
