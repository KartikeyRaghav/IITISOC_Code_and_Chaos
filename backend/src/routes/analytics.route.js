import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAnalytics, getUserProjectsWithAnalytics } from "../controllers/pageVisit.controller.js";

const analyticsRouter = Router();

analyticsRouter.use(verifyJWT);

analyticsRouter.route("/:projectId/summary").get(getAnalytics);
analyticsRouter.route("/").get(getUserProjectsWithAnalytics);

export default analyticsRouter;
