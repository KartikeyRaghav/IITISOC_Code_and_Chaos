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

githubRouter.route("/").get(verifyJWT, githubOAuthConsent);
githubRouter.route("/callback").get(verifyJWT, handleGithubCallback);
githubRouter.route("/getGithubRepos").get(verifyJWT, getGithubRepos);
githubRouter.route("/getRepo").get(verifyJWT, getRepo);
githubRouter.route("/getBranches").get(verifyJWT, getRepoBranches);
githubRouter
  .route("/webhook")
  .post(express.raw({ type: "application/json" }), githubWebhookHandler);

export default githubRouter;
