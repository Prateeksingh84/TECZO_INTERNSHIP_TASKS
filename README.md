# README Markdown Files for Six Internship Projects

This file contains the full Markdown README content for all six projects.


---


## File: `natura-essence-skincare-platform/README.md`


```markdown

# Natura Essence Skincare Platform

Natura Essence Skincare Platform is a modern skincare e-commerce experience built with Next.js and TypeScript. The project focuses on a premium product landing page, dynamic product catalog, cart functionality, product detail modal, newsletter capture, contact lead capture, and backend API-driven content.

## Features

- Premium skincare landing page UI
- Dynamic product collection section
- Product detail modal on card click
- Add to cart functionality
- Cart drawer with quantity update, remove, clear, and checkout demo
- Newsletter subscription API
- Contact lead capture API
- Product and store content served from backend APIs
- Local JSON database for demo persistence
- Matched skincare product visual assets
- Responsive layout for desktop and mobile

## Tech Stack

- Next.js
- React
- TypeScript
- CSS
- Node.js API Routes
- Local JSON file database

## Project Structure

```txt
natura-essence-skincare-platform/
├── data/
│   └── natura-store.json
├── public/
│   └── assets/
├── scripts/
├── src/
│   ├── app/
│   ├── components/
│   └── lib/
├── package.json
├── next.config.ts
├── tsconfig.json
└── README.md
```

## API Routes

```txt
GET    /api/store
GET    /api/products
GET    /api/products/[id]
GET    /api/cart
POST   /api/cart
PATCH  /api/cart
DELETE /api/cart
POST   /api/newsletter
POST   /api/contact
GET    /api/admin/records
GET    /api/asset/[kind]/[id]
```

## Run Locally

```powershell
cd natura-essence-skincare-platform
npm.cmd install
npm.cmd run dev
```

Open:

```txt
http://localhost:3000
```

## Environment Variables

Create `.env.local` using `.env.example`.

```env
NEXT_PUBLIC_APP_NAME="Natura Essence"
```

## Purpose

This project demonstrates a production-style e-commerce frontend with backend APIs, cart state management, product details, and clean UI/UX for a skincare brand.

```


---


## File: `divingclub/README.md`


```markdown

# DivingClub Website

DivingClub is a static frontend website for a diving and adventure club. The project includes a landing page, image-based content sections, blog cards, authentication-related scripts, Supabase configuration, profile logic, realtime support files, and SQL schema support.

## Features

- Adventure diving landing page
- Hero section with diving visuals
- Activity cards
- Blog cards
- Newsletter section
- Image gallery/moments section
- Local dynamic content renderer
- Supabase configuration support
- Auth and profile JavaScript files
- Realtime support scripts
- SQL schema for backend setup

## Tech Stack

- HTML
- CSS
- JavaScript
- Supabase
- SQL

## Project Structure

```txt
divingclub/
├── images/
├── js/
├── sql/
├── index.html
├── styles.css
├── script.js
├── README.md
└── folder_structure.txt
```

## Main Files

```txt
index.html              Main website page
styles.css              Website styling
script.js               Main frontend interactions
js/auth.js              Authentication logic
js/profile.js           Profile handling
js/realtime.js          Realtime integration
js/supabase-config.js   Supabase client configuration
sql/schema.sql          Database schema
```

## Run Locally

Open directly in the browser:

```txt
index.html
```

Recommended with VS Code Live Server:

```txt
Right click index.html -> Open with Live Server
```

## Supabase Setup

1. Create a Supabase project.
2. Open SQL Editor.
3. Run the schema from:

```txt
sql/schema.sql
```

4. Update Supabase URL and anon key inside:

```txt
js/supabase-config.js
```

## Purpose

This project demonstrates a complete static club website with image-rich sections, dynamic rendering support, Supabase-ready scripts, and database schema integration.

```


---


## File: `nio-ev-website/README.md`


```markdown

# NIO EV Website

NIO EV Website is a modern electric vehicle website built with Next.js and TypeScript. It includes a premium EV landing page, product sections, contact/newsletter flows, reusable UI components, and a responsive design system.

## Features

- Premium EV landing page
- Hero section for electric vehicle branding
- Car showcase section
- Features grid
- Technology section
- Specs detail section
- Community section
- Contact page
- Products page
- Newsletter and contact API routes
- Responsive UI components
- Supabase-ready configuration support

## Tech Stack

- Next.js
- React
- TypeScript
- CSS Modules
- Supabase
- Node.js

## Project Structure

```txt
nio-ev-website/
├── public/
├── src/
│   ├── app/
│   ├── components/
│   └── lib/
├── package.json
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
└── README.md
```

## Run Locally

```powershell
cd nio-ev-website
npm.cmd install
npm.cmd run dev
```

Open:

```txt
http://localhost:3000
```

## Build

```powershell
npm.cmd run build
```

## Environment Variables

Create `.env.local` from `.env.example`.

```env
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
NEXT_PUBLIC_APP_NAME="NIO EV Website"
```

## Purpose

This project demonstrates a professional electric vehicle brand website with reusable components, modern UI, responsive sections, and backend-ready contact/newsletter flows.

```


