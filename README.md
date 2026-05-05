# 🚀 HabitFlow 2026

> **Master your discipline with a high-performance tracking lab.**

HabitFlow 2026 is an advanced **Single Page Application (SPA)** designed for professional users and high-achievers. This app doesn't just track habits — it provides deep analytics on your consistency along with a **"Perfect Day"** logic to deliver insightful performance reports.

---

## ✨ Key Features

### 🌑 Pure Dark Aesthetic
- **Futuristic UI:** Deep black (`#0a0a0c`) theme with Indigo and Rose gradients, designed to enhance focus and productivity.
- **Zero-Distraction Layout:** A clean, minimal interface built specifically for dark mode enthusiasts.

---

### 🔥 Smart Streak System — The "Perfect Day" Logic
- **Perfect Day Requirement:** Your streak increases **only** when you complete **all** active habits for the day. Missing even one habit breaks the streak.
- **Streak Protection:** The "Reset Today" feature lets you clear only today's data (to correct mistakes) without losing your hard-earned streak from previous days.
- **Past Context:** The app automatically scans past records to calculate your true "In-a-Row" success count.

---

### 📊 Consistency Lab (Analytics)
- **Weekly Efficiency:** A 7-day productivity visualization powered by **Recharts**. If your score hits 100%, the bar turns Emerald Green.
- **Master Performance Grid:** An Excel-style monthly view that displays your track record from the 1st to the 31st as dots.
- **Dynamic States:**
  - 🔘 **Nil** — Days before the habit was started.
  - 🟡 **Pending** — Today or past days that were missed.
  - ⬜ **Blank** — Future dates (no "Pending" noise shown for upcoming days).

---

### 📥 Professional Data Export
- **Excel Integration:** Download your entire monthly report as a `.xlsx` file in one click. Future dates are automatically left blank so the spreadsheet stays clean and professional.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router & Turbopack) |
| **Styling** | Tailwind CSS |
| **Backend** | Supabase (PostgreSQL Database & Auth) |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Data Processing** | SheetJS (XLSX) & date-fns |

---

## 🚀 Getting Started

### 1. Project Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/habit-tracker-2026.git
cd habit-tracker-2026
npm install
```

---

### 2. Environment Configuration

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

### 3. Database Schema

Run the following SQL in your **Supabase SQL Editor** to create the required tables:

```sql
-- Habits Table
CREATE TABLE habits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logs Table
CREATE TABLE habit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  UNIQUE(habit_id, log_date)
);
```

---

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Architecture

```
├── src/
│   ├── app/
│   │   ├── auth/         # Login & Sign-up (Clean UI)
│   │   ├── tracker/      # Main Dashboard & Perfect Streak Logic
│   │   └── page.tsx      # Landing Page (Glow Effect)
│   ├── lib/
│   │   └── supabase.ts   # Supabase Client Config
│   └── components/       # Reusable UI Elements
└── public/               # Static Assets
```

---

## 👨‍💻 Developed By

**Shivam Joshi**
AI Engineer @ TCS
📅 Project Year: **2026**

📱 **WhatsApp:** [+91 76686 24575](https://wa.me/917668624575)
🌐 **Portfolio:** [shivamjoshi-portfolio.vercel.app](https://shivamjoshi-portfolio.vercel.app/)

---

> *"Discipline is the bridge between goals and accomplishment."*
