# Quick Start Guide

This guide will help you get the Football Match Prediction Platform up and running quickly.

## Prerequisites

Before you begin, ensure you have the following installed:
- Docker Desktop (or Docker + Docker Compose)
- Git
- A text editor (VS Code, Sublime, etc.)

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/bie7u/mvp.git
cd mvp
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` file with your preferred text editor and update the following:

**Required:**
- `API_FOOTBALL_KEY`: Get your free API key from https://www.api-football.com/

**Optional (for email functionality):**
- `EMAIL_HOST_USER`: Your SMTP email address
- `EMAIL_HOST_PASSWORD`: Your SMTP password

For development, you can use the default values for other settings.

### 3. Build and Start the Application

```bash
docker-compose up --build
```

This command will:
- Build the Docker images
- Start PostgreSQL database
- Start Redis server
- Start Django backend
- Start React frontend
- Start Celery workers
- Initialize sample data (leagues, companies, users)

**First-time setup may take 5-10 minutes** as it downloads dependencies and builds images.

### 4. Access the Application

Once all services are running, you can access:

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **API Documentation**: http://localhost:8000/api/docs
- **Django Admin Panel**: http://localhost:8000/admin

### 5. Login with Sample Credentials

The system is pre-configured with sample users:

**Root Admin:**
- Email: `admin@footballpredictions.com`
- Password: `admin123`
- Full system access

**Client Admin (Demo Company):**
- Email: `clientadmin@democompany.com`
- Password: `admin123`
- Can manage Demo Company employees

**Employees (Demo Company):**
- Email: `employee1@democompany.com` (also employee2, employee3)
- Password: `employee123`
- Can make predictions and view rankings

## Using the Application

### As Root Admin

1. Login with root admin credentials
2. Navigate to Admin section
3. Create new companies
4. Assign leagues to companies
5. Customize scoring rules per company
6. View global statistics

### As Client Admin

1. Login with client admin credentials
2. Navigate to Admin section
3. Invite new employees
4. Manage company employees
5. View company rankings

### As Employee

1. Login with employee credentials
2. View Dashboard with your stats
3. Go to Predictions to predict match outcomes
4. Check Rankings to see leaderboard
5. Update Profile settings

## Fetching Match Data

To populate the system with real match data from API-Football:

### Method 1: Using Celery (Automatic - Recommended)

The system automatically fetches match data every 5 minutes via Celery Beat.

Just ensure your `API_FOOTBALL_KEY` is set correctly in `.env` and wait for the scheduled task to run.

### Method 2: Manual Fetch

```bash
# Fetch leagues data
docker-compose exec backend python manage.py shell
>>> from matches.tasks import fetch_leagues
>>> fetch_leagues()
>>> exit()

# Fetch match fixtures
docker-compose exec backend python manage.py shell
>>> from matches.tasks import update_match_data
>>> update_match_data()
>>> exit()
```

## Common Tasks

### Create a New Superuser

```bash
docker-compose exec backend python manage.py createsuperuser
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f celery
```

### Stop the Application

```bash
docker-compose down
```

### Stop and Remove All Data

```bash
docker-compose down -v
```

This removes all volumes including the database. Use this to start fresh.

### Restart a Specific Service

```bash
docker-compose restart backend
docker-compose restart frontend
```

### Run Django Management Commands

```bash
# General format
docker-compose exec backend python manage.py <command>

# Examples
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py init_system
docker-compose exec backend python manage.py shell
```

## Development Workflow

### Backend Development

1. Make changes to Python files in `backend/`
2. Django will auto-reload (no restart needed)
3. For model changes:
   ```bash
   docker-compose exec backend python manage.py makemigrations
   docker-compose exec backend python manage.py migrate
   ```

### Frontend Development

1. Make changes to React files in `frontend/src/`
2. Vite will auto-reload in browser
3. No restart needed

### Database Access

```bash
# PostgreSQL shell
docker-compose exec db psql -U postgres -d football_predictions

# Django shell
docker-compose exec backend python manage.py shell
```

## Troubleshooting

### Issue: Port Already in Use

If you see errors about ports 3000, 8000, 5432, or 6379 being in use:

```bash
# Stop conflicting services or change ports in docker-compose.yml
# For example, change "3000:3000" to "3001:3000"
```

### Issue: Database Connection Error

```bash
# Ensure database is healthy
docker-compose ps

# Restart database
docker-compose restart db

# Check database logs
docker-compose logs db
```

### Issue: Frontend Not Loading

```bash
# Rebuild frontend
docker-compose up --build frontend

# Check frontend logs
docker-compose logs frontend
```

### Issue: API Key Not Working

- Verify your API-Football key is correct
- Check API quota at https://www.api-football.com/
- Free tier has limited requests per day

### Reset Everything

```bash
# Stop all services and remove volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Rebuild from scratch
docker-compose up --build
```

## Next Steps

1. **Customize Company Settings**
   - Login as Root Admin
   - Create your actual company
   - Configure scoring rules
   - Assign relevant leagues

2. **Invite Your Team**
   - Login as Client Admin
   - Invite team members via email
   - They'll receive invitation links

3. **Configure API Integration**
   - Set up your API-Football account
   - Configure API key in `.env`
   - Monitor Celery logs for successful data sync

4. **Production Deployment**
   - See README.md for production deployment guide
   - Update environment variables for production
   - Configure HTTPS and domain
   - Set up proper email service

## Support

For issues and questions:
- Check the main README.md
- Review API documentation at http://localhost:8000/api/docs
- Create an issue in the repository

Happy predicting! ⚽
