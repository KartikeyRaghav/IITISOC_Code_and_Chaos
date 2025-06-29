
# 🌐 Ignitia – Backend

This backend powers a **cloud-based web deployment platform**, allowing users to:
- Authenticate securely
- Connect their GitHub
- Clone and deploy frontend/backend repositories
- Auto-generate Dockerfiles
- Build, run, and reverse-proxy Docker containers
- Track deployments and analytics

---

## 📚 Features Overview

### 🔐 Auth & Session
- JWT-based login and registration
- Access & Refresh tokens via HTTP-only cookies
- Profile picture upload via Cloudinary

### 🧑‍💻 GitHub Integration
- GitHub OAuth 2.0 login
- Fetch repos, branches, metadata
- Pull source code automatically

### 🛠 Project Management
- Auto-detect tech stack (React, Next.js, Angular, etc.)
- Generate Dockerfile
- Build Docker image
- Run container
- Reverse proxy with NGINX (using dynamic subdomains)

### 🚚 Deployment & CI
- Record deployments with versioning and status
- Enable rollback readiness
- Webhook integration support for CI/CD

### 📈 Analytics (WIP)
- Track views, uptime, errors, response time

---

## 🧾 Models Summary

### 📦 `User`
| Field | Type | Description |
|-------|------|-------------|
| `fullName` | `String` | Required full name |
| `email` | `String` | Unique login ID |
| `password` | `String` | Hashed |
| `githubUsername` | `String` | Linked GitHub username |
| `repos` | `Array<Object>` | Synced GitHub repos |
| `hasGithubPermission` | `Boolean` | OAuth flag |
| `refreshToken` | `String` | JWT refresh token |
| `profilePicture` | `String` | Cloudinary URL |

### 🧪 `Project`
| Field | Type | Description |
|-------|------|-------------|
| `name` | `String` | Unique project name |
| `repoName` | `String` | GitHub repo name |
| `clonedPath` | `String` | Local path |
| `repositoryUrl` | `String` | GitHub clone URL |
| `framework` | `String` | Detected tech stack |
| `branch` | `String` | Default: main |
| `deploymentHistory` | `Array<ObjectId>` | References to `Deployment` |
| `webhook` | `ObjectId` | Optional `Webhook` |
| `customDomain` / `subdomain` | `String` | Custom DNS entries |
| `isLive` | `Boolean` | Deployment state |
| `sslStatus` | `String` | `"pending" | "issued" | "failed"` |

### 🚀 `Deployment`
| Field | Type | Description |
|-------|------|-------------|
| `version` | `String` | Auto-incrementing version |
| `status` | `String` | `"pending"`, `"completed"`, etc. |
| `imageName` | `String` | Docker image tag |
| `logUrl` | `String` | Build/run logs |
| `previewUrl` | `String` | Live preview link |
| `rollbackAvailable` | `Boolean` | Flag |
| `deployedBy` | `ObjectId` | Reference to `User` |
| `project` | `ObjectId` | Reference to `Project` |

### 🪝 `Webhook`
| Field | Type | Description |
|-------|------|-------------|
| `repoUrl` | `String` | Linked GitHub repo URL |
| `provider` | `String` | GitHub, GitLab, etc. |
| `secret` | `String` | For signature verification |
| `status` | `String` | `"active"` or `"inactive"` |

### 📊 `Analytics`
| Field | Type | Description |
|-------|------|-------------|
| `views` | `Number` | Total visits |
| `uniqueVisitors` | `Number` | Unique visits |
| `responseTimes` | `Array<Number>` | Response tracking |
| `uptime` | `Number` | Uptime percent |
| `erros` | `Number` | Typo: should be `errors` |
| `project` | `ObjectId` | Reference to `Project` |

---

## 🔧 Setup Instructions

### 1. Clone the Repo

```bash
git clone [https://github.com/KartikeyRaghav/IITISOC_Code_and_Chaos](https://github.com/KartikeyRaghav/IITISOC_Code_and_Chaos)
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

### 4. Run the Server

```bash
npm run dev
```

---

## 🧪 API Routes Overview

| Area | Base Path | Features |
|------|-----------|----------|
| User | `/api/v1/users` | Login, register, logout, token refresh, profile |
| GitHub | `/api/v1/github` | OAuth login, repos, branches |
| Build | `/api/v1/build` | Clone repo, detect stack, docker build/run |
| Project | `/api/v1/project` | CRUD project, check names |
| Deployment | `/api/v1/deployment` | Create, versioning, update status |

---

## 🛡 Security Notes

- Uses bcrypt for password hashing
- Access and refresh tokens via `httpOnly` cookies
- Docker and NGINX isolated for project sandboxing
- CORS properly scoped to `FRONTEND_URL`

---

## 📌 TODO

- [ ] Add webhook event handling (CI/CD triggers)
- [ ] Add project delete/archive
- [ ] Add team collaboration (multi-user project sharing)
- [ ] Rate limit sensitive routes (login, OAuth)

