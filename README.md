# SmartInbox-AI

![Live Frontend](https://img.shields.io/badge/Frontend-Live_on_Vercel-black?logo=vercel)
![Live Backend](https://img.shields.io/badge/Backend-Live_on_Render-black?logo=render)

### 🔴 **Live Application:** [https://smart-inbox-ai-one.vercel.app](https://smart-inbox-ai-one.vercel.app)
*(Backend API hosted at `https://smartinbox-ai.onrender.com`)*

SmartInbox-AI is a full-stack AI email assistant that connects to Gmail, analyzes messages, and helps users draft replies, summarize threads, schedule follow-ups, and track inbox activity.

## What This Project Does

- Connects users to Gmail via Google OAuth.
- Fetches and categorizes emails from Gmail.
- Uses Gemini models to generate:
  - email summaries
  - smart replies
  - follow-up drafts
  - rewrite/enhancement suggestions
- Supports manual and automated follow-up workflows.
- Provides dashboard analytics for email volume, priorities, and AI usage.

## High-Level Flow

1. User opens frontend and signs in with Google.
2. Frontend calls backend auth endpoints.
3. Backend handles OAuth callback, exchanges code for tokens, encrypts/stores tokens in MongoDB.
4. Frontend uses app JWT from backend for authenticated API calls.
5. User opens inbox/dashboard/compose:
   - backend fetches Gmail data
   - backend runs AI actions when requested
   - backend returns processed results to frontend
6. Follow-up cron jobs run in backend for scheduled workflows.
7. Frontend renders mailbox, AI suggestions, analytics, and follow-up state.

## Request Flow (Typical)

### Inbox Fetch

`Frontend -> /api/gmail/messages -> Backend -> Gmail API -> Backend -> Frontend`

### AI Summary / Reply

`Frontend -> /api/ai/* -> Backend -> Gemini API -> Backend -> Frontend`

### OAuth Login

`Frontend -> /api/auth/url -> Google consent -> /api/auth/google/callback -> Backend user/token save -> Frontend auth callback`

## Project Structure

```text
SmartInbox-AI/
├─ backend/
│  ├─ src/
│  │  ├─ config/          # env/db setup
│  │  ├─ controllers/     # route handlers
│  │  ├─ cron/            # scheduled jobs (sync, follow-ups)
│  │  ├─ middlewares/     # auth, validation, rate limit
│  │  ├─ models/          # MongoDB models
│  │  ├─ routes/          # API route definitions
│  │  ├─ services/        # Gmail, AI, calendar, rules logic
│  │  ├─ utils/           # logger, encryption, error handling
│  │  └─ server.ts        # app bootstrap
│  ├─ package.json
│  └─ tsconfig.json
│
├─ frontend/
│  ├─ app/                # Next.js App Router pages
│  ├─ components/         # UI + feature components
│  ├─ lib/                # axios and utility helpers
│  ├─ store/              # Zustand state management
│  ├─ package.json
│  └─ tailwind config files
│
└─ README.md
```

## Backend Modules (Quick Map)

- `controllers/`
  - `auth.controller.ts`: OAuth flow, callback, JWT response
  - `gmail.controller.ts`: fetch/read/reply/archive/star endpoints
  - `ai.controller.ts`: summarize/reply/rewrite/follow-up generation
  - `analytics.controller.ts`: dashboard stats
  - `followup.controller.ts`: follow-up scheduling/status update
- `services/`
  - `gmail.service.ts`: Gmail API integration
  - `ai.service.ts`: Gemini integration
  - `calendar.service.ts`: calendar integrations
  - `ruleEngine.ts`: classification/automation logic

## Frontend Modules (Quick Map)

- `app/`
  - `login`: OAuth entry
  - `auth/callback`: token handling and session initialization
  - `inbox`: mailbox and AI actions
  - `compose`: message drafting with AI enhancement
  - `dashboard`: analytics and quick actions
  - `dashboard/followups`: follow-up management
  - `settings`: user preferences/signature/tone
- `components/inbox/`: sidebar, list, viewer, reply box, AI actions
- `components/dashboard/`: stats cards and charts
- `components/ui/`: shared design-system components

## Local Development

### 1) Install dependencies

- Backend: `cd backend && npm install`
- Frontend: `cd frontend && npm install`

### 2) Configure backend env

Create `backend/.env` with:

- Google OAuth credentials (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`)
- `GEMINI_API_KEY`
- `MONGO_URI`
- `JWT_SECRET`, `ENCRYPTION_KEY`, `ENCRYPTION_IV`
- `FRONTEND_URL=http://localhost:3000`
- `PORT=5000`

### 3) Enable required Google APIs

In the same Google Cloud project as your OAuth client:

- Gmail API
- Google Calendar API
- Google People API

### 4) Run apps

- Backend: `cd backend && npm run dev`
- Frontend: `cd frontend && npm run dev`

## Notes

- If login works but inbox fetch fails with Gmail API disabled, the OAuth client is likely from a different Google Cloud project than the one where Gmail API was enabled.
- Backend starts even if MongoDB is unavailable, but auth/token persistence and login flows will fail until DB connects.
