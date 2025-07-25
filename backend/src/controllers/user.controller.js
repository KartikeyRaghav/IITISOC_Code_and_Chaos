import { asyncHandler } from "../utils/asyncHandler.util.js";
import { User } from "../models/user.model.js";
import { Deployment } from "../models/deployment.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.util.js";
import jwt from "jsonwebtoken";
import { Project } from "../models/project.model.js";
import nodemailer from "nodemailer";
import crypto from "crypto";

const generateAccessandRefreshTokens = async (user) => {
  try {
    const accessToken = await user.generateAccessToken();
    if (!accessToken) {
      return res
        .status(500)
        .json({ message: "Failed to generate access token" });
    }

    user.refreshToken = await user.generateRefreshToken();
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken: user.refreshToken };
  } catch (error) {
    return res.status(500).json({ message: "Failed to generate tokens" });
  }
};

export const registerUser = asyncHandler(async (req, res) => {
  const { password, fullName, email } = req.body;

  // Validate input fields
  if ([fullName, email, password].some((field) => field?.trim() === "")) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for duplicate email
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Email already in use" });
  }

  // Handle profile picture upload to Cloudinary
  const localProfilePicture = req.files?.profilePicture?.[0]?.path;
  let profilePicture = null;
  if (localProfilePicture) {
    try {
      const cloudinaryResponse = await uploadOnCloudinary(localProfilePicture);
      if (!cloudinaryResponse) {
        return res
          .status(500)
          .json({ message: "Failed to upload profile picture" });
      }
      profilePicture = cloudinaryResponse.url;
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error uploading profile picture to Cloudinary" });
    }
  }

  // Create user in DB
  const user = await User.create({ password, fullName, email, profilePicture });

  // Fetch created user (without password or refreshToken)
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    return res.status(500).json({ message: "Failed to create user" });
  }

  res.status(201).json(createdUser);
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate credentials
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // Find user and validate password
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.isPasswordCorrect(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // Generate tokens
  const { accessToken, refreshToken } =
    await generateAccessandRefreshTokens(user);
  if (!refreshToken) {
    return res
      .status(500)
      .json({ message: "Failed to generate refresh token" });
  }

  const userData = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!userData) {
    return res.status(500).json({ message: "Failed to retrieve user data" });
  }

  // Send tokens as HTTP-only cookies
  const options = { httpOnly: true };
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      user: userData,
      token: accessToken,
    });
});

export const logoutUser = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  // Clear refresh token from DB
  user.refreshToken = null;
  await user.save({ validateBeforeSave: false });

  // Clear cookies
  const options = { httpOnly: true };
  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({ message: "User logged out successfully" });
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.headers.authorization?.split(" ")[1];

  if (!incomingRefreshToken) {
    return res
      .status(401)
      .json({ message: "Unauthorized access: No refresh token provided" });
  }

  // Verify and decode refresh token
  const decodedRefreshToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(decodedRefreshToken?._id).select(
    "-password -refreshToken"
  );
  if (!user) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  if (incomingRefreshToken !== user.refreshToken) {
    return res.status(401).json({ message: "Refresh token does not match" });
  }

  // Issue new tokens
  const { accessToken, refreshToken } =
    await generateAccessandRefreshTokens(user);

  // Set new tokens as cookies
  const options = { httpOnly: true };
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      accessToken,
      refreshToken,
    });
});

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const projectCount = await Project.countDocuments({ createdBy: user._id });

  res.status(200).json({ user, projectCount });
});

export const getUserRepos = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  res.status(200).json(user.repos);
});

export const getStats = asyncHandler(async (_, res) => {
  const userCount = await User.countDocuments({});
  const deploymentCount = await Deployment.countDocuments({});

  res.status(200).json({ userCount, deploymentCount });
});

const otpMap = new Map();

export const sendOtp = async (req, res) => {
  const { email } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Email already in use" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000;

  otpMap.set(email, { otp, expiresAt });

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"Ignitia" <${process.env.EMAIL}>`,
    to: email,
    subject: "Email Verification OTP",
    text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
  });

  res.json({ message: "OTP sent" });
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const record = otpMap.get(email);

  if (!record || Date.now() > record.expiresAt) {
    return res.status(400).json({ message: "OTP expired or not found" });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  otpMap.delete(email);
  res.json({ message: "Email verified" });
};

const resetTokenMap = new Map();

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + 15 * 60 * 1000;

  resetTokenMap.set(token, { userId: user._id, expiresAt });

  const resetLink = `${process.env.FRONTEND_URL}/auth/resetPassword?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"Ignitia" <${process.env.EMAIL}>`,
    to: email,
    subject: "Reset your password",
    text: `Click this link to reset your password: ${resetLink}\n\nThe link expires in 15 minutes.`,
  });

  res.json({ message: "Reset link sent" });
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  const record = resetTokenMap.get(token);
  
  if (!record || Date.now() > record.expiresAt) {
    return res.status(400).json({ message: "Token invalid or expired" });
  }

  const user = await User.findById(record.userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.password = newPassword;
  await user.save();

  resetTokenMap.delete(token);

  res.json({ message: "Password updated successfully" });
};
