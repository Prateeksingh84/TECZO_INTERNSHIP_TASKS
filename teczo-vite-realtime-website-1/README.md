<div align="center">

# ⚡ Teczo — Real-Time Software Solutions Website

### A real-time, animated demo built for **Teczo Softwares**

`Vite` · `HTML5` · `CSS3` · `JavaScript` · `Supabase` · `PostgreSQL` · `Realtime`

![Status](https://img.shields.io/badge/status-demo-2BD9A8?style=for-the-badge)
![Frontend](https://img.shields.io/badge/frontend-Vite-5B6CFF?style=for-the-badge&logo=vite&logoColor=white)
![Backend](https://img.shields.io/badge/backend-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-lightgrey?style=for-the-badge)

🎯 *Built as a performance/demo task for an internship evaluation*

</div>

---

## 🧭 Overview

> This isn't just a static frontend — it's a **small real-time lead management system.**

| Step | What happens |
|:---:|---|
| 💬 | A visitor submits an enquiry through the **contact form** or the **chatbot** |
| 📥 | The enquiry is saved as a **lead** |
| ⚡ | New leads, status changes, and deletions show up **instantly** in the admin dashboard — via Supabase Realtime, or a local browser-based fallback if Supabase isn't configured |
| 🛠️ | The admin searches, filters, updates status/priority, adds notes, deletes leads, and exports everything to CSV |

---

## 🧱 Tech Stack

<table>
<tr>
<td valign="top" width="33%">

### 🎨 Frontend
- HTML5, CSS3
- Vanilla JavaScript (ES modules)
- Vite (dev server + build)

</td>
<td valign="top" width="33%">

### 🗄️ Backend / Data
- Supabase (PostgreSQL · Auth · Realtime)
- Local fallback via `localStorage` + `BroadcastChannel`
- *(no backend required to demo it)*

</td>
<td valign="top" width="33%">

### 🌐 Browser APIs
- `BroadcastChannel` — cross-tab sync
- `Blob` + `createObjectURL` — CSV export
- `IntersectionObserver` — reveals & counters
- `crypto.randomUUID` — local lead IDs

</td>
</tr>
</table>

---

## 📂 Folder Structure

```text
teczo-vite-realtime-website/
├── 📄 index.html                  Public landing page
├── 🛠️  admin.html                  Admin dashboard
├── 📦 package.json
├── ⚙️  vite.config.js
├── 🔐 .env                        Local environment config (not committed)
├── 🔐 .env.example
├── 🚫 .gitignore
├── 📘 README.md
├── 🗃️  database/
│   └── supabase.sql               Schema, RLS policies, realtime publication
├── 🖼️  public/
│   └── favicon.svg
└── 🧩 src/
    ├── main.js                    Landing page logic + contact form
    ├── admin.js                   Admin dashboard logic
    ├── customerChatbot.js         Enquiry chatbot widget
    ├── services/
    │   └── realtimeService.js     Supabase client + local-demo data layer
    └── styles/
        ├── style.css
        └── admin.css
```

---

## ✨ Features

### 🌍 Public website — `index.html`
- 🖥️ Animated hero with a terminal-style typing effect cycling through build phases: `validate → architect → build → ship → scale`
- 👁️ Scroll-triggered reveal animations (`IntersectionObserver`)
- 🔢 Animated stat counters
- 🃏 Service cards that flip on hover/tap to reveal capabilities
- 🎞️ Testimonials marquee
- 📨 Real-time contact form — writes to Supabase (or local storage in demo mode) and shows a success state once saved
- 🟢 Floating **"Book a Call"** CTA that appears on scroll
- 💬 Customer enquiry chatbot *(see below)*

### 🤖 Customer chatbot
- 💬 Floating chat widget on every page
- ⚡ Answers quick questions on services, pricing, timeline, and AI automation via keyword matching
- 📝 Guides visitors through a step-by-step enquiry flow: `name → email → company → phone → service → requirement`
- ✅ On completion, saves the enquiry as a lead through the same data layer as the contact form — shows up in the admin dashboard identically

### 🛠️ Admin dashboard — `admin.html`
- 🔐 Login screen — Supabase Auth in live mode, or a fixed demo credential pair locally
- 🔍 Live lead table with search + filter by status + filter by priority
- ⚙️ Per-lead controls — update status (`new` / `contacted` / `qualified` / `closed`), update priority (`low` / `medium` / `high` / `urgent`), add/edit internal notes, delete
- 📊 Summary counts — total / new / contacted / qualified
- 📤 Export the currently filtered list to **CSV**
- ⚡ Realtime updates — new leads, edits, and deletions from any tab/device appear with **no manual refresh**
- 🟡 Mode indicator showing whether the dashboard is on Supabase or local demo storage

### 🔄 Realtime data layer — `src/services/realtimeService.js`

> This is the engine room of the project — every read/write flows through here, and it automatically picks one of two modes:

| Mode | When it activates | How sync works |
|:---:|---|---|
| 🟢 **Supabase** | `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` are set | Postgres `leads` table, Supabase Auth, `postgres_changes` realtime subscription |
| 🟡 **Local Demo** | Supabase env vars missing/empty | `localStorage` for persistence, `BroadcastChannel` for live cross-tab sync |

The rest of the app — contact form, chatbot, admin dashboard — calls the *same* functions (`insertLead`, `getLeads`, `updateLeadStatus`, etc.) no matter which mode is active. The UI never needs to know which one it's talking to. 🎯

---

## 🚀 Getting Started

**1️⃣ Install dependencies**
```bash
npm install
```

**2️⃣ Configure environment variables**
```bash
cp .env.example .env
```
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY

VITE_USE_LOCAL_DEMO_IF_NOT_CONFIGURED=true

VITE_DEMO_ADMIN_EMAIL=admin@teczo.demo
VITE_DEMO_ADMIN_PASSWORD=Teczo@123
```
💡 Leave the Supabase variables blank to run entirely in local demo mode — zero backend setup required.

> ⚠️ **Never commit a real `.env` file or paste its contents anywhere public.** Only the Supabase **anon** key belongs in frontend code, and even that should be treated as sensitive in practice. Never use the `service_role` key here.

**3️⃣ Run the dev server**
```bash
npm run dev
```
| | |
|---|---|
| 🌍 Website | `http://localhost:5173/` |
| 🛠️ Admin dashboard | `http://localhost:5173/admin.html` |

**4️⃣ Local demo admin login**
```
Email:    admin@teczo.demo
Password: Teczo@123
```

---

## 🗄️ Setting Up Supabase *(optional — for live mode)*

1. 🆕 **Create a project** at [supabase.com](https://supabase.com) → copy the **Project URL** and **anon public key** into `.env`
2. 🏗️ **Run the schema** → Supabase Dashboard → SQL Editor → New Query → run `database/supabase.sql`. Creates the `leads` and `admin_users` tables, status/priority constraints, RLS policies, and enables realtime on `leads`
3. 👤 **Create an admin user** → Dashboard → Authentication → Users → Add User (make sure the user is confirmed)
4. 🛑 **Review the RLS policies before going past local testing.** The current policies grant any `authenticated` user full read/update/delete access to all leads — they don't check `admin_users`. Tighten the `select`/`update`/`delete` policies on `leads` so they only pass for users who exist in `admin_users`.

---

## 📜 Available Scripts

| Command | Description |
|:---|---|
| `npm run dev` | ▶️ Start the Vite dev server |
| `npm run build` | 📦 Build for production into `dist/` |
| `npm run preview` | 👁️ Preview the production build locally |

---

## ☁️ Deployment

Deployable on **Netlify**, **Vercel**, or any static host that supports a Vite build.

**Build settings**
```text
Build command:     npm run build
Publish directory: dist
```

**Environment variables to set on the host**
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
VITE_USE_LOCAL_DEMO_IF_NOT_CONFIGURED=false
VITE_DEMO_ADMIN_EMAIL=admin@teczo.demo
VITE_DEMO_ADMIN_PASSWORD=Teczo@123
```

---

## 🧐 Known Limitations / Honest Notes

> A few things worth being upfront about — this was built as a demo/evaluation project, not a production system.

- 🔓 **RLS policies are permissive.** Any authenticated Supabase user — not just admins — currently has read/update/delete access to all leads. Fine for a demo; needs tightening for production.
- 🔑 **The local demo admin password is hardcoded** (`Teczo@123`) as a plain environment variable for convenience — not hashed or secured. Don't reuse this pattern in a real product.
- 🤖 **The chatbot is rule-based, not AI-powered.** Keyword matching + a scripted enquiry flow — no LLM or NLP underneath.
- 🧪 **No automated tests.** Verified manually — form submission, chatbot flow, dashboard CRUD, realtime sync across tabs.
- 📤 **CSV export and email links reflect the currently filtered table data**, based on whatever search/status/priority filters are active.

---

## 🎓 What This Project Demonstrates

- ⚡ Vite-based project setup and build pipeline
- 🧩 Vanilla JS DOM manipulation and scroll/animation handling without a framework
- 🔄 A single data-access layer that transparently swaps between a real backend (Supabase) and a local fallback
- 🗄️ Supabase: schema design, Row Level Security, Auth, and Postgres realtime subscriptions
- 🛠️ A small admin CRUD interface with search, filtering, and CSV export
- 💬 A scripted conversational UI (chatbot) feeding into the same backend as a standard form

---

<div align="center">

### 👤 Author

**Prateek Singh**

</div>