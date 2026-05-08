<div align="center">

<!-- HERO BANNER -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f0c29,50:302b63,100:24243e&height=200&section=header&text=🛰️%20MISSIONCONTROL&fontSize=52&fontColor=00e5ff&animation=fadeIn&fontAlignY=38&desc=Volunteer%20Logistics%20Command%20Center%20—%20Food%20Rescue%20Operations&descAlignY=58&descSize=16&descColor=ffffff" width="100%"/>

<!-- DYNAMIC TYPING -->
<a href="https://github.com/your-org/missioncontrol">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=22&pause=1000&color=00E5FF&center=true&vCenter=true&width=600&lines=Real-Time+Food+Rescue+Operations;AI-Ranked+Mission+Intelligence;Live+GPS+%2B+Dynamic+ETA+Tracking;Gamified+Volunteer+Engagement;Built+for+Scale+%E2%80%94+Serverless+%26+Edge-Ready" alt="Typing SVG" />
</a>

<br/><br/>

<!-- BADGE ROW 1 — STATUS -->
<img src="https://img.shields.io/badge/STATUS-OPERATIONAL-00e5ff?style=for-the-badge&logo=statuspage&logoColor=black" />
<img src="https://img.shields.io/badge/VERSION-0.1.0-blueviolet?style=for-the-badge&logo=semver&logoColor=white" />
<img src="https://img.shields.io/badge/LICENSE-MIT-22c55e?style=for-the-badge&logo=opensourceinitiative&logoColor=white" />
<img src="https://img.shields.io/badge/PRs-WELCOME-f97316?style=for-the-badge&logo=github&logoColor=white" />

<br/>

<!-- BADGE ROW 2 — STACK -->
<img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Tailwind_CSS-3.x-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
<img src="https://img.shields.io/badge/Firebase-Firestore%20%26%20Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
<img src="https://img.shields.io/badge/Framer_Motion-Latest-e100ff?style=for-the-badge&logo=framer&logoColor=white" />
<img src="https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel&logoColor=white" />

<br/><br/>

<!-- HERO SCREENSHOT — Replace with your actual screenshot -->
<img src="https://raw.githubusercontent.com/your-org/missioncontrol/main/public/screenshots/dashboard-hero.png" alt="MissionControl Dashboard" width="90%" />

<sub><i>🛰️ MissionControl — The Command Center Dashboard in full operational mode</i></sub>

<br/><br/>

---

</div>

## 🧭 Navigation

<details open>
<summary><b>📋 Click to expand Table of Contents</b></summary>

