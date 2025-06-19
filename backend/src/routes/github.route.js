import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getGithubRepos,
  getRepoBranches,
  githubOAuthConsent,
  handleGithubCallback,
  getRepo
} from "../controllers/github.controller.js";

const githubRouter = Router();
githubRouter.use(verifyJWT);

githubRouter.route("/").get(githubOAuthConsent);
githubRouter.route("/callback").get(handleGithubCallback);
githubRouter.route("/getGithubRepos").get(getGithubRepos);
githubRouter.route("/getRepo").get(getRepo);
githubRouter.route("/getBranches").get(getRepoBranches);

export default githubRouter;
