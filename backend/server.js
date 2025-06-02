import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";

const app = express();
dotenv.config({ path: "./.env" });

mongoose.connect('mongodb://mongo_ignitia:password@localhost:27017')

app.get("/", (req, res) => {
  console.log("Hello World");
  res.send("<h1>Hello World</h1>");
});

app.listen(process.env.PORT, () => {
  console.log(process.env.PORT);
});
