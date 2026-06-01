# BuildrX SaaS Platform 🚀

Welcome to **BuildrX**, a production-ready, multi-tenant SaaS platform that enables users to:
1. **Convert any website URL into an Android APK** (WebView-based) with custom branding, themes, permissions, and native bridges.
2. **Publish and monetize APIs** on a global, search-friendly API Marketplace.
3. **Route, authenticate, rate-limit, and audit** requests dynamically utilizing our fast Redis-backed API Gateway Proxy.
4. **Manage API Keys, quotas, invoices, and analytics** from a unified glassmorphic dark-themed dashboard.

---

## 🛠️ Technology Stack

### Backend Core
- **Runtime:** Node.js 22 + TypeScript
- **Framework:** Express.js with modular routing
- **Database:** PostgreSQL 16 managed via Prisma ORM
- **Cache & Limits:** Redis 7 (Sorted sets sliding-window limiters & JWT key caches)
- **Job Queues:** BullMQ background queues for APK packaging
- **Gateways:** Reverse proxy using `http-proxy-middleware` and custom header filters
- **SSE Events:** Redis Pub/Sub powered Server-Sent Events for real-time compilation updates

### Frontend Core
- **Framework:** Next.js 15 (App Router, dynamic page guards)
- **Styling:** Tailwind CSS + dark glassmorphic design systems
- **State & Queries:** Zustand (session store) + Axios interceptors
- **Visuals:** Recharts for premium analytics graphs

---

## 📂 Project Structure

```
├── backend/                  # Express.js + TS + Prisma Server
│   ├── prisma/               # Schema and DB migrations
│   ├── src/
│   │   ├── app.ts            # App configurations & gateway proxies
│   │   ├── server.ts         # Port listeners & connections
│   │   ├── controllers/      # Auth, Builder, Keys, Marketplace controllers
│   │   ├── middleware/       # JWT Auth & Gateway proxy middlewares
│   │   └── worker/           # Background BullMQ compilation worker
│   └── Dockerfile
├── templates/
│   └── android-webview/      # Source Kotlin project copy template
├── frontend/                 # Next.js 15 app
│   ├── src/app/              # App router (marketplace, pricing, dashboard, admin tabs)
│   ├── src/components/       # Real-time phone previews, layouts
│   └── src/context/          # Axios JWT refresh context providers
├── docker-compose.yml        # PostgreSQL, Redis, Express, Worker orchestration
├── Dockerfile.worker         # BullMQ queue runner container config
└── .env.example              # Environments template
```

---

## 🚀 Quick Start Setup Guide

### Option A: Local Manual Boot

#### 1. Setup Backend Dependencies
1. Navigate to the backend directory and install modules:
   ```bash
   cd backend
   npm install
   ```
2. Configure your local database and cache. Create a `.env` file from the root `.env.example`:
   ```bash
   cp ../.env.example .env
   ```
3. Boot database migrations and client schemas:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```
4. Start the Express server and BullMQ worker:
   ```bash
   # In terminal 1: start Express API server
   npm run dev
   
   # In terminal 2: start BullMQ queue compiler worker
   npm run worker
   ```

#### 2. Setup Next.js Frontend Dashboard
1. Navigate to the frontend directory and install modules:
   ```bash
   cd ../frontend
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) inside your browser to view the landing page!

---

### Option B: Local Docker-Compose Orchestration (Recommended)

1. Verify that **Docker** and **docker-compose** are installed.
2. From the root directory, spawn the services:
   ```bash
   docker-compose up --build
   ```
3. Docker compiles the PostgreSQL database, Redis store, Express.js backend server on `http://localhost:3001` and hooks the worker process automatically.

---

## 🛠️ Verification & Test Flows

### 1. Test URL-to-APK Builder (Simulation Fallback)
1. Go to `http://localhost:3000/register` and create an account.
2. From the dashboard, select **Start New Build** inside the APK Builder panel.
3. Configure step 1 (App Name, Website URL), pick step 2 (Theme Color, Status bar), choose step 3 (Allow Back Button), and click **Trigger APK Build**.
4. The panel redirects to `/dashboard/builder/[id]` and establishes a Server-Sent Events connection.
5. The queue worker updates steps: `Queued` &rarr; `Preparing` &rarr; `Building` &rarr; `Signing` &rarr; `Done`.
6. When completed, click **Download Signed APK** to fetch your simulated package!

### 2. Test API Gateway reverse proxy
1. In the marketplace (`/marketplace`), select any API (e.g. *NeuralText AI Engine*) and click **Subscribe Sandbox (Free)**.
2. The system registers your subscription, routes you to **API Key Manager**, and lets you generate an access token key (`bx_live_...`).
3. Click **View audit logs** on your key to open audit dashboards.
4. Open a shell terminal and issue a test curl call through the BuildrX Gateway:
   ```bash
   curl -X GET "http://localhost:3001/gateway/neuraltext-ai/languages" \
     -H "x-api-key: bx_live_your_actual_key_here" \
     -H "Content-Type: application/json"
   ```
5. The gateway validates your key inside the Redis cache, increments monthly limits, enforces sliding window rate-limits (60 req/min), logs latency, and returns the proxied upstream response dynamically!
