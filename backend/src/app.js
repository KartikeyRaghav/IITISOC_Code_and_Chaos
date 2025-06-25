import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: `${process.env.FRONTEND_URL}`,
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// Import routes
import userRouter from "./routes/user.route.js";
import githubRouter from "./routes/github.route.js";
import buildRouter from "./routes/build.route.js";
import projectRouter from "./routes/project.route.js";
import deploymentRouter from "./routes/deployment.route.js";

// Use routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/github", githubRouter);
app.use("/api/v1/build", buildRouter);
app.use("/api/v1/project", projectRouter);
app.use("/api/v1/deployment", deploymentRouter);

export { app };
