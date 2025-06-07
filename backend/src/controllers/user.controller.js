import { asyncHandler } from "../utils/asyncHandler.util.js";
import { ApiError } from "../utils/ApiError.util.js";
import { ApiResponse } from "../utils/ApiResponse.util.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.util.js";

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

  const accessToken = await user.generateAccessToken();
  if (!accessToken) {
    throw new ApiError(500, "Failed to generate access token");
  }

  user.refreshToken = await user.generateRefreshToken();
  await user.save({ validateBeforeSave: false });

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
    .cookie("refreshToken", user.refreshToken, options)
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

  res
    .status(200)
    .cookie("accessToken", "", {
      httpOnly: true,
      secure: true,
      expires: new Date(0),
    })
    .cookie("refreshToken", "", {
      httpOnly: true,
      secure: true,
      expires: new Date(0),
    })
    .json(new ApiResponse(200, "User logged out successfully"));
});
