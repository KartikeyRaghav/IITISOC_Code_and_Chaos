# 🌐 Ignitia – Frontend

This is the **frontend** of a full-stack web deployment platform that lets users log in, connect GitHub, select repos, deploy them automatically, and monitor logs—all from a beautiful, modern UI.

---

## ⚙️ Tech Stack

- **React (Next.js 13+ / App Router)**
- **Tailwind CSS** – Utility-first styling
- **Framer Motion** – Smooth animations
- **Heroicons + Lucide** – Icon libraries
- **Cloudinary** – Profile image uploads
- **JWT Auth + Cookies** – Secure login sessions

---

## 🧩 Project Structure

```
src/ 
├── app/ # App router pages and layouts 
│ ├── layout.jsx 
│ ├── globals.css 
│ ├── page.jsx # Home page 
│ ├── auth/ # Login / Signup pages 
│ ├── dashboard/ # User dashboard 
│ ├── project/ # Project views and creation 
│ └── logs/ # Deployment logs per project 
├── components/ # Shared & UI components 
│ └── ui/ # ShadCN-style reusable UI 
├── constants/ # Static constants (URLs, text) 
├── lib/ # Utility functions 
└── utils/ # Middleware, log parsing
```

---

## 🚀 Features

### 👤 Authentication

- Login and register with JWT & refresh token (via cookies)
- Profile picture upload using Cloudinary
- Protected routes using `checkAuth.js`

### 🔗 GitHub Integration

- GitHub OAuth 2.0 login flow
- Repo & branch selector from user's GitHub

### 📂 Project Lifecycle

- Detect tech stack automatically from cloned repo
- Auto-generate Dockerfile from frontend
- Trigger backend build → image → run steps via logs
- View active deployments with live preview URLs

### 🧾 Log Monitoring

- Logs streamed using Server-Sent Events (SSE)
- Displayed with animation effects (via `EnhancedLogDisplay`)

---

## 🖼️ Notable Components

- `Hero.jsx` – Homepage hero section
- `Navbar.jsx`, `Header.jsx` – Navigation and headers
- `CustomToast.jsx`, `CustomLoader.jsx` – Toasts and loaders
- `CreateProject.jsx` – Guided repo → stack → deploy UI
- `DashboardMain.jsx`, `ActionPanel.jsx` – Dashboard widgets
- `Grid.jsx`, `AppIntro.jsx` – Home intro animations
- `EnhancedLogDisplay.jsx` – Real-time Docker log stream display

---

## 🧪 Utilities

### `checkAuth.js`

Protects routes by validating JWT via cookies/session.

### `logParser.js`

Parses log lines streamed from the backend and formats them into UI-friendly messages.

---

## 🔧 Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/KartikeyRaghav/IITISOC_Code_and_Chaos.git
cd frontend
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

## 🛡 Security Features

- Auth managed with `httpOnly` cookies (no localStorage)
- Backend CORS restricted to frontend origin
- No tokens stored client-side

---

## 📌 TODO

- [ ] Responsive layout optimizations
- [ ] Toast enhancement during deploy flow
- [ ] Add animation to log stream
- [ ] Role-based view control
- [ ] Use optimistic UI updates after deploy
