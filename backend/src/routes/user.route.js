import { Router } from "express";
import {
  getUserProfile,
  getUserRepos,
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
userRouter.route("/refreshToken").get(refreshAccessToken);

// Secured routes
userRouter.route("/profile").get(verifyJWT, getUserProfile);
userRouter.route("/getUserRepos").get(verifyJWT, getUserRepos);
userRouter.route("/logout").post(verifyJWT, logoutUser);

export default userRouter;
