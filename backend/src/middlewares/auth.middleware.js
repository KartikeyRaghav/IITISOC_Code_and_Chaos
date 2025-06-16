import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.util.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new ApiError(401, "Unauthorized access");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    await User.findById(decodedToken?._id)
      .select("-password -refreshToken")
      .then((user) => {
        if (!user) {
          throw new ApiError(401, "User not found");
        }
        req.user = user;
        next();
      })
      .catch((error) => {
        throw new ApiError(500, "Internal server error", error);
      });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Token expired");
    }
    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid token");
    }
    throw new ApiError(500, "Internal server error", error);
  }
});
