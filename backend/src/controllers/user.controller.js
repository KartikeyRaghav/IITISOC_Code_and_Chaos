import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.util.js";
import jwt from "jsonwebtoken";

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

  if ([fullName, email, password].some((field) => field?.trim() === "")) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).json({ mesaage: "Email already in use" });
  }

  const localProfilePicture = req.files?.profilePicture[0].path;
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

  const user = await User.create({
    password,
    fullName,
    email,
    profilePicture,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    return res.status(500).json({ message: "Failed to create user" });
  }

  res
    .status(201)
    .json(new ApiResponse(201, "User registered successfully", createdUser));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({
    email: email.toLowerCase(),
  });

  if (!user || !(await user.isPasswordCorrect(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

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

  const options = {
    httpOnly: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "User logged in successfully", {
        user: userData,
        token: accessToken,
      })
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  user.refreshToken = null;
  await user.save({ validateBeforeSave: false });

  const options = {
    httpOnly: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User logged out successfully"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.headers.authorization?.split(" ")[1];

  if (!incomingRefreshToken) {
    return res
      .status(401)
      .json({ message: "Unauthorized access: No refresh token provided" });
  }

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

  const options = {
    httpOnly: true,
  };

  const { accessToken, refreshToken } =
    await generateAccessandRefreshTokens(user);

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "Access token refreshed successfully", {
        accessToken,
        refreshToken,
      })
    );
});

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  res.status(200).json({ user });
});

export const getUserRepos = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  res.status(200).json(user.repos);
});
