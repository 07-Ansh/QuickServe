# ⚡ QuickServe

> **Bringing Services, Closer than your ex.**

QuickServe is an on-demand home services platform that connects customers with verified local professionals — in 15 minutes or less. Book plumbers, electricians, cleaners, carpenters, and more, with real-time tracking and in-app chat.

---

## ✨ Features

- 🔍 **Instant Search** — Find the right service in seconds
- 📍 **Live Location Tracking** — Real-time map view of your provider
- 💬 **In-App Chat** — Message your provider directly
- 🛡️ **Verified Professionals** — Background-checked and skill-assessed
- ⭐ **Ratings & Reviews** — Post-service feedback system
- 💳 **Payments** — Built-in payment flow with wallet support
- 👤 **Dual Dashboards** — Separate views for customers and service providers
- 🌐 **Demo Mode** — Try the provider dashboard without signing up

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Backend / Auth | [Supabase](https://supabase.com/) (PostgreSQL + RLS) |
| Maps | React Leaflet |
| Icons | Lucide React |

## 📁 Project Structure

```
quickserve/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── login/                    # Auth page
│   ├── dashboard/
│   │   ├── customer/             # Customer dashboard
│   │   ├── provider/             # Provider dashboard
│   │   └── tracking/[requestId]/ # Live tracking page
│   └── auth/callback/            # Supabase OAuth callback
├── components/                   # Reusable UI components
├── constants/
│   └── services.ts               # Service catalog
├── lib/
│   ├── supabase/client.ts        # Supabase client
│   ├── distance.ts               # Geo utilities
│   └── utils.ts                  # Helpers
└── supabase_schema.sql           # Full DB schema
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com/) project

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/Quickserve.git
cd Quickserve
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set up the database

Run the SQL schema in your Supabase SQL editor:

```bash
# Copy contents of supabase_schema.sql into Supabase → SQL Editor → Run
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Schema

| Table | Description |
|---|---|
| `profiles` | User profiles (customers & providers) |
| `services` | Service catalog with base pricing |
| `requests` | Service booking requests with status |
| `reviews` | Post-service ratings and comments |
| `messages` | Real-time in-app chat messages |

Row Level Security (RLS) is enabled on all tables.

## 🧩 Services Offered

| Service | Base Price |
|---|---|
| 🔧 General Repair | ₹300 |
| 💧 Plumbing | ₹350 |
| ⚡ Electrical | ₹400 |
| 🪣 Cleaning | ₹250 |
| 🔨 Carpentry | ₹450 |
| 🚚 Moving & Layout | ₹500 |

## 📜 License

MIT © QuickServe
