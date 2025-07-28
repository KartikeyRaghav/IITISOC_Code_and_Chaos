import { asyncHandler } from "../utils/asyncHandler.util.js";
import {
  verifyWebhookSignature,
  getInstallationAccessToken,
} from "../utils/githubApp.util.js";
import { Project } from "../models/project.model.js";
import fetch from "node-fetch";
import { User } from "../models/user.model.js";

export const githubWebhookHandler = asyncHandler(async (req, res) => {
  console.log("Webhook event received:", req.headers["x-github-event"]);
  console.log("Payload:", req.body);

  if (!verifyWebhookSignature(req)) {
    console.log("error found");
    return res.status(401).json({ message: "Invalid GitHub signature" });
  }

  try {
    const event = req.headers["x-github-event"];
    const payload = JSON.parse(req.body.toString("utf8"));
    console.log(payload.action);
    // Handle installation event to save installationId if needed
    if (event === "installation" && payload.action === "created") {
      const installationId = payload.installation.id;
      const githubUsername = payload.installation.account.login;
      console.log("working");
      // Find user and update installation ID
      const user = await User.findOneAndUpdate(
        { githubUsername },
        { githubInstallationId: installationId },
        { new: true }
      );

      if (!user) {
        console.warn("Installation created but no matching user found.");
      }

      return res.status(200).json({ message: "Installation recorded" });
    }

    // Handle push or PR merge
    if (
      event === "push" ||
      (event === "pull_request" &&
        payload.action === "closed" &&
        payload.pull_request?.merged === true)
    ) {
      const repoFullName = payload.repository.full_name; // e.g., "user/repo"
      const branch =
        event === "push"
          ? payload.ref.replace("refs/heads/", "")
          : payload.pull_request.base.ref;
      const installationId = payload.installation.id;

      const project = await Project.findOne({ repoFullName });
      if (!project) {
        return res
          .status(404)
          .json({ message: "Project not found for this repo" });
      }

      // Optional: only auto-build for specific branch
      if (project.branch !== branch) {
        return res
          .status(200)
          .json({ message: `Push to ignored branch: ${branch}` });
      }

      // Trigger internal build API
      await fetch(`${process.env.BACKEND_URL}/api/v1/build`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-key": process.env.INTERNAL_API_SECRET,
        },
        body: JSON.stringify({ projectName: project.projectName }),
      });

      return res.status(200).json({ message: "Build triggered" });
    }

    return res.status(200).json({ message: "Event ignored" });
  } catch (error) {
    console.error(error);
  }
});
