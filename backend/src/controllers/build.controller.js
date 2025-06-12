import { asyncHandler } from "../utils/asyncHandler.util.js";
import { exec } from "child_process";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

export const cloneRepo = asyncHandler(async (req, res) => {
  const { repoName, cloneUrl } = req.body;

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const targetDir = path.join(__dirname, "../../public/repo_temp", repoName);

  exec(`git clone ${cloneUrl} "${targetDir}"`, (err, stdout, stderr) => {
    if (err) {
      console.error(`Clone failed:`, err);
      return res.status(500).json({ message: "Error cloning repository" });
    }
    console.log("Cloned successfully");
    return res.status(200).json({
      message: "Cloned successfully",
      location: `${targetDir}`,
    });
  });
});
