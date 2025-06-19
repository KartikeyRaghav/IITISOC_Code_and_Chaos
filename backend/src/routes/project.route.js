import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  checkName,
  createProject,
  getAllProjects,
  getProject,
} from "../controllers/project.controller.js";

const projectRouter = Router();

projectRouter.use(verifyJWT);

projectRouter.route("/getAllProjects").get(getAllProjects);
projectRouter.route("/getProject").get(getProject);
projectRouter.route("/checkName").post(checkName);
projectRouter.route("/create").post(createProject);

export default projectRouter;
