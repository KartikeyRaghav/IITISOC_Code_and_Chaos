import { Router } from "express";
import {
  getStats,
  getUserProfile,
  getUserRepos,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  requestPasswordReset,
  resetPassword,
  sendOtp,
  verifyOtp,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter
  .route("/register")
  .post(upload.fields([{ name: "profilePicture", maxCount: 1 }]), registerUser);
userRouter.route("/sendOtp").post(sendOtp);
userRouter.route("/verifyOtp").post(verifyOtp);
userRouter.route("/requestPasswordReset").post(requestPasswordReset);
userRouter.route("/resetPassword").post(resetPassword);
userRouter.route("/login").post(loginUser);
userRouter.route("/refreshToken").get(refreshAccessToken);
userRouter.route("/stats").get(getStats);

// Secured routes
userRouter.route("/profile").get(verifyJWT, getUserProfile);
userRouter.route("/getUserRepos").get(verifyJWT, getUserRepos);
userRouter.route("/logout").post(verifyJWT, logoutUser);

export default userRouter;
