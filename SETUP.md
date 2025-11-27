# How to Run IntelliContent

This guide provides step-by-step instructions to run the IntelliContent project.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker & Docker Compose** (recommended) OR
- **Node.js 18+** and **Python 3.11+** (for local development)
- **PostgreSQL 15+** (if running locally without Docker)
- **Redis** (if running locally without Docker)
- **Git**

## Method 1: Docker Compose (Recommended - Easiest)

This is the simplest way to run the entire project.

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd intellicontent
```

### Step 2: Set Up Environment Variables

Create a `.env` file in the root directory (optional, Docker Compose has defaults):

```bash
# .env
OPENAI_API_KEY=your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here  # Optional
SECRET_KEY=your-secret-key-change-in-production
```

**Note:** For basic testing, you can skip API keys, but content generation won't work without at least one AI service configured.

### Step 3: Run with Docker Compose

```bash
docker-compose up --build
```

This will:
- Build the backend and frontend Docker images
- Start PostgreSQL database
- Start Redis cache
- Start the backend API server
- Start the frontend web server

### Step 4: Access the Application

Once all services are running, you can access:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### Step 5: Stop the Services

To stop all services:

```bash
docker-compose down
```

To stop and remove all data (including database):

```bash
docker-compose down -v
```

---

## Method 2: Local Development (Without Docker)

This method is better for active development and debugging.

### Backend Setup

#### Step 1: Navigate to Backend Directory

```bash
cd backend
```

#### Step 2: Create Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

#### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

#### Step 4: Set Up Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# backend/.env
DATABASE_URL=postgresql://postgres:password@localhost:5432/intellicontent
SECRET_KEY=your-secret-key-change-in-production
OPENAI_API_KEY=your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@intellicontent.com
```

#### Step 5: Set Up Database

Make sure PostgreSQL is running, then create the database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE intellicontent;

# Exit
\q
```

#### Step 6: Initialize Database Tables

The tables will be created automatically when you start the server, or you can run:

```bash
python -c "from app.database import engine, Base; Base.metadata.create_all(bind=engine)"
```

#### Step 7: Start Redis

**Windows:**
Download and run Redis from: https://github.com/microsoftarchive/redis/releases

**Linux:**
```bash
sudo apt-get install redis-server
redis-server
```

**Mac:**
```bash
brew install redis
brew services start redis
```

#### Step 8: Run the Backend Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at: http://localhost:8000

---

### Frontend Setup

#### Step 1: Navigate to Frontend Directory

Open a new terminal window:

```bash
cd frontend
```

#### Step 2: Install Dependencies

```bash
npm install
```

#### Step 3: Set Up Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
# frontend/.env
REACT_APP_API_URL=http://localhost:8000
```

#### Step 4: Start the Frontend Development Server

```bash
npm start
```

The frontend will automatically open at: http://localhost:3000

---

## First-Time Setup

### 1. Create Your First User

1. Go to http://localhost:3000/register
2. Fill in the registration form
3. You'll receive a verification email (if SMTP is configured)

**Note:** If SMTP is not configured, you may need to manually verify the email or skip verification in development.

### 2. Access the Dashboard

1. Log in at http://localhost:3000/login
2. You'll be redirected to the dashboard
3. Start generating content!

---

## Troubleshooting

### Backend Issues

**Problem: Database connection error**
```bash
# Check if PostgreSQL is running
# Windows: Check Services
# Linux/Mac: sudo systemctl status postgresql

# Verify connection string in .env file
```

**Problem: Redis connection error**
```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG
```

**Problem: Module not found**
```bash
# Make sure virtual environment is activated
# Reinstall dependencies
pip install -r requirements.txt
```

**Problem: Port 8000 already in use**
```bash
# Change port in uvicorn command
uvicorn app.main:app --reload --port 8001
# Update FRONTEND_URL in backend/.env
```

### Frontend Issues

**Problem: npm install fails**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Problem: API connection error**
```bash
# Check REACT_APP_API_URL in frontend/.env
# Make sure backend is running
# Check CORS settings in backend
```

**Problem: Port 3000 already in use**
```bash
# React will ask to use a different port
# Or set PORT environment variable
PORT=3001 npm start
```

### Docker Issues

**Problem: Docker build fails**
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

**Problem: Services won't start**
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Restart services
docker-compose restart
```

**Problem: Database connection in Docker**
```bash
# Make sure postgres service is running
docker-compose ps

# Check database URL matches docker-compose.yml
```

---

## Development Tips

### Hot Reload

- **Backend**: Uses `--reload` flag, changes are automatically detected
- **Frontend**: React has hot reload enabled by default

### API Testing

- Use the interactive API docs at http://localhost:8000/docs
- Or use tools like Postman or Insomnia

### Database Management

**View database:**
```bash
# Docker
docker-compose exec postgres psql -U postgres -d intellicontent

# Local
psql -U postgres -d intellicontent
```

**Reset database:**
```bash
# Docker
docker-compose down -v
docker-compose up -d postgres
# Tables will be recreated on backend startup

# Local
psql -U postgres -c "DROP DATABASE intellicontent;"
psql -U postgres -c "CREATE DATABASE intellicontent;"
```

### Logs

**Docker logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Local logs:**
- Backend logs appear in the terminal running uvicorn
- Frontend logs appear in the browser console and terminal

---

## Production Deployment

For production deployment, refer to the Kubernetes manifests in the `kubernetes/` directory or use a cloud platform like:

- **Heroku**
- **Railway**
- **Render**
- **AWS ECS/Fargate**
- **Google Cloud Run**
- **Azure Container Instances**

Make sure to:
1. Set strong `SECRET_KEY`
2. Configure proper `DATABASE_URL`
3. Set up HTTPS
4. Configure proper CORS origins
5. Set up email service (SMTP)
6. Enable production logging
7. Set up monitoring and alerts

---

## Quick Reference

### Common Commands

```bash
# Docker
docker-compose up -d              # Start in background
docker-compose down              # Stop services
docker-compose logs -f backend   # View backend logs
docker-compose restart backend   # Restart backend

# Backend (Local)
cd backend
source venv/bin/activate         # Activate virtual environment
uvicorn app.main:app --reload    # Start server
pytest                           # Run tests

# Frontend (Local)
cd frontend
npm start                        # Start dev server
npm run build                    # Build for production
npm test                         # Run tests
```

### Important URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

---

## Need Help?

If you encounter issues:

1. Check the logs (see above)
2. Verify all environment variables are set
3. Ensure all services are running
4. Check the README.md for more details
5. Review the API documentation at /docs

Happy coding! 🚀

