import { app } from "./app.js";
import { connectDB } from "./db/index.js";
import dotenv from "dotenv";

dotenv.config();

connectDB()
  .then(() => {
    // Checking if the database connection is successful
    app.on("error", (err) => {
      console.error("Server error:", err);
      throw err;
    });

    // Start the server
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });
