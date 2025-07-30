import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAnalytics } from "../controllers/pageVisit.controller.js";

const analyticsRouter = Router();

analyticsRouter.use(verifyJWT);

analyticsRouter.route("/:projectId/summary").get(getAnalytics);

export default analyticsRouter;
