// src/utils/githubApp.util.js

import crypto from "crypto";
import jwt from "jsonwebtoken";
import { readFileSync } from "fs";
import fetch from "node-fetch";

// 1. Verify webhook signature
export function verifyWebhookSignature(req) {
  const signature = req.headers["x-hub-signature-256"];
  const payload = req.rawBody || JSON.stringify(req.body);
  const hmac = crypto.createHmac(
    "sha256",
    process.env.GITHUB_APP_WEBHOOK_SECRET
  );
  const digest = `sha256=${hmac.update(payload).digest("hex")}`;

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

// 2. Generate GitHub App JWT (10 min lifetime)
export function generateAppJWT() {
  const privateKey = readFileSync(
    process.env.GITHUB_APP_PRIVATE_KEY_PATH,
    "utf8"
  );

  return jwt.sign(
    {
      iss: process.env.GITHUB_APP_ID,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 600,
    },
    privateKey,
    { algorithm: "RS256" }
  );
}

// 3. Get access token for a specific installation
export async function getInstallationAccessToken(installationId) {
  const jwtToken = generateAppJWT();

  const response = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to get installation token: ${errorData.message}`);
  }

  const data = await response.json();
  return data.token;
}
