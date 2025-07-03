import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Extract token from cookies or Authorization header (Bearer token)
    const token =
      req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];

    // If no token is provided, block access
    if (!token) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    // Verify the token using the secret key
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Look up the user in the database by decoded token's _id
    await User.findById(decodedToken?._id)
      .select("-password -refreshToken") // Exclude sensitive fields
      .then((user) => {
        if (!user) {
          // If user not found, return unauthorized
          return res.status(401).json({ message: "User not found" });
        }

        // Attach user object to request for use in next middleware/controller
        req.user = user;
        next(); // Proceed to the next middleware or route handler
      })
      .catch((error) => {
        // Handle errors during DB lookup
        return res.status(500).json({ message: "Internal server error" });
      });
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === "TokenExpiredError") {
      const response = await fetch(
        `http://localhost:3000/api/v1/users/refreshToken`
      );
      if (response.ok) {
        const data = await response.json();
        const decodedToken = jwt.verify(
          data.accessToken,
          process.env.ACCESS_TOKEN_SECRET
        );

        // Look up the user in the database by decoded token's _id
        await User.findById(decodedToken?._id)
          .select("-password -refreshToken") // Exclude sensitive fields
          .then((user) => {
            if (!user) {
              // If user not found, return unauthorized
              return res.status(401).json({ message: "User not found" });
            }

            // Attach user object to request for use in next middleware/controller
            req.user = user;
            next(); // Proceed to the next middleware or route handler
          })
          .catch((error) => {
            // Handle errors during DB lookup
            return res.status(500).json({ message: "Internal server error" });
          });
      }
      return res.status(401).json({ message: "Token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      const response = await fetch(
        `http://localhost:3000/api/v1/users/refreshToken`
      );
      if (response.ok) {
        const data = await response.json();
        const decodedToken = jwt.verify(
          data.accessToken,
          process.env.ACCESS_TOKEN_SECRET
        );

        // Look up the user in the database by decoded token's _id
        await User.findById(decodedToken?._id)
          .select("-password -refreshToken") // Exclude sensitive fields
          .then((user) => {
            if (!user) {
              // If user not found, return unauthorized
              return res.status(401).json({ message: "User not found" });
            }

            // Attach user object to request for use in next middleware/controller
            req.user = user;
            next(); // Proceed to the next middleware or route handler
          })
          .catch((error) => {
            // Handle errors during DB lookup
            return res.status(500).json({ message: "Internal server error" });
          });
      }
      return res.status(401).json({ message: "Invalid token" });
    }

    // Handle other unknown errors
    return res.status(500).json({ message: "Internal server error" });
  }
});

const checkRefreshToken = async () => {};