- [🌌 What is MissionControl?](#-what-is-missioncontrol)
- [✨ Feature Showcase](#-feature-showcase)
- [🏗️ System Architecture](#-system-architecture)
- [⚙️ Tech Stack](#-tech-stack)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Running the App](#running-the-app)
- [📖 Full User Workflow](#-full-user-workflow)
  - [1. Volunteer Onboarding](#1-volunteer-onboarding)
  - [2. The Command Dashboard](#2-the-command-dashboard)
  - [3. Mission Radar — Accepting a Rescue](#3-mission-radar--accepting-a-rescue)
  - [4. Live GPS Tracking a Delivery](#4-live-gps-tracking-a-delivery)
  - [5. Emergency Alert HUD Response](#5-emergency-alert-hud-response)
  - [6. XP & Rank Progression](#6-xp--rank-progression)
- [📁 Project Structure](#-project-structure)
- [🔥 Firebase Configuration](#-firebase-configuration)
- [🗺️ Map Integration Guide](#-map-integration-guide)
- [🌐 Deployment to Vercel](#-deployment-to-vercel)
- [🧪 Scripts Reference](#-scripts-reference)
- [🛠️ Troubleshooting](#-troubleshooting)
- [🗺️ Roadmap](#-roadmap)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

</details>

---

## 🌌 What is MissionControl?

<table>
<tr>
<td width="55%">

**MissionControl** is a high-performance, standalone **Volunteer Logistics Command Center** built for food rescue operations. Originally an embedded module inside the **Nourish Connect** platform, it has been fully decoupled into its own independent, serverless application.

The design philosophy draws from **Tesla's tactical interfaces** and modern **aerospace command centers** — featuring dark-mode-first aesthetics, glassmorphism panels, real-time data streams, and fluid Framer Motion animations.

> This is not a form. This is not a CRUD app.  
> **This is a mission-critical operations terminal.**

**Who is it for?**
- 🧑‍🤝‍🧑 **Volunteer Couriers** — Accept, track, and complete food rescue missions
- 🏢 **Food Bank Dispatchers** — Monitor active missions and send emergency alerts
- 📊 **Operations Leads** — Review volunteer XP, rank progression, and mission history

</td>
<td width="45%">

```
╔══════════════════════════════════════╗
║    🛰️  MISSIONCONTROL v0.1.0         ║
║    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    ║
║                                      ║
║  ⬤  MISSION RADAR         LIVE      ║
║  ⬤  GPS TRACKING          ACTIVE    ║
║  ⬤  EMERGENCY HUD         ARMED     ║
║  ⬤  XP ENGINE             RUNNING   ║
║  ⬤  FIREBASE SYNC         STABLE    ║
║                                      ║
║  MISSIONS AVAILABLE    ████░░  12    ║
║  ACTIVE COURIERS       ██████  27    ║
║  MEALS RESCUED TODAY   ████████ 403  ║
╚══════════════════════════════════════╝
```

</td>
</tr>
</table>

---

## ✨ Feature Showcase

<div align="center">
<img src="https://raw.githubusercontent.com/your-org/missioncontrol/main/public/screenshots/features-overview.png" alt="Features Overview" width="90%" />
</div>

<br/>

### `[MODULE 01]` 📡 Tactical Mission Radar

<table>
<tr>
<td width="50%">

<img src="https://raw.githubusercontent.com/your-org/missioncontrol/main/public/screenshots/mission-radar.png" alt="Mission Radar" width="100%" />

</td>
<td width="50%">

**Real-time, AI-ranked feed of available food rescue missions.**

- 🔴 **Urgency Indicators** — Color-coded expiry timers (Critical / High / Normal)
- 🤖 **AI Relevance Scoring** — Missions ranked by volunteer proximity, load capacity match & tier
- 📦 **Mission Cards** — Food category, weight estimate, pickup location, and time window
- ⚡ **One-Tap Accept** — Claim a mission instantly with a single interaction
- 🔄 **Live Updates** — Firestore `onSnapshot` pushes new missions without page refresh

**How it works:**
```
New Mission Created in Firestore
         ↓
  Firestore onSnapshot fires
         ↓
  AI Ranking Algorithm scores it
  (proximity × urgency × volunteer tier)
         ↓
  Mission Card appears in Radar Feed
  with urgency badge + relevance score
```

</td>
</tr>
</table>

---

### `[MODULE 02]` 🗺️ Live GPS Tracking

<table>
<tr>
<td width="50%">

**High-fidelity map interface for end-to-end delivery visibility.**

- 📍 **Real-Time Position Updates** — Volunteer location synced to Firestore every 5 seconds
- 🛣️ **Route Overlay** — Full delivery path rendered on the Leaflet map canvas
- ⏱️ **Dynamic ETA Engine** — ETA recalculates live as route conditions change
- 🚩 **Pickup & Drop-off Markers** — Color-coded origin/destination pins with info popups
- 👁️ **Dispatcher View** — Multi-mission overlay for operations leads monitoring all active couriers

</td>
<td width="50%">

<img src="https://raw.githubusercontent.com/your-org/missioncontrol/main/public/screenshots/live-tracking.png" alt="Live GPS Tracking" width="100%" />

</td>
</tr>
</table>

---

### `[MODULE 03]` 🏆 Gamified Impact Engine

<table>
<tr>
<td width="40%">

<img src="https://raw.githubusercontent.com/your-org/missioncontrol/main/public/screenshots/xp-engine.png" alt="XP Engine" width="100%" />

</td>
<td width="60%">

**Turning every rescue into a milestone.**

Volunteers earn XP for every completed mission. Bonus XP is awarded for high-urgency rescues, streaks, and load size. A level-up animation overlay celebrates rank promotions.

| 🎖️ Rank | Title | XP Range | Perks |
|---------|-------|----------|-------|
| ⬜ Tier 1 | Field Agent | 0 – 499 | Basic access |
| 🟦 Tier 2 | Rescue Specialist | 500 – 1,999 | Priority radar placement |
| 🟨 Tier 3 | Senior Courier | 2,000 – 4,999 | Early alert access |
| 🟧 Tier 4 | Elite Courier | 5,000 – 9,999 | Dispatcher comms unlocked |
| 🟥 Tier 5 | Phantom Operator | 10,000+ | Full system access + leaderboard |

**XP Multipliers:**
```
Base Mission Completion  →  +50 XP
Urgency: HIGH            →  +25 XP bonus
Urgency: CRITICAL        →  +75 XP bonus
Daily Streak (3 days)    →  ×1.5 multiplier
Large Load (50kg+)       →  +30 XP bonus
```

</td>
</tr>
</table>

---

### `[MODULE 04]` 🚨 Emergency Alert HUD

<div align="center">
<img src="https://raw.githubusercontent.com/your-org/missioncontrol/main/public/screenshots/emergency-hud.png" alt="Emergency Alert HUD" width="85%" />
</div>

<br/>

> ⚠️ **Critical consignment approaching expiry within 90 minutes — immediate rescue required.**

The Emergency Alert HUD is a **full-surface interruption layer** that activates when:
- 🕐 A food consignment reaches the **90-minute expiry threshold**
- 🏋️ Volume is classified as **HIGH** (100+ meals equivalent)
- 📍 At least one qualified volunteer is within the operational zone

**Alert Lifecycle:**
```
Firestore Trigger Fires (expiry_threshold reached)
        ↓
Emergency HUD overlays the active screen
        ↓
Urgency timer counts down in real-time on HUD
        ↓
Volunteer taps [ACCEPT EMERGENCY MISSION]
        ↓
HUD dismisses → Mission auto-loaded in Radar
```

---

### `[MODULE 05]` ☁️ Serverless Architecture

<div align="center">

| Capability | Implementation | Benefit |
|------------|---------------|---------|
| Real-time data sync | Firestore `onSnapshot` | Zero-polling live updates |
| User identity | Firebase Auth (Email + OAuth) | No custom auth server |
| Edge routing | Next.js 15 App Router | Sub-100ms TTFB on Vercel Edge |
| Animations | Framer Motion layout animations | 60fps UI transitions |
| Map rendering | React-Leaflet + OpenStreetMap | Free tile provider, zero vendor lock-in |
| Deployment | Vercel CI/CD | Auto-deploy on every `main` push |

</div>

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                       🛰️  MISSIONCONTROL — ARCHITECTURE                  │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   BROWSER / PWA CLIENT                                                   │
│   ┌────────────────────────────────────────────────────────────────┐    │
│   │                   Next.js 15  App Router                        │    │
│   │                                                                  │    │
│   │   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │    │
│   │   │  (auth)/     │  │  dashboard/  │  │  missions/           │ │    │
│   │   │  Login       │  │  Command HUD │  │  Tactical Radar      │ │    │
│   │   │  Register    │  │  Alert HUD   │  │  Mission Accept      │ │    │
│   │   └──────────────┘  └──────────────┘  └──────────────────────┘ │    │
│   │                                                                  │    │
│   │   ┌──────────────────────────┐  ┌─────────────────────────┐    │    │
│   │   │  tracking/[id]/          │  │  profile/               │    │    │
│   │   │  Leaflet Map             │  │  XP Bar + Rank Display  │    │    │
│   │   │  GPS Sync                │  │  Mission History        │    │    │
│   │   │  ETA Engine              │  │  Leaderboard            │    │    │
│   │   └──────────────────────────┘  └─────────────────────────┘    │    │
│   └─────────────────────────┬──────────────────────────────────────┘    │
│                             │                                            │
│          ┌──────────────────┼──────────────────────┐                    │
│          │                  │                       │                    │
│          ▼                  ▼                       ▼                    │
│   ┌─────────────┐  ┌──────────────────┐  ┌──────────────────────┐      │
│   │  Firebase   │  │  Firebase Auth   │  │  Next.js Edge Config │      │
│   │  Firestore  │  │                  │  │                      │      │
│   │             │  │  ✓ Email/Pass   │  │  ✓ Middleware        │      │
│   │ collections:│  │  ✓ Google OAuth │  │  ✓ Route Guards      │      │
│   │  missions   │  │  ✓ Session Mgmt │  │  ✓ ISR + SSR        │      │
│   │  deliveries │  └──────────────────┘  └──────────────────────┘      │
│   │  volunteers │                                                        │
│   │  alerts     │           DEPLOYED ON                                  │
│   └─────────────┘    ┌──────────────────────┐                          │
│                       │   Vercel Edge Network │                          │
│                       │   Global CDN · CI/CD  │                          │
│                       └──────────────────────┘                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Data Flow Diagram

```
Volunteer Opens App
        │
        ▼
Firebase Auth verifies session ──── No ──→ Redirect to /login
        │ Yes
        ▼
Dashboard loads (Server Component fetches initial data)
        │
        ├──→ Firestore listener: missions (onSnapshot) ──→ Mission Radar updates live
        │
        ├──→ Firestore listener: alerts (onSnapshot)  ──→ Emergency HUD triggers if CRITICAL
        │
        └──→ Volunteer profile fetched ──→ XP bar + Rank badge rendered
```

---

## ⚙️ Tech Stack

<div align="center">

| Layer | Technology | Version | Role |
|-------|-----------|---------|------|
| ⚙️ **Framework** | Next.js (App Router) | `15.x` | SSR, routing, edge rendering |
| 🔷 **Language** | TypeScript | `5.x` | Full type safety across all layers |
| 🎨 **Styling** | Tailwind CSS | `3.x` | Utility-first, dark-mode-first design |
| 💎 **UI Effects** | Glassmorphism (custom CSS) | — | Frosted panels, depth layers |
| 🎞️ **Animation** | Framer Motion | `latest` | HUD transitions, radar pulses, XP effects |
| 🗺️ **Maps** | Leaflet + React-Leaflet | `latest` | Interactive GPS map rendering |
| 🔥 **Database** | Firebase Firestore | `v9+` | Real-time NoSQL — missions, deliveries |
| 🔐 **Auth** | Firebase Authentication | `v9+` | Email/password + Google OAuth |
| 🖼️ **Icons** | Lucide React | `latest` | Consistent, tree-shakeable icon set |
| 🚀 **Deployment** | Vercel | — | Edge network, CI/CD, serverless functions |

</div>

---

## 🚀 Getting Started

### Prerequisites

Before launching MissionControl, ensure your environment is ready:

```bash
node --version    # Must be v18.17.0 or higher (v20 LTS recommended)
npm --version     # v9+ required
git --version     # Any recent version
```

You'll also need:
- ✅ A **Firebase project** with **Firestore** and **Authentication** enabled
- ✅ A **Vercel account** (free tier works for production)
- ✅ A modern browser (Chrome 110+, Firefox 110+, Safari 16+)

---

### Installation

**Step 1 — Clone the repository**

```bash
git clone https://github.com/your-org/missioncontrol.git
cd missioncontrol
```

**Step 2 — Install dependencies**

```bash
# Using npm
npm install

# Using pnpm (recommended — faster, disk-efficient)
pnpm install

# Using yarn
yarn install
```

> **⚠️ React 19 Peer Dependency Note**
>
> MissionControl runs on **React 19** (shipped with Next.js 15). Some packages — notably `react-leaflet` and certain Framer Motion peer declarations — may not yet officially declare React 19 support in their `package.json`. If you see peer dependency errors, use:
>
> ```bash
> npm install --legacy-peer-deps
> ```

---

### Environment Setup

**Step 3 — Copy the environment template**

```bash
cp .env.example .env.local
```

**Step 4 — Fill in your Firebase credentials**

Open `.env.local` and populate every variable. All values are found in your **Firebase Console → Project Settings → Your Apps → Web App → SDK config.**

```env
# ════════════════════════════════════════════════════════════════
#  🔥 FIREBASE CORE — Required for all features
# ════════════════════════════════════════════════════════════════

NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123def456

# ════════════════════════════════════════════════════════════════
#  🗺️ MAPS — Optional premium tile provider (OpenStreetMap is free default)
# ════════════════════════════════════════════════════════════════

NEXT_PUBLIC_MAPTILER_API_KEY=          # Leave blank for free OpenStreetMap tiles

# ════════════════════════════════════════════════════════════════
#  🌐 APP — Base URL configuration
# ════════════════════════════════════════════════════════════════

NEXT_PUBLIC_APP_URL=http://localhost:3000          # Development
# NEXT_PUBLIC_APP_URL=https://missioncontrol.vercel.app  # Production

# ════════════════════════════════════════════════════════════════
#  🤖 AI RANKING — Optional (feature-flagged in v0.1.0)
# ════════════════════════════════════════════════════════════════

MISSION_AI_RANKING_ENABLED=false
```

> 🔒 **Security Rule:** `.env.local` is already in `.gitignore`. Never commit credentials. For CI/CD, add all `NEXT_PUBLIC_*` variables in **Vercel Dashboard → Settings → Environment Variables.**

---

### Running the App

**Step 5 — Start the development server**

```bash
npm run dev
# or
pnpm dev
```

Open [**http://localhost:3000**](http://localhost:3000) — MissionControl initializes.

**Step 6 — Verify Firebase connection**

In your browser console, you should see:

```
✅ Firebase initialized — Project: your-project-id
✅ Firestore connection: STABLE
✅ Auth state listener: ACTIVE
```

If you see errors, re-check your `.env.local` values.

---

## 📖 Full User Workflow

This section documents the **complete end-to-end journey** for every user role in MissionControl.

---

### 1. Volunteer Onboarding

<details>
<summary><b>📋 Click to expand — Onboarding Workflow</b></summary>

```
User visits https://your-missioncontrol-url.vercel.app
                    │
                    ▼
          ┌──────────────────┐
          │  Landing / Login  │
          │  /login           │
          └────────┬─────────┘
                   │
       ┌───────────┴────────────┐
       │                        │
       ▼                        ▼
 [Sign In with Google]    [Email + Password]
       │                        │
       └───────────┬────────────┘
                   │
                   ▼
        Firebase Auth verifies credentials
                   │
                   ▼
        New user? → Create Firestore volunteer profile:
        {
          uid: "firebase_uid",
          displayName: "Jane Doe",
          email: "jane@example.com",
          rank: "Field Agent",
          xp: 0,
          totalMissions: 0,
          createdAt: Timestamp
        }
                   │
                   ▼
        Redirect → /dashboard (Command Center HUD)
```

**Onboarding Checklist for New Volunteers:**
1. ✅ Register or sign in via Google / Email
2. ✅ Complete your volunteer profile (name, phone, vehicle type)
3. ✅ Enable browser location permissions (required for GPS tracking)
4. ✅ Enable browser notifications (required for Emergency Alert HUD)
5. ✅ Review your initial rank: **Field Agent** — 0 XP

</details>

---

### 2. The Command Dashboard

<details>
<summary><b>🛰️ Click to expand — Dashboard Workflow</b></summary>

The Dashboard (`/dashboard`) is the **operational nerve center** — the first screen after login.

<div align="center">
<img src="https://raw.githubusercontent.com/your-org/missioncontrol/main/public/screenshots/dashboard-annotated.png" alt="Dashboard Annotated" width="90%" />
</div>

**Dashboard Panels:**

| Panel | Location | Content |
|-------|----------|---------|
| 🎯 **Mission Counter** | Top-left | Available missions in your zone right now |
| 👤 **Volunteer Status** | Top-right | Your rank badge, XP bar, current streak |
| 📡 **Mission Radar** | Center | Live scrolling mission feed |
| 🚨 **Alert Strip** | Bottom | Emergency alerts (hidden when inactive) |
| 🗺️ **Mini-Map** | Bottom-right | Overview of active deliveries in your area |

**Navigation Flow:**
```
/dashboard
    │
    ├── [View All Missions]  →  /missions
    ├── [Active Delivery]    →  /tracking/[deliveryId]
    ├── [My Profile]         →  /profile
    └── [Emergency Alert]    →  /missions/emergency/[alertId]
```

</details>

---

### 3. Mission Radar — Accepting a Rescue

<details>
<summary><b>📡 Click to expand — Mission Acceptance Workflow</b></summary>

```
Navigate to /missions (Mission Radar)
                │
                ▼
  Firestore listener streams available missions
  Each mission card shows:
  ┌─────────────────────────────────────────────┐
  │ 🔴 CRITICAL    Rescue #MC-2047              │
  │ 📦 48kg mixed produce — expires in 1hr 22m  │
  │ 📍 3.2km away  ·  Pickup: Whole Foods Depot  │
  │ 🤖 Relevance Score: 94/100                  │
  │ ──────────────────────────────────────────  │
  │        [  VIEW DETAILS  ]  [  ACCEPT  ]     │
  └─────────────────────────────────────────────┘
                │
     Volunteer taps [ACCEPT]
                │
                ▼
  Firestore transaction:
    mission.status = "CLAIMED"
    mission.claimedBy = volunteer.uid
    mission.claimedAt = Timestamp.now()
                │
                ▼
  Mission disappears from other volunteers' radar
                │
                ▼
  Volunteer redirected to /tracking/[missionId]
  with full GPS interface loaded
```

**Mission Urgency Levels:**

```
🔴 CRITICAL  —  Expires in < 2 hours     — +75 XP bonus
🟠 HIGH      —  Expires in 2 – 6 hours   — +25 XP bonus
🟡 NORMAL    —  Expires in 6 – 24 hours  — Base XP only
```

</details>

---

### 4. Live GPS Tracking a Delivery

<details>
<summary><b>🗺️ Click to expand — Delivery Tracking Workflow</b></summary>

```
/tracking/[missionId] loads
            │
            ▼
  Leaflet map initializes
  Pickup marker 📍 rendered at origin coordinates
  Drop-off marker 🏁 rendered at destination
            │
            ▼
  Browser Geolocation API starts watching position
  navigator.geolocation.watchPosition(...)
            │
            ▼
  Every 5 seconds:
    Write { lat, lng, timestamp } to Firestore
    document: deliveries/{missionId}/location
            │
            ▼
  ETA Engine recalculates:
    distance_remaining / average_speed = new_ETA
            │
            ▼
  Map re-renders volunteer marker at new position
            │
            ▼
  Volunteer arrives at drop-off location
            │
            ▼
  Tap [MARK AS DELIVERED]
            │
            ▼
  Firestore updates:
    mission.status = "COMPLETED"
    mission.completedAt = Timestamp.now()
    volunteer.xp += calculated_xp
    volunteer.totalMissions += 1
            │
            ▼
  XP animation overlay fires (Framer Motion)
  Rank-up check runs → if threshold crossed → Rank-Up HUD
```

</details>

---

### 5. Emergency Alert HUD Response

<details>
<summary><b>🚨 Click to expand — Emergency Alert Workflow</b></summary>

```
Dispatcher or automated trigger creates alert in Firestore:
  alerts/{alertId} = {
    type: "EMERGENCY",
    consignmentId: "C-4821",
    quantity: "120 meals equivalent",
    expiresAt: Timestamp (90 mins from now),
    location: { lat, lng },
    status: "ACTIVE"
  }
            │
            ▼
  All connected volunteers' onSnapshot fires
            │
            ▼
  Emergency Alert HUD overlays the entire screen:
  ┌──────────────────────────────────────────────────────┐
  │  🚨  EMERGENCY RESCUE REQUIRED                       │
  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
  │  120 meals — Expires in  01 : 28 : 47               │
  │  📍 City Harvest Depot, 123 Distribution Ave        │
  │                                                      │
  │  [ ACCEPT EMERGENCY MISSION ]    [ VIEW MAP ]        │
  └──────────────────────────────────────────────────────┘
            │
     Volunteer taps [ACCEPT]
            │
            ▼
  Firestore transaction claims alert
  HUD dismisses with exit animation
  Volunteer redirected to /tracking/[alertId]
```

</details>

---

### 6. XP & Rank Progression

<details>
<summary><b>🏆 Click to expand — Gamification Workflow</b></summary>

**XP Calculation on Mission Completion:**

```typescript
function calculateXP(mission: Mission, volunteer: Volunteer): number {
  let xp = 50; // base completion XP

  // Urgency bonus
  if (mission.urgency === "CRITICAL") xp += 75;
  if (mission.urgency === "HIGH")     xp += 25;

  // Load size bonus
  if (mission.weightKg >= 50) xp += 30;

  // Daily streak multiplier
  const multiplier = volunteer.streak >= 3 ? 1.5 : 1.0;

  return Math.floor(xp * multiplier);
}
```

**Rank Progression Gate:**

```
After XP is written to Firestore:
            │
            ▼
  Client checks: new_total_xp >= next_rank_threshold ?
            │
      YES ──┘
            ▼
  Framer Motion RANK-UP overlay fires:
  ┌────────────────────────────────┐
  │  ⬆️  RANK UP!                 │
  │  You are now:                  │
  │  🟧 ELITE COURIER             │
  │  New perks unlocked            │
  └────────────────────────────────┘
            │
            ▼
  Firestore volunteer profile updated:
    rank: "Elite Courier"
    rankUpdatedAt: Timestamp.now()
```

</details>

---

## 📁 Project Structure

```
missioncontrol/
│
├── 📂 app/                               # Next.js 15 App Router root
│   ├── 📂 (auth)/                        # Auth route group (no shared layout)
│   │   ├── login/page.tsx               # Login page
│   │   └── register/page.tsx            # Volunteer registration
│   │
│   ├── 📂 dashboard/                    # Command Center HUD
│   │   ├── page.tsx                     # Dashboard server component
│   │   └── _components/                 # Dashboard-scoped client components
│   │       ├── MissionCounter.tsx
│   │       ├── VolunteerStatusPanel.tsx
│   │       └── MiniMap.tsx
│   │
│   ├── 📂 missions/                     # Tactical Mission Radar
│   │   ├── page.tsx                     # Mission list view
│   │   ├── [id]/page.tsx                # Mission detail + accept
│   │   └── emergency/[id]/page.tsx      # Emergency mission fast-accept
│   │
│   ├── 📂 tracking/
│   │   └── [id]/                        # Live GPS tracking
│   │       ├── page.tsx
│   │       └── _components/
│   │           ├── TrackingMap.tsx       # React-Leaflet map (client)
│   │           └── ETAPanel.tsx
│   │
│   ├── 📂 profile/                      # XP + Rank + History
│   │   └── page.tsx
│   │
│   ├── globals.css                      # Tailwind base + glassmorphism vars
│   ├── layout.tsx                       # Root layout — Firebase provider wrap
│   └── not-found.tsx                    # Custom 404 — Mission Terminated screen
│
├── 📂 components/
│   ├── 📂 ui/                           # Reusable design system primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx                     # Glassmorphism card base
│   │   ├── Badge.tsx                    # Urgency / rank badges
│   │   └── ProgressBar.tsx              # XP progress bar
│   │
│   ├── 📂 hud/                          # Emergency Alert HUD system
│   │   ├── EmergencyHUD.tsx             # Full-surface overlay component
│   │   ├── AlertBanner.tsx              # Inline alert strip (non-critical)
│   │   └── CountdownTimer.tsx           # Real-time expiry countdown
│   │
│   ├── 📂 map/                          # Map components (all client-side)
│   │   ├── MapContainer.tsx             # Dynamic import wrapper (SSR-safe)
│   │   ├── DeliveryMap.tsx              # Full tracking map
│   │   └── MiniMapWidget.tsx            # Dashboard mini-map
│   │
│   ├── 📂 radar/                        # Mission Radar feed
│   │   ├── MissionRadar.tsx             # Parent feed container
│   │   ├── MissionCard.tsx              # Individual mission entry
│   │   └── UrgencyBadge.tsx
│   │
│   └── 📂 gamification/                 # XP and rank UI
│       ├── XPBar.tsx
│       ├── RankBadge.tsx
│       └── RankUpOverlay.tsx            # Framer Motion level-up animation
│
├── 📂 lib/
│   ├── 📂 firebase/
│   │   ├── config.ts                    # Firebase app initialization
│   │   ├── auth.ts                      # Auth helpers (signIn, signOut, etc.)
│   │   ├── missions.ts                  # Firestore mission CRUD + listeners
│   │   ├── deliveries.ts               # Delivery tracking writes
│   │   └── volunteers.ts               # Volunteer profile reads/writes
│   │
│   ├── 📂 utils/
│   │   ├── xp.ts                        # XP calculation logic
│   │   ├── eta.ts                       # ETA calculation engine
│   │   └── urgency.ts                   # Mission urgency classification
│   │
│   └── 📂 constants/
│       ├── ranks.ts                     # Rank thresholds + tier config
│       └── missions.ts                  # Mission status enums
│
├── 📂 hooks/                            # Custom React hooks
│   ├── useMissions.ts                   # Live mission feed hook
│   ├── useTracking.ts                   # GPS tracking + Firestore write hook
│   ├── useVolunteer.ts                  # Volunteer profile + XP hook
│   └── useEmergencyAlerts.ts           # Emergency alert subscription hook
│
├── 📂 types/                            # Global TypeScript definitions
│   ├── mission.ts
│   ├── volunteer.ts
│   ├── delivery.ts
│   └── alert.ts
│
├── 📂 public/
│   ├── 📂 screenshots/                  # README screenshots
│   └── favicon.ico
│
├── .env.example                         # Environment variable template
├── .env.local                           # 🔒 Your secrets (git-ignored)
├── next.config.ts                       # Next.js config
├── tailwind.config.ts                   # Custom dark theme + design tokens
├── tsconfig.json
└── package.json
```

---

## 🔥 Firebase Configuration

### Step-by-Step Firebase Setup

**1. Create a Firebase Project**

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add Project"** → Name it `missioncontrol-prod`
3. Disable Google Analytics (optional)
4. Click **"Create Project"**

**2. Enable Firestore**

```
Firebase Console → Build → Firestore Database
→ Create Database → Start in Production Mode → Choose region
```

**3. Set Firestore Security Rules**

Paste these rules in **Firestore → Rules** tab:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Volunteers can read/write their own profile
    match /volunteers/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // All authenticated users can read missions
    // Only the claiming volunteer can update a mission
    match /missions/{missionId} {
      allow read: if request.auth != null;
      allow update: if request.auth != null
        && resource.data.status == "AVAILABLE"
        && request.resource.data.claimedBy == request.auth.uid;
    }

    // Delivery location updates — only the assigned volunteer
    match /deliveries/{deliveryId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && resource.data.volunteerId == request.auth.uid;
    }

    // Emergency alerts — read for all auth users
    match /alerts/{alertId} {
      allow read: if request.auth != null;
      allow write: if false; // Dispatcher role only (via Admin SDK)
    }
  }
}
```

**4. Enable Authentication**

```
Firebase Console → Build → Authentication → Get Started
→ Sign-in Method → Enable: Email/Password + Google
```

**5. Register Your Web App & Copy Config**

```
Firebase Console → Project Settings → Your Apps
→ Add App → Web (</>)
→ Copy the firebaseConfig object → Paste values into .env.local
```

---

## 🗺️ Map Integration Guide

MissionControl uses **Leaflet + React-Leaflet** for all mapping functionality.

### Default Setup (OpenStreetMap — Free, No API Key)

No configuration needed. Tiles load from OpenStreetMap by default.

```typescript
// lib/constants/map.ts
export const MAP_CONFIG = {
  defaultCenter: [40.7128, -74.0060] as [number, number], // Change to your city
  defaultZoom: 13,
  tileUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
};
```

### SSR Gotcha — Dynamic Import Required

Leaflet accesses `window` on mount. Always import map components with `ssr: false`:

```typescript
// app/tracking/[id]/page.tsx
import dynamic from "next/dynamic";

const TrackingMap = dynamic(
  () => import("./_components/TrackingMap"),
  { ssr: false, loading: () => <p>Loading map...</p> }
);
```

### Premium Dark Tiles (Optional — MapTiler)

For dark, aerospace-style map tiles that match MissionControl's aesthetic:

1. Register at [maptiler.com](https://maptiler.com) (free tier available)
2. Add your key to `.env.local`:
   ```env
   NEXT_PUBLIC_MAPTILER_API_KEY=your_key_here
   ```
3. Update `MAP_CONFIG.tileUrl`:
   ```
   https://api.maptiler.com/maps/dataviz-dark/{z}/{x}/{y}.png?key=YOUR_KEY
   ```

---

## 🌐 Deployment to Vercel

### Option A — Vercel CLI (Fastest)

```bash
# Install Vercel CLI
npm i -g vercel

# Authenticate
vercel login

# Deploy to production
vercel --prod
```

### Option B — GitHub Integration (Recommended for Teams)

1. Push your code to a **GitHub repository**
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your `missioncontrol` repo
4. Set **Framework Preset** to `Next.js`
5. Add all environment variables under **Environment Variables**
6. Click **"Deploy"** ✅

From this point, every push to `main` triggers an automatic production deploy.

### Vercel Environment Variables

In your Vercel project dashboard under **Settings → Environment Variables**, add:

| Variable | Environment |
|----------|------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | Production (set to your live domain) |

---

## 🧪 Scripts Reference

```bash
# ─────────────────────────────────────────────────────
# Development
# ─────────────────────────────────────────────────────
pnpm dev                  # Start dev server at http://localhost:3000
pnpm dev -- --port 4000   # Start on custom port

# ─────────────────────────────────────────────────────
# Build & Production
# ─────────────────────────────────────────────────────
pnpm build                # Compile production build
pnpm start                # Serve production build locally

# ─────────────────────────────────────────────────────
# Code Quality
# ─────────────────────────────────────────────────────
pnpm lint                 # Run ESLint
pnpm lint --fix           # Auto-fix lint errors
pnpm type-check           # Run TypeScript compiler check (no emit)
pnpm format               # Run Prettier formatter

# ─────────────────────────────────────────────────────
# Testing
# ─────────────────────────────────────────────────────
pnpm test                 # Run unit tests (Vitest)
pnpm test:watch           # Run tests in watch mode
pnpm test:coverage        # Generate coverage report
```

---

## 🛠️ Troubleshooting

<details>
<summary><b>❌ Firebase: "Missing or insufficient permissions"</b></summary>

Your Firestore Security Rules are blocking the request.

1. Confirm the user is signed in before accessing Firestore
2. Review the security rules in **Firebase Console → Firestore → Rules**
3. Check the path you're reading/writing matches the rules structure
4. Use **Firebase Emulator** locally to debug rules:
   ```bash
   firebase emulators:start
   ```

</details>

<details>
<summary><b>❌ Map not rendering / "window is not defined" error</b></summary>

Leaflet requires browser APIs. You're likely importing the map component without `ssr: false`.

```typescript
// ✅ Correct
const TrackingMap = dynamic(() => import("../components/map/TrackingMap"), {
  ssr: false,
});

// ❌ Wrong — causes SSR crash
import TrackingMap from "../components/map/TrackingMap";
```

</details>

<details>
<summary><b>❌ npm install peer dependency error with React 19</b></summary>

```bash
# Use the legacy peer deps resolver
npm install --legacy-peer-deps

# Or, with pnpm, add to your .npmrc:
echo "legacy-peer-deps=true" >> .npmrc
pnpm install
```

</details>

<details>
<summary><b>❌ Framer Motion animations not working</b></summary>

Ensure Framer Motion components are inside a `"use client"` directive boundary — they cannot run as React Server Components.

```typescript
"use client";  // ← Required at the top of any file using Framer Motion

import { motion } from "framer-motion";
```

</details>

<details>
<summary><b>❌ GPS location not updating on the map</b></summary>

1. Confirm the user has granted **location permission** in their browser
2. Test with HTTPS — `navigator.geolocation` requires a secure context
3. For local development, `localhost` is treated as secure by all modern browsers
4. Check Firestore write permissions for the `deliveries` collection

</details>

---

## 🗺️ Roadmap

<div align="center">

| Version | Module | Status |
|---------|--------|--------|
| `v0.1.0` | 📡 Mission Radar + GPS Tracking + XP Engine + Emergency HUD | ✅ **Released** |
| `v0.2.0` | 🤖 AI Mission Prioritization API (real ML scoring) | 🔄 In Progress |
| `v0.2.0` | 📊 Volunteer Analytics Dashboard (missions/week, XP trend) | 📋 Planned |
| `v0.3.0` | 📱 Progressive Web App (PWA) — offline + installable | 📋 Planned |
| `v0.3.0` | 🔔 Web Push Notifications (Emergency alerts to locked screens) | 📋 Planned |
| `v0.4.0` | 🌍 Multi-City Operations + Dispatcher Admin Console | 🔭 Scoped |
| `v0.5.0` | 🏅 Leaderboard + Social Sharing of XP milestones | 🔭 Scoped |

</div>

---

## 🤝 Contributing

Contributions that improve mission throughput, volunteer experience, or system resilience are welcome.

```bash
# 1. Fork this repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/missioncontrol.git

# 3. Create a feature branch
git checkout -b feat/module-name

# 4. Make your changes and run quality checks
pnpm lint && pnpm type-check

# 5. Commit using semantic commit format
git commit -m "feat(radar): add urgency tier filtering"
git commit -m "fix(tracking): resolve GPS drift on Android Chrome"
git commit -m "docs(readme): update Firebase setup instructions"

# 6. Push and open a Pull Request
git push origin feat/module-name
```

**Commit Message Convention:**

```
<type>(<scope>): <description>

Types:  feat | fix | docs | style | refactor | test | chore
Scopes: radar | tracking | xp | hud | auth | map | firebase | ui
```

---

## 📄 License

```
MIT License

Copyright (c) 2025 MissionControl Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
```

Full license text: [LICENSE](./LICENSE)

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:24243e,50:302b63,100:0f0c29&height=120&section=footer&text=Every+rescue+counts.&fontSize=24&fontColor=00e5ff&animation=fadeIn&fontAlignY=65" width="100%"/>

<br/>

**Built for the volunteers who move fast so food doesn't go to waste.**

<br/>

⭐ **If MissionControl helps your operations, please star this repository** ⭐

<br/>

<a href="https://github.com/your-org/missioncontrol">
  <img src="https://img.shields.io/github/stars/your-org/missioncontrol?style=social" />
</a>
&nbsp;&nbsp;
<a href="https://github.com/your-org/missioncontrol/issues">
  <img src="https://img.shields.io/github/issues/your-org/missioncontrol?color=00e5ff" />
</a>
&nbsp;&nbsp;
<a href="https://github.com/your-org/missioncontrol/network/members">
  <img src="https://img.shields.io/github/forks/your-org/missioncontrol?style=social" />
</a>

<br/><br/>

🛰️ ***MissionControl — Always Operational***

</div>
