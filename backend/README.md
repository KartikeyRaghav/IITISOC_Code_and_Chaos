# 🚀 Ignitia – Frontend Deployment Platform

Welcome to **Ignitia**, a cloud-based frontend deployment platform designed to streamline building, deploying, and managing frontend projects with GitHub integration, Docker-based builds, and live analytics.

## 📚 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Key Features](#key-features)
- [Backend Modules](#backend-modules)
  - [Express Server](#express-server)
  - [Authentication & Authorization](#authentication--authorization)
  - [Database Models](#database-models)
  - [Project Management](#project-management)
  - [GitHub Integration](#github-integration)
  - [Build System](#build-system)
  - [Deployment System](#deployment-system)
  - [Analytics](#analytics)
  - [Environment Variables](#environment-variables)
- [Contributors](#contributors)

---

## 🧩 Overview

This repository powers the **Ignitia** frontend deployment platform. It includes the backend server that handles project creation, deployment, analytics tracking, GitHub OAuth integration, environment variable management, and more.

---

## 🏗️ Architecture

The backend is built using:

- **Node.js + Express**
- **MongoDB + Mongoose**
- **Docker** for builds and deployment
- **Nginx** as reverse proxy
- **JWT** for authentication
- **GitHub App + OAuth** for repo access
- **NGINX** for routing and subdomain management

---

## 🌟 Key Features

- GitHub OAuth & GitHub App Integration
- Auto-build on push/PR merge
- Docker-based image builds
- Live and preview deployments on subdomains
- Real-time analytics (visits, referers, bot detection)
- Environment variable management with secret support
- Rollback support for deployments
- Secure JWT-based user auth with OTP/email flows

---

## 🧪 Backend Modules

### 📡 Express Server

- Uses `cors`, `cookie-parser`, `dotenv` for environment & security setup
- Raw body support for GitHub webhooks
- Handles routes:
  - `/user`, `/project`, `/deployment`, `/build`, `/analytics`, `/env`, etc.

---

### 🔐 Authentication & Authorization

- JWT access and refresh tokens
- Auth flow:
  - Register/Login
  - OTP verification
  - Token-based protected routes
- Middleware: `verifyJWT`
- Refresh token stored in DB; access token in cookies

---

### 🗃️ Database Models (MongoDB)

- **User**: Auth, GitHub token, repo metadata
- **Project**: GitHub source, live/preview port, framework
- **Deployment**: Status, Docker image, logs, rollback
- **EnvVar**: Project env variables, with optional secrecy
- **PageVisit**: IP, referer, user agent, bot detection

---

### 📁 Project Management

- Create project from:
  - GitHub repo
  - ZIP upload
- Auto-deploy toggle
- NGINX config and port assignment

---

### 🧬 GitHub Integration

- OAuth-based user login
- GitHub App webhook handler
- Auto-triggers build on push/merge
- API to fetch repos, branches, installation metadata

---

### 🏗️ Build System

- Clone repo
- Detect tech stack (e.g., React, Next.js)
- Generate Dockerfile
- Build Docker image
- Stream logs during full build

---

### 🚀 Deployment System

- Deploy built containers to preview/live environments
- Tracks version history
- Supports rollback
- Stops containers on request

---

### 📊 Analytics

- Page visits tracked with:
  - Timestamp
  - IP, user agent, referer
  - Bot detection
- Aggregated analytics:
  - Daily / weekly / monthly views
  - Top referers
  - Unique IPs

---

### 🔐 Environment Variables

- APIs to add/update/delete per-project ENV variables
- Flags for secret handling
- JWT-protected route access

---

## 👨‍💻 Contributors

- **Kartikey Raghav**
- **Prachi Singh**

---
