// Import required dependencies
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Create an Express application
const app = express();
const allowedOrigin = process.env.FRONTEND_URL;
const allowedPattern = /\.deploy\.princecodes\.online$/;

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origin === allowedOrigin ||
        allowedPattern.test(new URL(origin).hostname)
      ) {
        callback(null, true);
      } else {
        callback(new Error("CORS blocked: " + origin));
      }
    },
    credentials: true,
  })
);

app.use("/api/v1/github/webhook", express.raw({ type: "application/json" }));

// Middleware to parse JSON bodies (up to 50MB)
app.use((req, res, next) => {
  if (req.is("multipart/form-data")) {
    next(); // Skip JSON parsing
  } else {
    express.json({ limit: "50mb" })(req, res, next);
  }
});

// Middleware to parse URL-encoded data (form data)
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Middleware to parse cookies sent with requests
app.use(cookieParser());

// Import Route Modules
import userRouter from "./routes/user.route.js";
import githubRouter from "./routes/github.route.js";
import buildRouter from "./routes/build.route.js";
import projectRouter from "./routes/project.route.js";
import deploymentRouter from "./routes/deployment.route.js";
import { trackPageVisit } from "./controllers/pageVisit.controller.js";
import analyticsRouter from "./routes/analytics.route.js";
import { Project } from "./models/project.model.js";

// Route Middleware Setup
app.use("/api/v1/user", userRouter);
app.use("/api/v1/github", githubRouter);
app.use("/api/v1/build", buildRouter);
app.use("/api/v1/project", projectRouter);
app.use("/api/v1/deployment", deploymentRouter);
app.post("/api/v1/track", trackPageVisit);
app.use("/api/v1/analytics", analyticsRouter);

export { app };
