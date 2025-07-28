import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getGithubRepos,
  getRepoBranches,
  githubOAuthConsent,
  handleGithubCallback,
  getRepo,
} from "../controllers/github.controller.js";
import { githubWebhookHandler } from "../controllers/githubWebhook.controller.js";
import express from "express";

const githubRouter = Router();
githubRouter.use(verifyJWT);

githubRouter.route("/").get(githubOAuthConsent);
githubRouter.route("/callback").get(handleGithubCallback);
githubRouter.route("/getGithubRepos").get(getGithubRepos);
githubRouter.route("/getRepo").get(getRepo);
githubRouter.route("/getBranches").get(getRepoBranches);
githubRouter
  .route("/webhook")
  .post(express.raw({ type: "*/*" }), githubWebhookHandler);

export default githubRouter;
