import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    await User.findById(decodedToken?._id)
      .select("-password -refreshToken")
      .then((user) => {
        if (!user) {
          return res.status(401).json({ message: "User not found" });
        }
        req.user = user;
        next();
      })
      .catch((error) => {
        return res.status(500).json({ message: "Internal server error" });
      });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
});
