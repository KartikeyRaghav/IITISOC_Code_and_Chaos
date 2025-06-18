import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getGithubRepos,
  getRepoBranches,
  githubOAuthConsent,
  handleGithubCallback,
} from "../controllers/github.controller.js";

const githubRouter = Router();
githubRouter.use(verifyJWT);

githubRouter.route("/").get(githubOAuthConsent);
githubRouter.route("/callback").get(handleGithubCallback);
githubRouter.route("/getGithubRepos").get(getGithubRepos);
githubRouter.route("/getBranches").get(getRepoBranches);

export default githubRouter;
