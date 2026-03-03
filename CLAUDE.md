# DCG.CO — Agent Context File

## Project Root
Z:

## Stack
Next.js 15 App Router, Supabase, Stripe, Tailwind, shadcn/ui, TypeScript

## Real Directory Map
- app/ — Next.js routes (App Router)
- components/ — Shared UI components
- components/shop/ — Storefront components
- components/Layouts/ — Layout system
- components/cart/ — Cart components
- lib/ — Shared logic, contexts, utils
- utils/supabase/ — Supabase clients (client.ts, server.ts, middleware.ts)
- hooks/ — Custom React hooks
- types/ — TypeScript types
- style/ — CSS files including layout-tokens.css
- ai/ — Project documentation (ARCHITECTURE.md, CONVENTIONS.md, DECISIONS.md, TASKS.md)

## Key Files
- ai/CONVENTIONS.md — Coding standards to follow
- ai/ARCHITECTURE.md — Full file tree
- ai/DECISIONS.md — Why things were built the way they were
- ai/TASKS.md — Current task list
- components/Layouts/routeClassifier.ts — Route logic
- utils/supabase/client.ts — Browser Supabase client
- utils/supabase/server.ts — Server Supabase client

## Hard Rules
- NEVER touch: webhooks/stripe, auth/, utils/supabase/middleware.ts
- NEVER delete working code — only improve it
- NEVER run git commands
- NEVER change branding, colors, or business logic
- Keep files under 150 lines
- Server components fetch data, client components handle interaction
- Use existing Tailwind + CSS token system — no inline styles

## Updated Files (2026-03-03)
### components/
- New folders: `orders`, `POS`, `documents`, `profile`, `settings`
- New files: `assignRandomJobs.ts`, `CleanTrack.tsx`, `Export.tsx`, `PunchCardGrid.tsx`, `UniversalExportButton.tsx`

### hooks/
- New hooks: `useAnalyticsConsent.ts`, `useCalendarPermissions.ts`, `useChatDebugActions.ts`, `useDocuments.ts`, `useHallMonitor.ts`, `useMessageManagement.ts`, `useOptimisticHours.ts`, `usePersistentTimesheetLogic.ts`, `useRealtimeInsert.ts`, `useRealtimeNotifications.ts`

### lib/
- New folders: `landing`, `monitors`, `usps`
- New files: `escpos.ts`, `thermalPrinter.ts`, `notifications.ts`, `robustPDFGenerator.ts`, `roleContext.tsx`