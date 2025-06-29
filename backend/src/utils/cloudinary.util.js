import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Use HTTPS for API calls
});

// Uploads a file to Cloudinary and deletes the local copy after upload.
export const uploadOnCloudinary = async (filePath) => {
  try {
    // Ensure the filePath is provided
    if (!filePath) {
      throw new Error("File path is required for upload");
    }

    // Upload the file to Cloudinary, let it auto-detect the file type
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto", // Automatically detect image, video, etc.
    });

    console.log("File uploaded successfully:", result.url);

    // Delete the local file after successful upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return result;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);

    // Always try to delete the file, even if upload fails
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Re-throw the error to be handled by calling function
    throw error;
  }
};
