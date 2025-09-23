# Chatbot Project (Django + Next.js)

A character-based chatbot with JWT auth, conversation persistence, and streaming replies. Default persona: "Bronn" with optional knowledge base and style prompts.

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- OpenAI API key (for live responses)

### Backend (Django)

1) Create & activate a virtualenv (optional):
```bash
python3 -m venv .venv && source .venv/bin/activate
```

2) Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

3) Environment variables (create a `.env` file in `backend/`):
```bash
DJANGO_SECRET_KEY=dev-secret
DEBUG=True
CORS_FRONTEND=http://localhost:3000
OPENAI_API_KEY=sk-...
OPENAI_CHAT_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.3
OPENAI_MAX_OUTPUT_TOKENS=1024
GOOGLE_OAUTH_CLIENT_ID=
# Optional persona asset paths (defaults work out of the box)
BRONN_KB_PATH=../chatbot/bronns_kb.jsonl
BRONN_STYLE_PATH=../chatbot/bronns_style.yml
```

4) Run migrations and start server:
```bash
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

The backend exposes JSON APIs under `/api/`.

### Frontend (Next.js)

1) Install dependencies:
```bash
cd frontend
npm install
```

2) Environment variables (optional):
```bash
# Only needed if you bypass the built-in Next.js proxy and call the Django API directly
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000/api
```

3) Start dev server:
```bash
npm run dev
```

Open `http://localhost:3000`.

## Key Features
- JWT auth (register/login/refresh, Google optional)
- Conversations and messages stored server-side (SQLite by default)
- Streaming chat replies (Server-Sent Events style)
- Character-aware prompting with optional KB + style

## API Overview (Backend)
Base path: `/api/`

Auth
- POST `/auth/register` → `{ access, refresh, user }`
- POST `/auth/login` → `{ access, refresh, user }`
- POST `/auth/refresh` (SimpleJWT refresh)
- POST `/auth/google` (requires `GOOGLE_OAUTH_CLIENT_ID`)
- GET  `/me` (requires `Authorization: Bearer <access>`)

Conversations & Messages
- GET `/conversations` → paginated list (owned by requester)
- POST `/conversations` `{ character? }` → create
- GET `/conversations/<uuid>` → details
- PATCH `/conversations/<uuid>` → update (e.g., `title`)
- DELETE `/conversations/<uuid>` → delete
- GET `/conversations/<uuid>/messages?order=asc|desc&page_size=50` → paginated messages
- POST `/conversations/<uuid>/messages/create` `{ content }` → create a user message

Search
- GET `/search?q=...&limit=20` → `{ conversations: [...], messages: [...] }`

Chat Streaming (SSE)
- POST `/chat/stream` `{ conversation_id, prompt, create_user_message }`
  - Emits events: `start`, multiple `token`, and `end`

## Streaming Flow
- Client posts to `/api/chat/stream` with JWT in `Authorization` header.
- Server creates assistant placeholder, then streams tokens from OpenAI.
- Events emitted:
  - `event: start` `data: {"message_id": "<uuid>", "ts": "..."}`
  - `event: token` `data: {"delta": "..."}` (repeats)
  - `event: end` `data: {"ts": "..."}`
- Frontend consumes the stream and appends `delta` into the active assistant bubble.

Note: A Next.js route at `src/app/api/chat/route.ts` can proxy to `/api/chat/stream/` and re-stream to the browser if needed.

## Persona Assets
The backend optionally uses:
- `chatbot/bronns_kb.jsonl`: lightweight knowledge base (JSONL)
- `chatbot/bronns_style.yml`: style/tone and retrieval config

If these files are missing, the backend falls back to a strict in-character system prompt without KB/Style.

## Development Notes
- Default DB is SQLite. For production, switch to Postgres and configure `DATABASES` in `backend/config/settings.py`.
- CORS: Set `CORS_FRONTEND` in backend `.env` to your frontend origin.
- Auth: Frontend stores `access`/`refresh` in `localStorage` and adds `Authorization: Bearer <access>` to requests.
- Rate limiting and abuse protection are not included by default.

## Project Structure
- `backend/` Django project (`/api` endpoints, JWT auth, chat streaming)
- `chatbot/` Persona prompt builder and assets
- `frontend/` Next.js app (chat UI, auth pages, streaming client)
- `notebooks/` Experiments

## Environment Variables Reference

Backend (`backend/.env`):
- `DJANGO_SECRET_KEY`: Django secret key (use a strong unique value in production)
- `DEBUG`: `True`/`False`
- `CORS_FRONTEND`: Frontend origin, e.g. `http://localhost:3000`
- `OPENAI_API_KEY`: Your OpenAI API key
- `OPENAI_CHAT_MODEL`: e.g. `gpt-4o-mini`
- `OPENAI_TEMPERATURE`: e.g. `0.3`
- `OPENAI_MAX_OUTPUT_TOKENS`: e.g. `1024`
- `GOOGLE_OAUTH_CLIENT_ID`: Optional, for Google login
- `BRONN_KB_PATH`: Optional, path to persona KB JSONL
- `BRONN_STYLE_PATH`: Optional, path to persona style YAML

Frontend (`frontend/.env.local`):
- `NEXT_PUBLIC_API_BASE`: Optional. Only required if you call the Django API directly from the browser instead of via the built-in Next proxy at `/api/dj` and `/api/chat`.

## Scripts & Troubleshooting
- If streaming appears stalled, check:
  - `OPENAI_API_KEY` validity and network egress
  - Browser devtools → network response is `text/event-stream`
  - Backend logs for missing persona assets (warnings only)
- Rotate JWT by calling `/api/auth/refresh` as needed.

## License
Proprietary or add your preferred license.
