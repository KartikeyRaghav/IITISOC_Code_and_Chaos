import multer from "multer";
import fs from "fs";
import path from "path";

// Define the destination folder for uploaded files
const uploadDir = path.resolve("./temp/temp");

// Ensure the destination folder exists before handling uploads
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage engine
const storage = multer.diskStorage({
  // Set the destination where files should be stored
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  // Define how filenames should be generated
  filename: function (req, file, cb) {
    // Create a unique filename using timestamp and random number
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // File will be saved as fieldname-timestamp-random
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

// Export a configured multer instance for use in routes
export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/png",
      "image/jpeg",
      "application/zip",
      "application/x-tar",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type"), false);
    }
  },
});
