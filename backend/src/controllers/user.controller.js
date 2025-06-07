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

  const existingUser = User.findOne({ $or: [{ username }, { email }] });

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

  const user = User.create({
    username: username.toLowerCase(),
    password,
    fullName,
    email,
    profilePicture,
  });

  const createdUser = User.findById(user._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Failed to create user");
  }

  res
    .status(201)
    .json(new ApiResponse(201, "User registered successfully", createdUser));
});
