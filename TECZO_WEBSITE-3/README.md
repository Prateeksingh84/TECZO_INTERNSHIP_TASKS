# Teczo Futuristic Realtime Website

A complete upgraded website for Teczo Softwares that resolves UI/UX, accessibility, technical SEO and lead-management gaps.

## What Was Improved

- Fixed Terms & Conditions issue with a dedicated `terms.html` page
- Added Privacy Policy and proper footer legal links
- Added dedicated SEO landing pages for key services
- Added case studies page to solve the “Explore Our Work” mismatch
- Added Mysuru local landing page for local SEO and entity consistency
- Added sitemap.xml and robots.txt
- Added canonical tags, meta descriptions, Open Graph tags and schema markup
- Added accessible labels, focus states, descriptive links and motion controls
- Added Supabase-backed realtime lead capture
- Added customer enquiry chatbot
- Added admin dashboard with search, filters, priority, status, notes, delete and CSV export
- Added GA4-ready tracking hooks and Supabase site event logging

## Tech Stack

- Vite
- HTML5
- CSS3
- JavaScript
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Realtime
- Browser local demo fallback

## Project Structure

```txt
teczo-futuristic-website/
├── index.html
├── admin.html
├── privacy.html
├── terms.html
├── package.json
├── vite.config.js
├── .env.example
├── database/
│   └── supabase.sql
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   ├── sitemap.xml
│   └── site.webmanifest
├── services/
│   ├── ai-automation/index.html
│   ├── saas-product-development/index.html
│   ├── custom-software-development/index.html
│   ├── ecommerce-engineering/index.html
│   └── crm-workflow-automation/index.html
├── case-studies/
│   └── index.html
├── locations/
│   └── mysuru-software-development-company/index.html
└── src/
    ├── main.js
    ├── admin.js
    ├── customerChatbot.js
    ├── services/realtimeService.js
    └── styles/
        ├── style.css
        └── admin.css
```

## Run Locally

```bash
npm install
npm run dev
```

Open:

```txt
http://localhost:5173/
http://localhost:5173/admin.html
```

## Local Demo Login

Works when Supabase env keys are empty and local fallback is enabled.

```txt
Email: admin@teczo.demo
Password: Teczo@123
```

## Supabase Setup

1. Create a Supabase project.
2. Copy the project URL and anon public key.
3. Create `.env` from `.env.example`.
4. Run `database/supabase.sql` in Supabase SQL Editor.
5. Create admin user in Supabase Auth.
6. Insert the Auth user UUID into `public.admin_users`.

```sql
insert into public.admin_users (user_id, email)
values ('PASTE_AUTH_USER_UUID_HERE', 'admin@teczo.demo')
on conflict (user_id) do update set email = excluded.email;
```

## Environment Variables

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY
VITE_USE_LOCAL_DEMO_IF_NOT_CONFIGURED=true
VITE_DEMO_ADMIN_EMAIL=admin@teczo.demo
VITE_DEMO_ADMIN_PASSWORD=Teczo@123
VITE_GA_MEASUREMENT_ID=
```

## Deployment

Recommended: Vercel or Netlify.

Build command:

```bash
npm run build
```

Publish directory:

```txt
dist
```

## Security Note

Never expose the Supabase `service_role` key in frontend code. Use only the anon public key.

## Review Pitch

This project converts Teczo’s previous single-page brochure style into a futuristic, SEO-ready, realtime lead acquisition system. It includes dedicated service pages, case-study proof layer, local SEO page, accessible UI, sitemap, schema, Supabase backend, chatbot enquiry flow and a complete admin dashboard for managing leads.
