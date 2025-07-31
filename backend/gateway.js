import express from "express";
import axios from "axios";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const PORT = 9999;

const CACHE = {}; // Optional: subdomain -> port cache

app.use(async (req, res, next) => {
  const host = req.headers.host; // e.g., project1.deploy.princecodes.online
  const subdomain = host?.split(".")[0];

  if (!subdomain) return res.status(400).send("Invalid subdomain");

  // Use cache if available
  if (CACHE[subdomain]) {
    req.targetPort = CACHE[subdomain];
    return next();
  }

  try {
    // Call backend to resolve subdomain → port
    const { data } = await axios.get(
      `http://localhost:3001/api/v1/resolve/${subdomain}`
    );

    req.targetPort = data.port;
    CACHE[subdomain] = data.port; // optional: cache it
    next();
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(404).send("Project not found");
  }
});

app.use("*", (req, res, next) => {
  const target = `http://localhost:${req.targetPort}`;

  createProxyMiddleware({
    target,
    changeOrigin: true,
    ws: true,
  })(req, res, next);
});

app.listen(PORT, () => {
  console.log(`🔁 Gateway server running on port ${PORT}`);
});
