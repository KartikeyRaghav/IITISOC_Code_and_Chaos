import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getUserRepos,
  githubOAuthConsent,
  handleGithubCallback,
} from "../controllers/github.controller.js";

const githubRouter = Router();

githubRouter.route("/").get(verifyJWT, githubOAuthConsent);
githubRouter.route("/callback").get(verifyJWT, handleGithubCallback);
githubRouter.route("/getUserRepos").get(verifyJWT, getUserRepos);

export default githubRouter;
