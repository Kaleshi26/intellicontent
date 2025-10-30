# IntelliContent

AI-powered content generation platform with a premium SaaS UI/UX. Create, manage, and share content across types (blog posts, emails, code, summaries, translations, and more) with analytics, templates, exports, and admin tools.

## Highlights

- 🤖 Multi-model AI generation (configurable; supports OpenAI/Anthropic/local via adapters)
- 📚 Content types and templates, batch generation, prompt optimization
- 🔐 Auth with sessions, email verification, password reset, RBAC
- 📤 Export to PDF/Markdown/JSON/DOCX; public sharing links
- 📊 User and system analytics, usage stats, dashboards
- 🚦 Rate limiting, caching, retry logic, health checks, logging
- 🧰 Admin endpoints, content moderation hooks, webhooks
- 🎨 Modern React UI with MUI, glassmorphism, Framer Motion animations
- ♿ Accessibility, responsive design, keyboard shortcuts, command palette
- 🧪 Unit/integration/E2E testing scaffolding

## Monorepo Layout

```
intellicontent/
  backend/               # FastAPI service
    app/
      main.py            # API routes
      models.py          # SQLAlchemy models
      schemas.py         # Pydantic schemas
      auth.py            # Auth/session/email logic
      ai_service.py      # AI generation + caching + batching
      config.py          # Settings (env)
      database.py        # DB session
    requirements.txt
  frontend/              # React app (MUI + Framer Motion)
    src/
      pages/             # Dashboard/Generate/... pages
      components/        # Layout, Loading, ErrorFallback, CommandPalette
      services/          # Axios API client
      animations/        # Framer presets
      themes/            # MUI theme (light/dark)
  docker-compose.yml
  kubernetes/            # Deploy manifests
  README.md
```

## Quickstart

### 1) Environment

Create a `.env` file for the backend (see variables below). For development defaults, you can export env vars or use a `.env` loader.

Required backend env vars (examples):

```
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/intellicontent
SECRET_KEY=change_me
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
CACHE_TTL=300
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=no-reply@intellicontent.ai
FRONTEND_URL=http://localhost:3000
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000
ALLOWED_ORIGINS=http://localhost:3000
ENVIRONMENT=development
DEBUG=true
API_VERSION=v1
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100
```

Frontend env vars (optional):

```
REACT_APP_API_URL=http://localhost:8000
```

### 2) Run with Docker Compose

```bash
docker-compose up --build
```

Services:
- Backend: http://localhost:8000 (docs at /docs)
- Frontend: http://localhost:3000
- Postgres, Nginx (frontend) per compose

### 3) Run locally (no Docker)

Backend:
```bash
cd backend
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:
```bash
cd frontend
npm install
npm start
```

## Development

### Backend

- Stack: FastAPI, SQLAlchemy, Pydantic
- Entrypoint: `backend/app/main.py`
- Key modules: `auth.py`, `ai_service.py`, `models.py`, `schemas.py`
- Run tests: `pytest` (from `backend/`)

Common commands:
```bash
# Format/lint (suggested tools)
ruff check backend/app && ruff format backend/app
pytest -q
```

### Frontend

- Stack: React, MUI, Framer Motion, React Query, React Router
- Start: `npm start`
- Build: `npm run build`
- Tests: `npm test`

## Features (Details)

- Generation: text/code/summary/email/blog_post/social/marketing/product_description/translation/creative/technical/news/FAQ/tutorial/presentation/proposal/report/analysis
- Parameters: temperature, language, style, tags, metadata
- Batch generation and prompt optimization endpoints
- Content: CRUD, sharing links, export PDF/MD/JSON/DOCX
- Auth: register/login/refresh/logout, email verification, password reset, sessions
- Analytics: user + system, popular prompts, usage charts
- Admin: list users, set roles; health status
- Webhooks and notifications (endpoints scaffolded)

## API

OpenAPI docs at:
- Local: `http://localhost:8000/docs`

Important endpoints (non-exhaustive):
- `POST /register`, `POST /token`, `POST /refresh-token`, `POST /logout`
- `GET /users/me`, `PUT /users/me`, `GET /users/me/sessions`
- `POST /generate`, `POST /generate/batch`, `POST /optimize-prompt`
- `GET /contents`, `GET /contents/{id}`, `PUT /contents/{id}`, `DELETE /contents/{id}`
- `POST /contents/{id}/share`, `GET /shared/{token}`
- `POST /contents/{id}/export?export_type=pdf|markdown|json|docx`
- `GET /analytics/user`, `GET /analytics/system`
- `GET /health`

## Testing

- Backend: `pytest` tests under `backend/tests`
- Frontend: `react-scripts test` and room for Cypress E2E (`frontend/cypress` suggested)

Recommended:
```bash
cd backend && pytest -q
cd ../frontend && npm test
```

## Accessibility & UX

- Keyboard navigation, ARIA labels, focus states
- Reduced motion support; high contrast via theme
- Loading skeletons, spinners, optimistic UI with React Query
- Framer Motion: page transitions, micro-interactions

## Performance

- Backend caching + basic rate limiting
- Frontend code-splitting (React), lazy-loading patterns
- React Query caching, request de-dupe, background refetch

## Deployment

### Docker images
```bash
docker build -t intellicontent-backend ./backend
docker build -t intellicontent-frontend ./frontend
```

### Kubernetes (example)

Manifests under `kubernetes/`:
- `postgres-deployment.yaml`
- `backend-deployment.yaml`
- `frontend-deployment.yaml`
- `services.yaml`

Apply:
```bash
kubectl apply -f kubernetes/
```

## Configuration Reference (Backend)

See `backend/app/config.py` for all settings. Key toggles:
- `ENABLE_ANALYTICS`, `ENABLE_CONTENT_MODERATION`
- `ALLOWED_ORIGINS`
- `UPLOAD_DIR`, `MAX_FILE_SIZE`
- `LOG_LEVEL`, `DEBUG`, `ENVIRONMENT`

## Troubleshooting

- 401s: token expired → ensure refresh flow or re-login
- 429s: rate limited → wait or adjust `RATE_LIMIT_*`
- CORS issues: add your origin to `ALLOWED_ORIGINS`
- SMTP: use a local SMTP server (e.g., MailHog) during dev
- Exports require `reportlab`, `python-docx` available (already in requirements)

## Security Notes

- Use strong `SECRET_KEY` in production
- Serve over HTTPS; secure cookies and proper CORS
- Restrict admin endpoints via RBAC

## License

MIT