---


## File: `TECZO_WEBSITE-3/README.md`


```markdown

# TECZO Website 3

TECZO Website 3 is a Vite-powered business website created for a software development and automation company. It includes service pages, case studies, location landing page, admin dashboard, customer chatbot, Supabase database schema, and realtime service integration.

## Features

- Modern business landing page
- Admin dashboard page
- Privacy and terms pages
- Service landing pages
- Case studies page
- Location-specific SEO page
- Customer chatbot script
- Realtime service layer
- Supabase database schema
- Public SEO files
- Responsive styling
- Environment configuration support

## Tech Stack

- Vite
- HTML
- CSS
- JavaScript
- Supabase
- SQL

## Project Structure

```txt
TECZO_WEBSITE-3/
├── case-studies/
├── database/
├── locations/
├── public/
├── services/
├── src/
│   ├── services/
│   ├── styles/
│   ├── admin.js
│   ├── customerChatbot.js
│   └── main.js
├── admin.html
├── index.html
├── privacy.html
├── terms.html
├── package.json
├── vite.config.js
└── README.md
```

## Service Pages

```txt
services/ai-automation/
services/crm-workflow-automation/
services/custom-software-development/
services/ecommerce-engineering/
services/saas-product-development/
```

## Run Locally

```powershell
cd TECZO_WEBSITE-3
npm.cmd install
npm.cmd run dev
```

Open:

```txt
http://localhost:5173
```

## Supabase Setup

Run the SQL schema from:

```txt
database/supabase.sql
```

Then update environment variables using `.env.example`.

## Purpose

This project demonstrates a production-style Vite business website with service pages, lead capture flow, chatbot logic, admin dashboard files, Supabase schema, and realtime service integration.

```


---


## File: `teczo-vite-realtime-website-1/README.md`


```markdown

# TECZO Vite Realtime Website 1

TECZO Vite Realtime Website 1 is a Vite + Supabase realtime website focused on business landing page functionality, admin management, chatbot interaction, and realtime backend integration.

## Features

- Vite frontend setup
- Landing page
- Admin dashboard page
- Customer chatbot script
- Realtime service integration
- Supabase database schema
- Public favicon asset
- Environment variable example
- Clean project structure
- Responsive styling

## Tech Stack

- Vite
- HTML
- CSS
- JavaScript
- Supabase
- SQL

## Project Structure

```txt
teczo-vite-realtime-website-1/
├── database/
│   └── supabase.sql
├── public/
│   └── favicon.svg
├── src/
│   ├── services/
│   │   └── realtimeService.js
│   ├── styles/
│   │   ├── admin.css
│   │   └── style.css
│   ├── admin.js
│   ├── customerChatbot.js
│   └── main.js
├── admin.html
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Run Locally

```powershell
cd teczo-vite-realtime-website-1
npm.cmd install
npm.cmd run dev
```

Open:

```txt
http://localhost:5173
```

## Environment Variables

Create `.env` from `.env.example`.

```env
VITE_SUPABASE_URL=""
VITE_SUPABASE_ANON_KEY=""
```

## Database Setup

Open Supabase SQL Editor and run:

```txt
database/supabase.sql
```

## Purpose

This project demonstrates a lightweight realtime company website with Supabase-backed services, chatbot support, admin dashboard scripts, and Vite-based development workflow.

```


---


## File: `TECZO-WEBSITE-DEMO-2/README.md`


```markdown

# TECZO Website Demo 2

TECZO Website Demo 2 is a compact Vite + Supabase demo website for a software services company. It includes a public landing page, admin page, chatbot logic, realtime service file, Supabase schema, and clean responsive styling.

## Features

- Vite-based website
- Public landing page
- Admin dashboard page
- Customer chatbot JavaScript
- Realtime service layer
- Supabase SQL schema
- Public favicon
- Environment example file
- Responsive CSS
- Clean folder structure

## Tech Stack

- Vite
- HTML
- CSS
- JavaScript
- Supabase
- SQL

## Project Structure

```txt
TECZO-WEBSITE-DEMO-2/
├── database/
│   └── supabase.sql
├── public/
│   └── favicon.svg
├── src/
│   ├── services/
│   │   └── realtimeService.js
│   ├── styles/
│   │   ├── admin.css
│   │   └── style.css
│   ├── admin.js
│   ├── customerChatbot.js
│   └── main.js
├── admin.html
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Run Locally

```powershell
cd TECZO-WEBSITE-DEMO-2
npm.cmd install
npm.cmd run dev
```

Open:

```txt
http://localhost:5173
```

## Supabase Setup

1. Create a Supabase project.
2. Open SQL Editor.
3. Run:

```txt
database/supabase.sql
```

4. Add project keys inside `.env`.

## Environment Variables

Use `.env.example` as the base.

```env
VITE_SUPABASE_URL=""
VITE_SUPABASE_ANON_KEY=""
```

## Purpose

This project demonstrates a simple but production-ready Vite website with frontend pages, admin scripts, chatbot logic, realtime services, and Supabase database setup.

```
