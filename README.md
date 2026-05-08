````md
<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&height=260&color=0:0d0d1a,30:1a0533,60:0a1628,100:0d0d1a&text=MISSIONCONTROL&fontColor=00E5FF&fontSize=58&animation=fadeIn&fontAlignY=38&desc=Volunteer%20Logistics%20Command%20Center&descAlignY=60&descColor=A78BFA" width="100%" />

<br/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&pause=1200&color=00E5FF&center=true&vCenter=true&width=900&lines=Real-Time+Food+Rescue+Operations;AI+Ranked+Mission+Radar;Live+GPS+Tracking+System;Gamified+Volunteer+XP+Engine;Emergency+Alert+HUD;Serverless+%7C+Next.js+15+%7C+Firebase" />

<br/><br/>

<img src="https://img.shields.io/badge/STATUS-OPERATIONAL-00E5FF?style=for-the-badge" />
<img src="https://img.shields.io/badge/VERSION-v0.1.0-A78BFA?style=for-the-badge" />
<img src="https://img.shields.io/badge/LICENSE-MIT-22C55E?style=for-the-badge" />
<img src="https://img.shields.io/badge/PRs-WELCOME-F97316?style=for-the-badge" />

<br/><br/>

<img src="https://skillicons.dev/icons?i=nextjs,typescript,tailwind,firebase,react,vercel,git,vscode&theme=dark" />

<br/><br/>

<img src="./public/screenshots/dashboard.png" width="92%" />

<br/>

# 🛰️ MissionControl

### Volunteer Logistics Command Center for Food Rescue Operations

MissionControl is a futuristic real-time logistics dashboard built for volunteer-based food rescue systems.

It provides:

✅ Tactical Mission Radar  
✅ Real-Time GPS Tracking  
✅ Emergency Alert HUD  
✅ Gamified XP System  
✅ Firebase Live Sync  
✅ Next.js 15 + TypeScript Architecture  

---

# 🌌 Features

## 📡 Tactical Mission Radar

<img src="./public/screenshots/radar.png" width="90%" />

- Real-time food rescue missions
- AI-ranked urgency system
- One-click mission acceptance
- Live Firestore updates

---

## 🗺️ Live GPS Tracking

<img src="./public/screenshots/tracking.png" width="90%" />

- Real-time courier tracking
- Dynamic ETA engine
- Interactive route map
- Dispatcher monitoring

---

## 🏆 XP & Rank Engine

<img src="./public/screenshots/xp-system.png" width="90%" />

- XP rewards
- Rank progression
- Streak multipliers
- Achievement overlays

---

## 🚨 Emergency Alert HUD

<img src="./public/screenshots/alert-hud.png" width="90%" />

- Critical rescue alerts
- Full-screen emergency overlay
- Live countdown timer
- Auto-route navigation

---

# ⚙️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 15 | Frontend Framework |
| TypeScript | Type Safety |
| Tailwind CSS | Styling |
| Firebase | Database + Auth |
| Framer Motion | Animations |
| React Leaflet | GPS Maps |
| Vercel | Deployment |

---

# 📁 Folder Structure

```bash
missioncontrol/
│
├── app/
├── components/
├── hooks/
├── lib/
├── public/
│   └── screenshots/
├── types/
├── package.json
└── README.md
````

---

# 🚀 Installation

## 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/missioncontrol.git
cd missioncontrol
```

---

## 2. Install Dependencies

```bash
npm install
```

If React dependency errors occur:

```bash
npm install --legacy-peer-deps
```

---

## 3. Create Environment File

Create:

```bash
.env.local
```

Paste:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

# 🔥 Firebase Setup

## Enable:

* Firestore Database
* Authentication
* Google Login
* Email/Password Login

---

# ▶️ Run Development Server

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

---

# 🌐 Deploy to Vercel

## Install Vercel CLI

```bash
npm i -g vercel
```

---

## Deploy

```bash
vercel --prod
```

---

# 🗺️ Add Screenshots

Create folder:

```bash
public/screenshots
```

Add:

```bash
dashboard.png
radar.png
tracking.png
xp-system.png
alert-hud.png
```

---

# 📡 Live Mission Flow

```txt
Volunteer Opens Dashboard
        ↓
Firestore Streams Missions
        ↓
Mission Radar Updates Live
        ↓
Volunteer Accepts Mission
        ↓
Tracking Starts
        ↓
GPS Updates Every 5 Seconds
        ↓
Mission Completed
        ↓
XP Awarded
```

---

# 🏆 XP System

```ts
export function calculateXP(mission, volunteer) {
  let xp = 50;

  if (mission.urgency === "HIGH") xp += 25;
  if (mission.urgency === "CRITICAL") xp += 75;

  if (mission.weightKg >= 50) xp += 30;

  return xp;
}
```

---

# 🚨 Emergency Alert System

```txt
Dispatcher Creates Alert
        ↓
Firestore Broadcasts Event
        ↓
HUD Appears Instantly
        ↓
Volunteer Accepts
        ↓
Tracking Route Opens
```

---

# 🛠️ Troubleshooting

## Map not loading?

Use dynamic imports:

```ts
const TrackingMap = dynamic(
  () => import("./TrackingMap"),
  { ssr: false }
);
```

---

## Firebase permission errors?

Check Firestore rules.

---

## Dependency conflict?

```bash
npm install --legacy-peer-deps
```

---

# 🤝 Contributing

```bash
git checkout -b feat/your-feature
git commit -m "feat: added new feature"
git push origin feat/your-feature
```

---

# ⭐ Support

If you like this project:

⭐ Star the repository
🍴 Fork the project
🚀 Contribute features

---

<img src="https://capsule-render.vercel.app/api?type=waving&height=140&section=footer&color=0:0d0d1a,30:1a0533,60:0a1628,100:0d0d1a&text=Every%20Rescue%20Counts&fontColor=00E5FF&fontSize=28" width="100%" />

</div>
```
