
# Dart CMS

**Realtime Messaging & Analytics Edition**

Dart CMS MK3 is a robust full-stack platform designed for managing business operations, scheduling, and client communication across multiple teams. Built using Next.js, Supabase, and PostgreSQL, it now features a custom-built real-time messaging engine and full analytics suite for tracking user activity, engagement, and performance insights.
#MK3


A scalable, privacy-friendly business platform with live messaging, advanced analytics, and adaptive scheduling. Built for remote teams, service providers, and administrative control.## Features

- Dynamic job scheduling with intelligent assignment logic
- Realtime private & group messaging system (custom PostgreSQL-based)
- Dark mode toggle and adaptive theming
- Role-based sign-in and access control
- Device & browser usage tracking per session
- Page view heatmapping and route analytics
- Custom event tracking via secure endpoints
- Clean and responsive UI powered by Tailwind CSS + Radix
## ✅ To-Do List

- [x] Implement job randomization feature  
- [x] Add dropdown menu for navigation  
- [x] Include a dark mode toggle  
- [x] Add business cleaning day settings page  
- [x] Replace `<Image>` components with static `<img>` for better control  
- [x] Build and deploy Version 2 Home Page update  
- [x] Create a secure login flow with live dropdown state updates  
- [x] Add user authentication for restricted access  
- [ ] Add "Sign in with Google" or third-party provider login (button hidden for now)  
- [ ] Implement a calendar view for better schedule visualization  
- [ ] Develop a settings page for user preferences  
- [ ] Allow job data to be exported as Excel reports  
- [ ] Store form progress and purge old entries via cron job  
- [ ] Deploy public site and admin dashboard to production  
- [ ] Add Docker and Kubernetes integration for self-hosting  
## Lessons

- Built a fully custom messaging engine with real-time updates using PostgreSQL `LISTEN/NOTIFY`
- Created a modular analytics system using daily and hourly aggregation tables
- Implemented API-based session tracking with performance metrics like TTFB and LCP
- Designed scalable table relationships using Supabase and no RLS constraints
## Demo

`Live:` [https://schedual-five.vercel.app](https://schedual-five.vercel.app)

## Screenshots
- Home dashboard with device analytics
- Real-time messaging overlay between admins and clients
- Custom schedule control panel for business units
![App Screenshot](https://via.placeholder.com/468x300?text=App+Screenshot+Here)

## API Reference

#### Track Page View

```http
  GET /api/analytics/track
```

| Parameter   | Type     | Description                        |
| :---------- | :------- | :--------------------------------- |
| `sessionId` | `string` | **Required**. Session ID           |
| `pageUrl`   | `string` | Page being viewed                  |
| `userAgent` | `string` | Browser's user-agent string        |

---

#### Log Custom Event

```http
  POST /api/analytics/event
```

| Parameter     | Type     | Description                              |
| :------------ | :------- | :--------------------------------------- |
| `sessionId`   | `string` | **Required**. Session ID                 |
| `eventName`   | `string` | **Required**. Type of event              |
| `metadata`    | `object` | Optional custom data                    |

---

#### Record Performance Metrics

```http
  POST /api/analytics/performance
```

| Parameter   | Type    | Description                                      |
| :---------- | :------ | :----------------------------------------------- |
| `sessionId` | `string`| **Required**. Session ID                         |
| `metrics`   | `array` | Array of Core Web Vitals (LCP, FID, TTFB, CLS)   |

---

#### Apply Invite Code

```http
  POST /api/apply-invite
```

| Parameter   | Type     | Description                          |
| :---------- | :------- | :----------------------------------- |
| `code`      | `string` | **Required**. Invite code to validate |

---

#### Generate Punchcard

```http
  POST /api/genpunch
```

| Parameter    | Type     | Description                           |
| :----------- | :------- | :------------------------------------ |
| `week`       | `number` | **Required**. Week number to generate |

---

#### Get Notifications

```http
  GET /api/notifications
```

| Parameter   | Type     | Description                          |
| :---------- | :------- | :----------------------------------- |
| `user_id`   | `string` | **Required**. User ID to fetch notifications |

---

#### Send Message

```http
  POST /api/messages
```

| Parameter     | Type     | Description                       |
| :------------ | :------- | :-------------------------------- |
| `to`          | `string` | **Required**. Recipient user ID   |
| `content`     | `string` | **Required**. Message content     |

---

#### Get Product by ID

```http
  GET /api/products/${id}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | **Required**. Product ID          |

---

#### Get All Users

```http
  GET /api/get-all-users
```

| Parameter | Type     | Description                  |
| :-------- | :------- | :--------------------------- |
| None      | —        | Admin access to all users    |



## Installation

```bash
git clone https://github.com/your-username/dart-cms.git
cd dart-cms
npm install
npm run dev
```
## Tech Stack

**Frontend:** Next.js 15, Tailwind CSS  
**Backend:** Supabase (PostgreSQL), pg_cron  
**Charts:** Recharts, ApexCharts  
**Messaging:** PostgreSQL pub/sub + Supabase listeners  
**Analytics:** Custom aggregation tables + API endpoints  

**Languages and Tools:**  
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Sass](https://img.shields.io/badge/Sass-CC6699?style=for-the-badge&logo=sass&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
## Feedback

Have ideas or bugs? Open an issue or email [unenter.dev@protonmail.com](mailto:unenter.dev@protonmail.com)
## Documentation

See `/docs/architecture.md` (coming soon) for full backend schema and table structure.

## Badges

Add badges from somewhere like: [shields.io](https://shields.io/)

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![GPLv3 License](https://img.shields.io/badge/License-GPL%20v3-yellow.svg)](https://opensource.org/licenses/)
[![AGPL License](https://img.shields.io/badge/license-AGPL-blue.svg)](http://www.gnu.org/licenses/agpl-3.0)

