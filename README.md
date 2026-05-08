# 🛰️ MissionControl
### *Volunteer Logistics Command Center — Food Rescue Operations*

<div align="center">

![Version](https://img.shields.io/badge/version-0.1.0-00e5ff?style=for-the-badge&logo=github)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%2B%20Auth-FFCA28?style=for-the-badge&logo=firebase)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)

> **"Every second of delay is food that doesn't reach a plate."**  
> MissionControl is a high-performance, standalone command dashboard built for volunteer food rescue logistics — decoupled from the Nourish Connect platform and engineered for operational independence, speed, and scale.

</div>

---

## 📡 System Overview

MissionControl is not a typical volunteer app. It is a **tactical operations interface** — purpose-built with the design philosophy of modern aerospace command centers and Tesla's mission-critical software UI. It empowers volunteer couriers with real-time intelligence, live mission tracking, and gamified engagement mechanics to maximize food rescue throughput.

Originally an embedded module within the **Nourish Connect** ecosystem, MissionControl has been **architecturally decoupled** into a fully independent, serverless application — deployable, scalable, and operable on its own.

```
┌─────────────────────────────────────────────────────────────┐
│                   🛰️  MISSIONCONTROL v0.1.0                  │
│              Independent Command Center — ACTIVE            │
├─────────────────────────────────────────────────────────────┤
│  STATUS     ██████████████████████████  OPERATIONAL         │
│  MISSIONS   Real-time · AI-Ranked · Urgency-Flagged         │
│  TRACKING   Live GPS · Dynamic ETA · Route Intelligence     │
│  ALERTS     Emergency HUD · Near-Expiry Detection           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Mission Log — Feature Manifest

### `[MODULE 01]` 📍 Tactical Mission Radar
> **Status: LIVE**

A real-time, AI-ranked feed of all available food rescue missions in the volunteer's operational zone. Each mission entry surfaces urgency indicators, food category, estimated pickup load, and a relevance score calculated from volunteer proximity, skill tier, and mission criticality. No manual filtering — the radar surfaces what matters most, now.

---

### `[MODULE 02]` 🗺️ Live GPS Tracking
> **Status: LIVE**

A high-fidelity, interactive map interface powered by **Leaflet / React-Leaflet** rendering active deliveries in real time. Features dynamic ETA recalculation as conditions change, route overlays, and multi-mission context visibility — enabling dispatchers and volunteers alike to maintain full situational awareness at all times.

---

### `[MODULE 03]` 🏆 Gamified Impact Engine
> **Status: LIVE**

A comprehensive **XP and Leveling system** designed to convert volunteer effort into visible, meaningful progress. Couriers earn experience points for completed rescues, streaks, and high-urgency missions — advancing through a tiered rank structure:

| Rank Tier | Title | XP Threshold |
|-----------|-------|-------------|
| 🥉 Tier 1 | Field Agent | 0 – 499 XP |
| 🥈 Tier 2 | Rescue Specialist | 500 – 1,999 XP |
| 🥇 Tier 3 | Senior Courier | 2,000 – 4,999 XP |
| 🏅 Tier 4 | Elite Courier | 5,000 – 9,999 XP |
| 🛸 Tier 5 | Phantom Operator | 10,000+ XP |

---

### `[MODULE 04]` 🚨 Emergency Alert HUD
> **Status: LIVE**

A critical, heads-up alert overlay that automatically triggers when high-volume food consignments approach their expiration window. The HUD interrupts the standard UI with full-surface alerts, mission urgency classification, and one-tap mission acceptance — designed to eliminate response latency in time-critical scenarios.

---

### `[MODULE 05]` ☁️ Serverless Architecture
> **Status: PRODUCTION-READY**

Engineered for elastic scale on a fully serverless stack. **Firebase Firestore** provides real-time data sync with no polling overhead; **Firebase Auth** handles identity with zero-config social and email flows; and the **Next.js 15 App Router** delivers edge-optimized rendering. Zero infrastructure management. Deploy once to Vercel and scale infinitely.

---

## 🧱 Architecture — The Independent Command Center

MissionControl operates as a **self-contained application** with its own Firebase project, auth context, and data namespace. The decoupling strategy was deliberate:

```
┌────────────────────────────────────────────────────────────────────┐
│                      SYSTEM ARCHITECTURE                           │
│                                                                    │
│   ┌─────────────────────────────────────────────────────────┐      │
│   │                  Next.js 15 App Router                  │      │
│   │  /app                                                   │      │
│   │    ├── (auth)/          → Login, Registration           │      │
│   │    ├── dashboard/       → Command Center HUD            │      │
│   │    ├── missions/        → Tactical Radar + Accept       │      │
│   │    ├── tracking/[id]/   → Live GPS Map Interface        │      │
│   │    └── profile/         → XP Engine + Rank Display      │      │
│   └─────────────────────────────────────────────────────────┘      │
│                            │                                       │
│             ┌──────────────┼──────────────┐                        │
│             ▼              ▼              ▼                        │
│       ┌──────────┐  ┌──────────┐  ┌──────────────┐                │
│       │Firestore │  │  Auth    │  │  Edge Config  │                │
│       │Real-time │  │ Firebase │  │  (Next.js)    │                │
│       └──────────┘  └──────────┘  └──────────────┘                │
│                                                                    │
│   Deployed on: Vercel Edge Network                                 │
└────────────────────────────────────────────────────────────────────┘
```

**Key architectural decisions:**

- **App Router (Next.js 15):** Server Components are used for initial data hydration; Client Components are scoped to interactive HUD elements, map rendering, and animation layers.
- **Firebase Firestore:** Real-time listeners (`onSnapshot`) power the Mission Radar and Alert HUD without REST polling.
- **No Shared State with Nourish Connect:** MissionControl maintains its own Firestore collections and Firebase Auth instance, enabling fully independent deployments.
- **Framer Motion:** Animation logic is isolated into reusable motion variants — ensuring silky transitions don't compromise bundle size.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| ⚙️ Framework | Next.js 15 (App Router) | SSR, routing, edge rendering |
| 🔷 Language | TypeScript 5.x | Type safety across all modules |
| 🎨 Styling | Tailwind CSS | Utility-first, dark-mode-first design |
| 🎞️ Animation | Framer Motion | HUD transitions, radar pulses, XP effects |
| 🗺️ Maps | Leaflet + React-Leaflet | Live GPS map rendering |
| 🔥 Database | Firebase Firestore | Real-time mission & delivery data |
| 🔐 Auth | Firebase Auth | Volunteer identity & session management |
| 🖼️ Icons | Lucide React | Consistent, lightweight icon system |
| 🚀 Deploy | Vercel | Production-grade edge deployment |

---

## 🚀 Launch Sequence — Installation

### Prerequisites

Ensure your environment meets the following before ignition:

- **Node.js** `v18.17+` (recommended: `v20 LTS`)
- **npm** `v9+` or **pnpm** `v8+`
- A **Firebase project** with Firestore and Authentication enabled
- A **Vercel account** (for production deployment)

> ⚠️ **React 19 Compatibility Note:** MissionControl targets **React 19** (bundled with Next.js 15). Some third-party packages — including certain Leaflet wrappers — may require the `--legacy-peer-deps` flag during installation. See Step 3 for guidance.

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-org/missioncontrol.git
cd missioncontrol
```

---

### Step 2 — Install Dependencies

Using **npm**:
```bash
npm install
```

Using **pnpm** (recommended):
```bash
pnpm install
```

> **React 19 peer dependency conflicts?** If you encounter peer dependency resolution errors from packages that have not yet declared React 19 support (e.g., `react-leaflet`), use the legacy resolver flag:
> ```bash
> npm install --legacy-peer-deps
> ```

---

### Step 3 — Configure Environment Variables

Create a `.env.local` file in the project root. All Firebase credentials are available from your **Firebase Console → Project Settings → Your Apps → SDK setup and configuration**.

```bash
cp .env.example .env.local
```

Then populate `.env.local` with your project's values:

```env
# ─────────────────────────────────────────────────
# 🔥 FIREBASE — Core Configuration
# ─────────────────────────────────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# ─────────────────────────────────────────────────
# 🗺️ MAPS — Optional: Tile Provider API Key
# ─────────────────────────────────────────────────
# Leave blank to use default OpenStreetMap tiles (no key required)
NEXT_PUBLIC_MAPTILER_API_KEY=your_maptiler_key_optional

# ─────────────────────────────────────────────────
# 🌐 APP — Base URL
# ─────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> 🔒 **Security:** Never commit `.env.local` to version control. Ensure `.env.local` is listed in your `.gitignore`.

---

### Step 4 — Ignite Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The command center will initialize.

---

### Step 5 — Production Build (Pre-Flight Check)

```bash
npm run build
npm run start
```

Review build output for any TypeScript or lint warnings before deploying to Vercel.

---

## 🌐 Deploying to Vercel

MissionControl is production-optimized for the **Vercel Edge Network**.

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy
vercel --prod
```

Alternatively, connect your GitHub repository to Vercel for **automatic CI/CD deployments** on every push to `main`.

> **Vercel Environment Variables:** Mirror your `.env.local` values into your Vercel project under **Settings → Environment Variables** before your first production deploy.

---

## 📁 Project Structure

```
missioncontrol/
├── app/                        # Next.js 15 App Router
│   ├── (auth)/                 # Auth flow: login, register
│   ├── dashboard/              # Primary Command HUD
│   ├── missions/               # Tactical Mission Radar
│   ├── tracking/
│   │   └── [id]/               # Live GPS Tracking View
│   ├── profile/                # XP Engine + Rank System
│   ├── globals.css             # Tailwind base + CSS variables
│   └── layout.tsx              # Root layout with providers
│
├── components/
│   ├── ui/                     # Reusable base components
│   ├── hud/                    # Emergency Alert HUD
│   ├── map/                    # Leaflet map wrappers
│   ├── radar/                  # Mission Radar feed
│   └── gamification/           # XP bar, rank badge, level-up overlays
│
├── lib/
│   ├── firebase/               # Firebase init, auth helpers, Firestore hooks
│   ├── utils/                  # Shared utility functions
│   └── constants/              # App-wide constants (ranks, XP thresholds)
│
├── hooks/                      # Custom React hooks (useMissions, useTracking…)
├── types/                      # Global TypeScript type definitions
├── public/                     # Static assets
├── .env.local                  # 🔒 Local environment variables (git-ignored)
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind + custom design tokens
└── tsconfig.json               # TypeScript compiler configuration
```

---

## 📜 Available Scripts

| Command | Action |
|---------|--------|
| `pnpm dev` | Start development server at `localhost:3000` |
| `pnpm build` | Compile production build |
| `pnpm start` | Serve the production build locally |
| `pnpm lint` | Run ESLint across the codebase |
| `pnpm type-check` | Run TypeScript compiler check (no emit) |

---

## 🗺️ Roadmap — Upcoming Modules

| Module | Status | Target |
|--------|--------|--------|
| 🤖 AI Mission Prioritization API | 🔄 In Progress | v0.2.0 |
| 📊 Volunteer Analytics Dashboard | 📋 Planned | v0.2.0 |
| 📱 Progressive Web App (PWA) | 📋 Planned | v0.3.0 |
| 🔔 Push Notification System | 📋 Planned | v0.3.0 |
| 🌍 Multi-City Operations Support | 🔭 Scoped | v0.4.0 |

---

## 🤝 Contributing

MissionControl is mission-driven software. Contributions that improve rescue throughput, volunteer experience, or system reliability are welcome.

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/module-name`
3. **Commit** with semantic messages: `git commit -m "feat(radar): add urgency tier filtering"`
4. **Push** to your fork and open a **Pull Request**

Please ensure all PRs pass `pnpm lint` and `pnpm type-check` before submission.

---

## 📄 License

```
MIT License — MissionControl v0.1.0
Copyright (c) 2025 MissionControl Contributors
```

---

<div align="center">

**Built for the volunteers who move fast so food doesn't go to waste.**

🛰️ *MissionControl — Always Operational*

</div>
