import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  checkName,
  createProjectByGithub,
  createProjectByZip,
  getAllProjects,
  getProject,
  toggleAutoDeploy,
} from "../controllers/project.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const projectRouter = Router();

projectRouter.use(verifyJWT);

projectRouter.route("/getAllProjects").get(getAllProjects);
projectRouter.route("/getProject").get(getProject);
projectRouter.route("/checkName").post(checkName);
projectRouter.route("/createByGithub").post(createProjectByGithub);
projectRouter
  .route("/createByZip")
  .post(upload.single("file"), createProjectByZip);
projectRouter.route("/toggleAutoDeploy").post(toggleAutoDeploy);

export default projectRouter;
