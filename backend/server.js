import express from "express";
import dotenv from "dotenv";

const app = express();
dotenv.config({ path: "./.env" });

app.get("/", (req, res) => {
  console.log("Hello World");
  res.send("<h1>Hello World</h1>");
});

app.listen(process.env.PORT, () => {
  console.log(process.env.PORT);
});
