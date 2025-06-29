# 🚀 IGNITIA

_Ignite your web presence_

![Last Commit](https://img.shields.io/badge/last%20commit-today-brightgreen)
![Language](https://img.shields.io/badge/javascript-98.9%25-blue)
![Languages Used](https://img.shields.io/badge/languages-2-blue)

---

### _Built with the tools and technologies:_

![Express](https://img.shields.io/badge/Express-black?logo=express&logoColor=white)
![JSON](https://img.shields.io/badge/JSON-black?logo=json&logoColor=white)
![Markdown](https://img.shields.io/badge/Markdown-black?logo=markdown&logoColor=white)
![npm](https://img.shields.io/badge/npm-red?logo=npm&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-orange?logo=mongoose)
![Prettier](https://img.shields.io/badge/Prettier-ffd700?logo=prettier)
![ENV](https://img.shields.io/badge/.ENV-yellowgreen)
![JavaScript](https://img.shields.io/badge/JavaScript-yellow?logo=javascript)
![Nodemon](https://img.shields.io/badge/Nodemon-green?logo=nodemon)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![Cloudinary](https://img.shields.io/badge/Cloudinary-blue?logo=cloudinary)
![ESLint](https://img.shields.io/badge/ESLint-purple?logo=eslint)

---

## 📑 Table of Contents

- [Overview](#overview)
- [Screenshots](#screenshots)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Run Locally](#run-locally)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [API Routes](#api-routes)
- [TODOs](#todos)
- [License](#license)

---

## 🧭 Overview

**Ignitia** is a full-stack platform that helps developers:

- Authenticate with GitHub
- Select and deploy GitHub repos (React, Next.js, Express, etc.)
- Auto-generate Dockerfiles and build images
- Stream logs in real-time
- Host via dynamic subdomains (e.g. `project1.deploy.princecodes.online`)
- Monitor deployments with rollback capability

Think of it as your **Heroku alternative** with full visibility and control. 🔥

---

## 🖼️ Screenshots

> _(Add deployment previews, dashboard view, or GIFs here)_

---

## ✨ Features

- 🔐 JWT + Cookie-based Authentication
- ☁️ GitHub OAuth Integration
- 📦 Git Clone + Branch Selection
- 🧠 Tech Stack Detection
- 🐳 Dockerfile Generation + Build
- 🌐 Subdomain Live Preview (NGINX reverse proxy)
- 📄 Real-time Log Streaming (Docker build & run)
- 🧾 Deployment Versioning
- 🌍 Analytics Support (views, errors, uptime)
- 🧪 Webhooks Ready for CI/CD

---

## 🏗 Architecture

Frontend (Next.js + Tailwind)
↓
Backend (Express + MongoDB)
↓
Docker Engine (Build & Run)
↓
NGINX (Reverse Proxy)

---

## ⚙️ Getting Started

### Prerequisites

- Node.js ≥ v14
- npm ≥ v6
- Docker & Docker CLI
- MongoDB Database
- Cloudinary Account
- GitHub OAuth App

---

### 🛠 Environment Setup

Create `.env` in both `backend/` and `frontend/` folders.

#### `backend/.env`

```env
PORT=5000
FRONTEND_URL=http://localhost:4001
BACKEND_URL=http://localhost:3001

MONGODB_URI=your_mongo_uri

ACCESS_TOKEN_SECRET=...
REFRESH_TOKEN_SECRET=...

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

#### `frontend/.env`

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_FRONTEND_URL=http://localhost:4001
```

### 🚀 Run Locally

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

---

## 🧱 Tech Stack

| Layer        | Tech                                                                      |
| ------------ | ------------------------------------------------------------------------- |
| Frontend     | React.js (App Router), Tailwind CSS, Framer Motion, Cloudinary, ShadCN/UI |
| Backend      | Node.js, Express, MongoDB, Mongoose, Multer                               |
| Auth         | JWT, Refresh Tokens, Cookies                                              |
| DevOps       | Docker, NGINX, get-port                                                   |
| Integrations | GitHub OAuth, Cloudinary                                                  |

---

## 📁 Folder Structure

backend/
├── controllers/
├── models/
├── routes/
├── utils/
├── temp/
└── app.js

frontend/
├── app/ (pages & layouts)
├── components/
├── constants/
├── lib/
├── utils/
└── styles/

---

## 🔌 API Routes
For full API docs, see [backend/README.md](backend/README.md)

### Users

`POST /api/v1/users/register`
`POST /api/v1/users/login`
`GET /api/v1/users/logout`
`GET /api/v1/users/profile`

### GitHub

`GET /api/v1/github/oauth/consent`
`GET /api/v1/github/getUserRepos`
`GET /api/v1/github/branches?repo=...`

### Build

`POST /api/v1/build/clone`
`POST /api/v1/build/detect`
`POST /api/v1/build/dockerfile`
`POST /api/v1/build/image`
`POST /api/v1/build/run`

### Projects

`POST /api/v1/project/create`
`GET /api/v1/project/all`

### Deployment

`POST /api/v1/deployment/create`
`POST /api/v1/deployment/version`
`POST /api/v1/deployment/update`

---

## 📌 TODO

- [ ] Add domain verification & SSL integration
- [ ] CI/CD trigger support via Webhooks
- [ ] Team collaboration & invite support
- [ ] Add tests (Jest, React Testing Library)
