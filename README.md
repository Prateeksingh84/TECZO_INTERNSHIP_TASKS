<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:7F77DD,100:1D9E75&height=200&section=header&text=Internship%20Projects&fontSize=48&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Six%20full-stack%20builds%20%E2%80%94%20frontend,%20backend,%20and%20realtime&descAlignY=55&descSize=18" width="100%" />

<img src="https://readme-typing-svg.demolab.com/?font=Fira+Code&size=22&pause=1000&color=1D9E75&center=true&vCenter=true&width=600&lines=Next.js+%2B+TypeScript+e-commerce;Vite+%2B+Supabase+realtime+websites;Static+sites+with+auth+%26+SQL+schemas;Admin+dashboards+%2B+customer+chatbots" alt="Typing SVG" />

</div>

<br/>

## Table of contents

- [Natura Essence Skincare Platform](#-natura-essence-skincare-platform)
- [DivingClub Website](#-divingclub-website)
- [NIO EV Website](#-nio-ev-website)
- [TECZO Website 3](#-teczo-website-3)
- [TECZO Vite Realtime Website 1](#-teczo-vite-realtime-website-1)
- [TECZO Website Demo 2](#-teczo-website-demo-2)

<br/>

---

## 🧴 Natura Essence Skincare Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

</div>

A premium skincare e-commerce experience with a dynamic product catalog, cart drawer, product detail modal, newsletter capture, and a local JSON database for demo persistence.

**Features**
- Premium landing page UI with matched skincare product visuals
- Product detail modal, add-to-cart, and a full cart drawer (quantity, remove, clear, checkout demo)
- Newsletter subscription and contact lead capture APIs
- Product and store content served from backend API routes
- Responsive layout for desktop and mobile

**Project structure**
```txt
natura-essence-skincare-platform/
├── data/
│   └── natura-store.json
├── public/assets/
├── scripts/
├── src/
│   ├── app/
│   ├── components/
│   └── lib/
├── package.json
├── next.config.ts
└── tsconfig.json
```

**API routes**
```txt
GET/POST/PATCH/DELETE  /api/cart
GET   /api/store
GET   /api/products
GET   /api/products/[id]
POST  /api/newsletter
POST  /api/contact
GET   /api/admin/records
GET   /api/asset/[kind]/[id]
```

**Run locally**
```powershell
cd natura-essence-skincare-platform
npm.cmd install
npm.cmd run dev
```
Open `http://localhost:3000`

Create `.env.local` from `.env.example`:
```env
NEXT_PUBLIC_APP_NAME="Natura Essence"
```

<div align="right"><a href="#-table-of-contents">↑ back to top</a></div>

---

## 🤿 DivingClub Website

<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

</div>

A static frontend for a diving and adventure club, with image-rich sections, blog cards, Supabase-backed auth, and a realtime-ready structure.

**Features**
- Adventure diving landing page and hero section
- Activity cards, blog cards, newsletter, and image gallery
- Auth, profile, and realtime JavaScript modules
- Supabase configuration support and SQL schema

**Project structure**
```txt
divingclub/
├── images/
├── js/
│   ├── auth.js
│   ├── profile.js
│   ├── realtime.js
│   └── supabase-config.js
├── sql/schema.sql
├── index.html
├── styles.css
└── script.js
```

**Run locally**

Open `index.html` directly, or right-click → *Open with Live Server* in VS Code.

**Supabase setup**
```txt
1. Create a Supabase project
2. Run sql/schema.sql in the SQL Editor
3. Add your URL and anon key to js/supabase-config.js
```

<div align="right"><a href="#-table-of-contents">↑ back to top</a></div>

---

## ⚡ NIO EV Website

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

</div>

A modern electric vehicle brand website with a car showcase, tech and specs sections, and contact/newsletter flows backed by API routes.

**Features**
- Premium EV landing page and hero section
- Car showcase, features grid, technology, and specs sections
- Community, contact, and products pages
- Newsletter and contact API routes with reusable, responsive UI components

**Project structure**
```txt
nio-ev-website/
├── public/
├── src/
│   ├── app/
│   ├── components/
│   └── lib/
├── package.json
├── next.config.ts
└── eslint.config.mjs
```

**Run locally**
```powershell
cd nio-ev-website
npm.cmd install
npm.cmd run dev
```
Open `http://localhost:3000` · Build with `npm.cmd run build`

```env
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
NEXT_PUBLIC_APP_NAME="NIO EV Website"
```

<div align="right"><a href="#-table-of-contents">↑ back to top</a></div>

---

## 🤖 TECZO Website 3

<div align="center">

![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

</div>

A Vite-powered business site for a software development and automation company, with service pages, case studies, an admin dashboard, and a customer chatbot.

**Features**
- Modern landing page plus privacy and terms pages
- Service pages: AI automation, CRM workflow automation, custom software, e-commerce engineering, SaaS product development
- Case studies page and a location-specific SEO page
- Admin dashboard, customer chatbot script, and a realtime service layer
- Supabase database schema and public SEO files

**Project structure**
```txt
TECZO_WEBSITE-3/
├── case-studies/
├── database/supabase.sql
├── locations/
├── public/
├── services/
│   ├── ai-automation/
│   ├── crm-workflow-automation/
│   ├── custom-software-development/
│   ├── ecommerce-engineering/
│   └── saas-product-development/
├── src/
│   ├── services/
│   ├── styles/
│   ├── admin.js
│   ├── customerChatbot.js
│   └── main.js
├── admin.html
├── index.html
├── privacy.html
└── terms.html
```

**Run locally**
```powershell
cd TECZO_WEBSITE-3
npm.cmd install
npm.cmd run dev
```
Open `http://localhost:5173`

**Supabase setup:** run `database/supabase.sql` in the SQL Editor, then set variables from `.env.example`.

<div align="right"><a href="#-table-of-contents">↑ back to top</a></div>

---

## 🔌 TECZO Vite Realtime Website 1

<div align="center">

![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

</div>

A lightweight Vite + Supabase realtime website focused on a clean landing page, admin management, and chatbot interaction.

**Features**
- Vite frontend setup with a clean landing page
- Admin dashboard page and customer chatbot script
- Realtime service integration and Supabase database schema
- Public favicon asset and environment variable example

**Project structure**
```txt
teczo-vite-realtime-website-1/
├── database/supabase.sql
├── public/favicon.svg
├── src/
│   ├── services/realtimeService.js
│   ├── styles/
│   │   ├── admin.css
│   │   └── style.css
│   ├── admin.js
│   ├── customerChatbot.js
│   └── main.js
├── admin.html
└── index.html
```

**Run locally**
```powershell
cd teczo-vite-realtime-website-1
npm.cmd install
npm.cmd run dev
```
Open `http://localhost:5173`

```env
VITE_SUPABASE_URL=""
VITE_SUPABASE_ANON_KEY=""
```

Then run `database/supabase.sql` in the Supabase SQL Editor.

<div align="right"><a href="#-table-of-contents">↑ back to top</a></div>

---

## 🖥️ TECZO Website Demo 2

<div align="center">

![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

</div>

A compact Vite + Supabase demo website for a software services company, with a public landing page, admin page, and chatbot logic.

**Features**
- Public landing page and admin dashboard page
- Customer chatbot JavaScript and a realtime service layer
- Supabase SQL schema and public favicon
- Environment example file and clean folder structure

**Project structure**
```txt
TECZO-WEBSITE-DEMO-2/
├── database/supabase.sql
├── public/favicon.svg
├── src/
│   ├── services/realtimeService.js
│   ├── styles/
│   │   ├── admin.css
│   │   └── style.css
│   ├── admin.js
│   ├── customerChatbot.js
│   └── main.js
├── admin.html
└── index.html
```

**Run locally**
```powershell
cd TECZO-WEBSITE-DEMO-2
npm.cmd install
npm.cmd run dev
```
Open `http://localhost:5173`

**Supabase setup:** create a project, run `database/supabase.sql` in the SQL Editor, then add your keys to `.env` (based on `.env.example`):
```env
VITE_SUPABASE_URL=""
VITE_SUPABASE_ANON_KEY=""
```

<div align="right"><a href="#-table-of-contents">↑ back to top</a></div>

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1D9E75,100:7F77DD&height=120&section=footer" width="100%" />

</div>
