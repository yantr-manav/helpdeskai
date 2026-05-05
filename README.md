# ⚡ HelpdeskAI — FlowTask Support Chatbot

> Production-grade AI support chatbot with **Qdrant RAG**, **Claude (Anthropic)**, **FastAPI**, and **React widget**.  
> Built for the fictional SaaS company **FlowTask** as an agency showcase project.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                     React Widget                          │
│  (embeddable .js · Zustand · SSE streaming)              │
└────────────────────┬─────────────────────────────────────┘
                     │ HTTP / SSE
                     ▼
┌──────────────────────────────────────────────────────────┐
│                  FastAPI Backend                          │
│                                                          │
│  POST /api/v1/chat/stream   ← SSE streaming chat         │
│  POST /api/v1/chat/send     ← Non-streaming chat         │
│  POST /api/v1/ticket/create ← Create support ticket      │
│  GET  /api/v1/admin/*       ← Admin endpoints (JWT)      │
└────────┬───────────────────┬────────────────────────────┘
         │                   │
         ▼                   ▼
┌──────────────┐   ┌──────────────────────────────────────┐
│  Qdrant      │   │  Redis                               │
│  (Docker)    │   │  (Docker)                            │
│              │   │                                      │
│  · Vector DB │   │  · Session history (10 turns)        │
│  · 1536-dim  │   │  · Ticket store                      │
│  · Cosine    │   │  · TTL: 1 hour sessions              │
│  · 10 KB docs│   │                                      │
└──────────────┘   └──────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────┐
│              RAG Pipeline                                │
│                                                          │
│  1. Embed query → OpenAI text-embedding-3-small          │
│  2. Search Qdrant → top 5 chunks (cosine similarity)     │
│  3. Filter by confidence threshold (0.72)                │
│  4. Build prompt: [system+KB] + [history] + [query]      │
│  5. Stream response → Claude Sonnet                      │
│  6. Detect escalation → offer ticket creation            │
└──────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Chat AI | Anthropic Claude Sonnet (`claude-sonnet-4-20250514`) |
| Embeddings | OpenAI `text-embedding-3-small` (1536-dim) |
| Vector DB | **Qdrant** (Docker, cosine similarity) |
| Session Store | **Redis** (Docker, conversation history) |
| Backend | **FastAPI** (Python 3.11, async, SSE streaming) |
| Frontend | **React 18** + Zustand + TypeScript |
| Build | Vite (builds as embeddable IIFE widget) |
| Auth | JWT (admin dashboard) |
| Email | SendGrid (ticket confirmations) |

---

## Quick Start

### Prerequisites

- Docker + Docker Compose
- Python 3.11+
- Node.js 18+
- Anthropic API key
- OpenAI API key (embeddings only)

### 1. Clone and configure

```bash
git clone <your-repo>
cd helpdeskAI

# Copy and fill in your API keys
cp backend/.env.example backend/.env
# Edit backend/.env:
#   ANTHROPIC_API_KEY=sk-ant-...
#   OPENAI_API_KEY=sk-...
```

### 2. Start infrastructure (Qdrant + Redis)

```bash
docker-compose up qdrant redis -d
```

Verify Qdrant is running:
```
http://localhost:6333/dashboard
```

### 3. Set up Python backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Seed the knowledge base

This embeds all 10 FlowTask KB documents into Qdrant:

```bash
cd backend
python scripts/seed_kb.py
```

Expected output:
```
🚀 Starting FlowTask KB seed...
📦 Qdrant: localhost:6333
📚 Collection: flowtask_kb
📄 Processing KB001: Getting Started with FlowTask...
   ✅ 3 chunks embedded and stored
📄 Processing KB002: Billing & Subscriptions...
   ✅ 4 chunks embedded and stored
...
✅ Seeding complete!
   Total chunks: 38
   Qdrant points: 38
```

### 5. Start the backend

```bash
cd backend
uvicorn app.main:app --reload
```

API docs available at: `http://localhost:8000/docs`

### 6. Start the widget (frontend)

```bash
cd widget
npm install
npm run dev
```

Open: `http://localhost:5173`

---

## Running Everything with Docker Compose

### Start all services including backend:

```bash
docker-compose up -d
```

### Seed the KB using Docker:

```bash
docker-compose --profile seed run seed
```

---

## API Reference

### Chat

```http
POST /api/v1/chat/stream
Content-Type: application/json

{
  "session_id": "uuid",
  "message": "How do I invite a team member?",
  "channel": "web"
}
```

Response: Server-Sent Events stream.  
Each event: `data: <text chunk>\n\n`  
Final event: `data: \n\n[META]{"confidence": 0.87, "sources": ["Getting Started"], "should_escalate": false}`

```http
POST /api/v1/chat/send
```
Same body, returns full JSON response (non-streaming).

```http
DELETE /api/v1/chat/session/{session_id}
```
Clears conversation history.

### Tickets

```http
POST /api/v1/ticket/create
{
  "session_id": "uuid",
  "name": "Jane Smith",
  "email": "jane@company.com",
  "issue": "Can't log in",
  "priority": "high",
  "channel": "web"
}
```

### Admin (JWT required)

```http
POST /api/v1/admin/login
{ "email": "admin@flowtask.demo", "password": "changeme123" }
→ { "access_token": "..." }

GET /api/v1/admin/tickets          (Bearer token)
PATCH /api/v1/admin/tickets/{id}   (Bearer token)
GET /api/v1/admin/kb/stats         (Bearer token)
```

### Health

```http
GET /health
→ { "status": "ok", "redis": "connected", "qdrant": { "points_count": 38 } }
```

---

## Embedding the Widget

After `npm run build` in `widget/`:

```html
<!-- Add to any page -->
<script src="https://your-cdn.com/widget.iife.js"></script>
<script>
  HelpdeskAI.init({
    apiUrl: "https://your-api.railway.app"
  });
</script>
```

---

## Environment Variables

See `backend/.env` for full list. Critical ones:

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `OPENAI_API_KEY` | OpenAI key (embeddings only) |
| `QDRANT_HOST` | Qdrant host (default: `localhost`) |
| `QDRANT_PORT` | Qdrant port (default: `6333`) |
| `REDIS_URL` | Redis connection URL |
| `CONFIDENCE_THRESHOLD` | Min similarity score to use a KB chunk (default: `0.72`) |
| `MAX_HISTORY_TURNS` | Conversation turns kept in Redis (default: `10`) |
| `SENDGRID_API_KEY` | For ticket confirmation emails (optional) |
| `JWT_SECRET` | Admin dashboard auth secret |

---

## Project Structure

```
helpdeskAI/
├── docker-compose.yml           # Qdrant + Redis + Backend + Seed
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env                     # API keys (gitignored)
│   ├── app/
│   │   ├── main.py              # FastAPI app + lifespan
│   │   ├── config.py            # Pydantic settings
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic request/response models
│   │   ├── routers/
│   │   │   ├── chat.py          # /chat/send, /chat/stream
│   │   │   ├── ticket.py        # /ticket/create, CRUD
│   │   │   ├── admin.py         # Admin endpoints + JWT auth
│   │   │   └── health.py        # /health, /
│   │   ├── services/
│   │   │   ├── rag_engine.py    # RAG pipeline: embed→search→prompt→stream
│   │   │   ├── qdrant_service.py # Qdrant client wrapper
│   │   │   ├── redis_service.py  # Session history store
│   │   │   └── ticket_service.py # Ticket CRUD + email
│   │   └── utils/
│   │       └── chunker.py       # Text chunking for KB docs
│   ├── docs/
│   │   └── kb/
│   │       └── knowledge_base.py # 10 FlowTask KB documents
│   └── scripts/
│       └── seed_kb.py           # Embed + upsert KB to Qdrant
│
└── widget/
    ├── package.json
    ├── vite.config.ts           # Builds as embeddable IIFE
    ├── index.html               # Dev preview page
    └── src/
        ├── main.tsx             # Entry, HelpdeskAI.init()
        ├── types/index.ts
        ├── store/chatStore.ts   # Zustand state
        ├── hooks/
        │   ├── useChat.ts       # SSE streaming hook
        │   └── useTicket.ts     # Ticket creation state machine
        ├── utils/
        │   ├── streaming.ts     # SSE parser
        │   └── sessionId.ts     # localStorage session UUID
        └── components/
            ├── ChatWidget.tsx   # Main widget UI
            └── TicketForm.tsx   # In-chat ticket form
```

---

## Deployment

### Backend → Railway

```bash
# railway.toml
[build]
builder = "dockerfile"

[deploy]
startCommand = "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
```

Set all env vars in Railway dashboard. Qdrant and Redis can also be provisioned as Railway services.

### Widget → Vercel

```bash
cd widget
npm run build
# Deploy dist/ to Vercel
```

Set `VITE_API_URL` env var to your Railway backend URL.

---

## Knowledge Base

The RAG pipeline is seeded with 10 FlowTask KB documents:

| Doc | Title | Topics |
|-----|-------|--------|
| KB001 | Getting Started | signup, workspace, invite |
| KB002 | Billing & Subscriptions | pricing, upgrade, refunds |
| KB003 | Task & Board Management | tasks, kanban, subtasks |
| KB004 | Integrations Guide | Slack, GitHub, Zapier |
| KB005 | Time Tracking | logging hours, export |
| KB006 | Permissions & Roles | admin, member, guest |
| KB007 | Notifications & Alerts | email, push, quiet hours |
| KB008 | Mobile App FAQ | iOS, Android, offline |
| KB009 | Data & Security | GDPR, 2FA, SSO, export |
| KB010 | Common Errors & Fixes | login, sync, troubleshooting |

To add new documents, add to `backend/docs/kb/knowledge_base.py` and re-run `seed_kb.py`.

---

*Built with FastAPI · Qdrant · Redis · Anthropic Claude · React*
