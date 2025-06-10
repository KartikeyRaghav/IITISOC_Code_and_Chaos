import { Router } from "express";
import {
  getUserRepos,
  githubOAuthConsent,
  handleGithubCallback,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter
  .route("/register")
  .post(upload.fields([{ name: "profilePicture", maxCount: 1 }]), registerUser);

userRouter.route("/login").post(loginUser);

// Secured routes
userRouter.route("/github").get(verifyJWT, githubOAuthConsent);
userRouter.route("/github/callback").get(verifyJWT, handleGithubCallback);
userRouter.route("/github/getUserRepos").get(verifyJWT, getUserRepos);
userRouter.route("/refreshToken").post(refreshAccessToken);
userRouter.route("/logout").post(verifyJWT, logoutUser);

export default userRouter;
