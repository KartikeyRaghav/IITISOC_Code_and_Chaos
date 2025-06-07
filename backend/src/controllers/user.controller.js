import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiError } from "../utils/ApiError.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.util.js";
import jwt from "jsonwebtoken";

const generateAccessandRefreshTokens = async (user) => {
  try {
    const accessToken = await user.generateAccessToken();
    if (!accessToken) {
      throw new ApiError(500, "Failed to generate access token");
    }
    user.refreshToken = await user.generateRefreshToken();
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken: user.refreshToken };
  } catch (error) {
    throw new ApiError(500, "Failed to generate tokens", error);
  }
};

export const registerUser = asyncHandler(async (req, res) => {
  const { username, password, fullName, email } = req.body;

  if (
    [fullName, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });

  if (existingUser) {
    throw new ApiError(400, "Username or email already exists");
  }

  const localProfilePicture = req.files?.profilePicture[0].path;
  let profilePicture = null;
  if (localProfilePicture) {
    try {
      const cloudinaryResponse = await uploadOnCloudinary(localProfilePicture);
      if (!cloudinaryResponse) {
        throw new ApiError(500, "Failed to upload profile picture");
      }
      profilePicture = cloudinaryResponse.url;
    } catch (error) {
      throw new ApiError(500, "Error uploading profile picture to Cloudinary");
    }
  }

  const user = await User.create({
    username: username.toLowerCase(),
    password,
    fullName,
    email,
    profilePicture,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Failed to create user");
  }

  res
    .status(201)
    .json(new ApiResponse(201, "User registered successfully", createdUser));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if ((!username && !email) || !password) {
    throw new ApiError(400, "Username/Email and password are required");
  }

  const user = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
  });

  if (!user || !(await user.isPasswordCorrect(password))) {
    throw new ApiError(401, "Invalid username or password");
  }

  const { accessToken, refreshToken } =
    await generateAccessandRefreshTokens(user);
  if (!refreshToken) {
    throw new ApiError(500, "Failed to generate refresh token");
  }

  const userData = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!userData) {
    throw new ApiError(500, "Failed to retrieve user data");
  }

  const options = {
    httpOnly: true,
    secure: true,
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
    throw new ApiError(401, "User not authenticated");
  }

  user.refreshToken = null;
  await user.save({ validateBeforeSave: false });

  const options = {
    httpOnly: true,
    secure: true,
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
    throw new ApiError(401, "Unauthorized access: No refresh token provided");
  }

  const decodedRefreshToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );

  const user = await User.findById(decodedRefreshToken?._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(401, "Invalid refresh token");
  }

  if (incomingRefreshToken !== user.refreshToken) {
    throw new ApiError(401, "Refresh token does not match");
  }

  const options = {
    httpOnly: true,
    secure: true,
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
