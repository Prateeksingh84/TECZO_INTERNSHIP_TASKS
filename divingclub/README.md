# 🤿 DivingClub

A modern, responsive diving club website powered by **Supabase** as the backend. Browse diving experiences, read blog articles, book courses, and manage your profile — all backed by a real-time PostgreSQL database with row-level security.

---

## Tech Stack

| Layer        | Technology                        |
| ------------ | --------------------------------- |
| **Frontend** | HTML, CSS, Vanilla JavaScript     |
| **Backend**  | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| **Auth**     | Supabase Auth (email/password, OAuth) |
| **Database** | PostgreSQL 15 via Supabase        |
| **Storage**  | Supabase Storage (avatar uploads) |
| **Hosting**  | Any static file server            |

---

## Features

- 🔐 **Authentication** — Sign up, log in, and manage your profile with Supabase Auth
- 👤 **User Profiles** — Avatar upload, bio, and contact info
- 📝 **Blog** — Browse diving articles and tips
- 🏊 **Activities** — Explore beginner, intermediate, and advanced diving programs
- ⭐ **Moments** — Featured diving experiences with pricing and ratings
- 📩 **Newsletter** — Subscribe to the mailing list
- 📅 **Bookings** — Submit booking requests for courses, dives, and events
- 📊 **Site Stats** — Live counters for members, dives, and courses
- ⚡ **Realtime** — Instant updates via Supabase Realtime subscriptions
- 🛡️ **Row Level Security** — Production-grade RLS policies on every table

---

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in (or create an account).
2. Click **New Project** and fill in the project name, database password, and region.
3. Wait for the project to finish provisioning.

### 2. Get Your API Credentials

1. In your Supabase dashboard, navigate to **Settings → API**.
2. Copy the **Project URL** (e.g. `https://xyzcompany.supabase.co`).
3. Copy the **anon (public) key** — this is safe to use in client-side code.

### 3. Run the Database Schema

1. In your Supabase dashboard, open **SQL Editor**.
2. Click **New Query**.
3. Paste the entire contents of [`sql/schema.sql`](sql/schema.sql) into the editor.
4. Click **Run** to execute. This will create all tables, RLS policies, functions, triggers, indexes, and seed data.

### 4. Create the Avatars Storage Bucket

1. In the Supabase dashboard, navigate to **Storage**.
2. Click **New Bucket** and name it `avatars`.
3. Enable **Public bucket** so avatar URLs are publicly accessible.
4. Set the **max file size** to **2 MB**.
5. Set **allowed MIME types** to: `image/jpeg`, `image/png`, `image/webp`.

### 5. Configure the Frontend

Open `js/supabase-config.js` and update the placeholder values:

```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

Replace with the **Project URL** and **anon key** you copied in step 2.

### 6. Serve Locally

You can use any static file server. The simplest option is Python's built-in server:

```bash
cd divingclub
python -m http.server 3000
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

> **Tip:** You can also use `npx serve .` or any other static server of your choice.

---

## Project Structure

```
divingclub/
├── README.md                  # This file
├── index.html                 # Main entry point
├── css/
│   └── styles.css             # Global styles
├── js/
│   ├── supabase-config.js     # Supabase URL & anon key
│   ├── auth.js                # Authentication logic
│   ├── blog.js                # Blog post fetching & rendering
│   ├── activities.js          # Activities section
│   ├── moments.js             # Moments / experiences section
│   ├── bookings.js            # Booking form & management
│   └── stats.js               # Site statistics
├── images/                    # Static images & assets
│   ├── blog_1.jpg
│   ├── blog_2.jpg
│   ├── blog_3.jpg
│   ├── diving_activity_1.jpg
│   ├── diving_activity_2.jpg
│   ├── diving_activity_3.jpg
│   ├── moment_1.jpg
│   ├── moment_2.jpg
│   └── moment_3.jpg
└── sql/
    └── schema.sql             # Supabase database schema
```

---

## Environment Variables

This project uses client-side configuration instead of `.env` files. All configuration lives in `js/supabase-config.js`:

| Variable             | Description                                          | Where to Find                     |
| -------------------- | ---------------------------------------------------- | --------------------------------- |
| `SUPABASE_URL`       | Your Supabase project URL                            | Dashboard → Settings → API        |
| `SUPABASE_ANON_KEY`  | Public anonymous key (safe for client-side use)       | Dashboard → Settings → API        |

> **⚠️ Important:** The `anon` key is designed to be public — it only allows access within the boundaries defined by your RLS policies. Never expose the `service_role` key in client-side code.

### Optional: Using Environment Variables with a Build Tool

If you later migrate to a build tool (Vite, Webpack, etc.), move these values into a `.env` file:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

And reference them via `import.meta.env.VITE_SUPABASE_URL` in your JavaScript.

---

## License

This project is provided as-is for educational and personal use.
