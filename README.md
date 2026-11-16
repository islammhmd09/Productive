# Daily Journal | يومياتي

A serene, local-first personal productivity and reflection web application built with **React 18**, **TypeScript**, and **Vite**. Features full bilingual support (**English** & **العربية** with native RTL layout), Cairo typography, offline persistence, and installable PWA capabilities.

---

## ✨ Features

### 📖 Daily Journaling
- **Guided Prompts**: Reflect on your day, track your feelings, write freely, and practice self-forgiveness.
- **Mood Tracking**: 5-point daily rating with intuitive mood emojis.
- **Journal History**: Browse, search, and view your reflections grouped by month.
- **Privacy First**: All journals are saved directly to your device via IndexedDB.

### 📝 To-Do List ("Kick Off Your Day")
- **Flexible Scheduling**: Single daily tasks, time slots (`From` – `To`), project/group labels, and long-term pinned tasks.
- **Tri-State Progress**: Not started (`todo`), partly done (`partial`), and done (`done`).
- **Live Progress**: Progress bar calculating completed and partial tasks.
- **Custom Color Accents**: Customize your task checkboxes and theme colors.

### 🎯 Habit Tracker
- **Daily Habit Tracking**: Build consistency with customized habits (emojis & colors).
- **Interactive 7-Day Matrix**: 1-click toggle for today or any of the past 7 days.
- **Streak Records**: Live streak counter (`🔥`) tracking your current consecutive days and best record.
- **Monthly Analytics**: Real-time completion rate percentage for the current month.

### 🔔 Smart Task Reminders & Notifications
- **Automated Alerts**: Receive periodic reminders (default: **every 2 hours**, or custom intervals from 15 mins to 12 hours).
- **Dynamic Task Summary**: Automatically lists today's uncompleted tasks directly in the reminder notification.
- **In-App Testing**: Test notification trigger directly from the Settings page.

### ⚙️ Settings & Customization
- **Language Switching**: Seamless transformation between English and Arabic (العربية) with instant RTL/LTR updates.
- **Appearance (Themes)**: Dark theme (calm forest green palette) and crisp Light theme.
- **To-Do Accent Personalization**: Choose from Emerald, Teal, Sky Blue, Indigo, Purple, Rose, Amber, or Coral.
- **Notification Controls**: Enable/disable reminders, request browser permissions, and configure frequencies.

### 📄 PDF Export
- **Printable Journal Archive**: Export all saved journals into a clean, beautifully formatted **PDF document** with native Cairo Arabic font rendering, print styles, and pagination (no JSON required).

### ☁️ Cloud Sync (Optional)
- **Local-First Synchronization**: Your data lives locally and syncs automatically with Supabase when online.
- **Conflict Resolution**: "Latest edit wins" algorithm with tombstone tracking for deleted records.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ or 20+ recommended)

### Installation
```bash
# Clone the repository
git clone https://github.com/islammhmd09/Daily-Journal.git

# Enter the project directory
cd daily-journal

# Install dependencies
npm install
```

### Development
```bash
# Start local development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build
```bash
# Type check and build production bundle
npm run build
```

### Tests
```bash
# Run unit tests (Sync engine, Task logic, Habit algorithms)
npm test
```

---

## 📁 Project Architecture

```text
daily-journal/
├── public/
│   ├── favicon.svg             # Crescent moon vector icon
│   ├── manifest.webmanifest    # PWA configuration
│   └── sw.js                   # Service worker for offline caching
├── src/
│   ├── screens/
│   │   ├── Home.tsx            # Daily overview dashboard & quick-access hub
│   │   ├── Write.tsx           # Daily journaling screen
│   │   ├── History.tsx         # Journal history & PDF export
│   │   ├── Tasks.tsx           # To-Do list with time slots & project groups
│   │   ├── Habits.tsx          # Professional habit tracker with streaks
│   │   ├── Settings.tsx        # Settings (Language, Theme, Notifications, PDF)
│   │   └── Sync.tsx            # Cloud account & sync controls
│   ├── habitStorage.ts         # IndexedDB repository for habits
│   ├── habitUtils.ts           # Habit streak & monthly completion algorithms
│   ├── notificationService.ts  # Browser notifications & task reminder scheduler
│   ├── pdfExport.ts            # Formatted HTML-to-PDF export engine
│   ├── settingsStorage.ts      # Settings store & DOM theme applicator
│   ├── storage.ts              # IndexedDB repository for journals
│   ├── taskStorage.ts          # IndexedDB repository for tasks
│   ├── taskUtils.ts            # Task grouping, time sorting, & progress
│   ├── syncCore.ts             # Deterministic local-first sync engine
│   ├── sync.ts                 # Supabase sync bridge
│   ├── i18n.tsx                # English & Arabic dictionaries & RTL provider
│   ├── icons.tsx               # SVG icons & AppLogo component
│   ├── types.ts                # TypeScript interfaces & domain models
│   ├── styles.css              # Custom styling with dark & light themes
│   ├── App.tsx                 # Hash router & responsive header navigation
│   └── main.tsx                # Application root with theme initialization
├── supabase/
│   └── schema.sql              # Supabase table schema & RLS policies
├── tests/
│   └── unit.mjs                # Unit tests for sync engine, tasks, and habits
└── vite.config.ts              # Vite configuration
```

---

## 📱 Installing as a PWA
- **Desktop (Chrome / Edge)**: Click the **Install** icon in the browser address bar.
- **Mobile (Android / iOS)**: Open in browser and select **"Add to Home Screen"** or **"Install app"**.

---

## 🔒 Privacy & Data
Daily Journal stores all journals, tasks, habits, and preferences locally in your browser's IndexedDB and localStorage. No data is sent to external servers unless you explicitly sign in to the Cloud Sync feature.
