# Quick Start Guide

Get the Football Match Prediction Platform up and running in minutes!

## Prerequisites

- Docker Desktop installed and running
- API-Football API key (get free key at https://www.api-football.com/)
- 4GB RAM minimum
- 10GB disk space

## Installation

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/bie7u/mvp.git
cd mvp

# Run the setup script
chmod +x setup.sh
./setup.sh
```

The script will:
- Build Docker containers
- Start all services
- Run database migrations
- Seed initial data
- Create test accounts

### Option 2: Manual Setup

```bash
# Clone the repository
git clone https://github.com/bie7u/mvp.git
cd mvp

# Copy environment file
cp backend/.env.example backend/.env

# Edit .env and add your API-Football key
nano backend/.env

# Build and start containers
docker-compose up --build -d

# Run migrations
docker-compose exec backend python manage.py migrate

# Create static files
docker-compose exec backend python manage.py collectstatic --noinput

# Seed database
docker-compose exec backend python manage.py seed_data
```

## Access the Application

Once setup is complete:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin

## Test Accounts

### Root Administrator
- **Username**: `admin`
- **Password**: `admin123`
- **Access**: Full platform control

### Company Administrator
- **Username**: `client_admin`
- **Password**: `client123`
- **Access**: Manage employees, view rankings

### Employees
- **Username**: `employee1`, `employee2`, `employee3`
- **Password**: `employee123`
- **Access**: Make predictions, view rankings

## First Steps

### 1. Update API-Football Key

```bash
# Edit the .env file
nano backend/.env

# Update this line with your actual key
API_FOOTBALL_KEY=your-actual-api-key-here
```

### 2. Fetch Match Data

```bash
# Fetch upcoming matches and results
docker-compose exec backend python manage.py fetch_match_data
```

This command will:
- Fetch fixtures for all active leagues
- Update results for finished matches
- Recalculate predictions and rankings

### 3. Login and Explore

1. Go to http://localhost:3000
2. Login with any test account
3. Explore the features:
   - Make predictions
   - View rankings
   - Manage your profile

### 4. Admin Setup (Root Admin)

As the root admin:

1. Login at http://localhost:3000 with `admin/admin123`
2. Navigate to the Admin Panel
3. Create your first company
4. Assign leagues to the company
5. Configure scoring rules
6. Invite employees

## Common Tasks

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Stop the Application

```bash
docker-compose down
```

### Restart a Service

```bash
docker-compose restart backend
docker-compose restart frontend
```

### Access Django Shell

```bash
docker-compose exec backend python manage.py shell
```

### Run Tests

```bash
# Backend tests
docker-compose exec backend pytest

# Frontend tests
cd frontend && npm test
```

### Create Superuser

```bash
docker-compose exec backend python manage.py createsuperuser
```

### Reset Database

```bash
# Stop containers
docker-compose down

# Remove database volume
docker volume rm mvp_postgres_data

# Start and setup again
docker-compose up -d
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py seed_data
```

## Production Deployment

For production deployment:

```bash
# Update environment variables in backend/.env
DEBUG=False
ALLOWED_HOSTS=yourdomain.com
SECRET_KEY=generate-a-new-secret-key

# Use production docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

See [Deployment Guide](DEPLOYMENT.md) for detailed production setup.

## Troubleshooting

### Port Already in Use

If ports 3000 or 8000 are already in use:

```bash
# Stop other services using these ports
# Or change ports in docker-compose.yml
```

### Database Connection Error

```bash
# Ensure PostgreSQL is running
docker-compose ps

# Restart database
docker-compose restart db
```

### Frontend Can't Connect to Backend

Check CORS settings in `backend/config/settings.py`:
```python
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
```

### Migrations Not Applied

```bash
docker-compose exec backend python manage.py migrate
```

## Development Workflow

### Making Code Changes

Backend changes are live reloaded with volume mounts.
Frontend changes require:

```bash
cd frontend
npm start  # Development mode with hot reload
```

### Adding New Dependencies

Backend:
```bash
# Add to backend/requirements.txt
docker-compose build backend
docker-compose up -d backend
```

Frontend:
```bash
cd frontend
npm install package-name
```

## Next Steps

- Read the [README.md](README.md) for full documentation
- Check [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
- Review [API.md](API.md) for API documentation
- Join our community (if available)

## Support

- **Issues**: https://github.com/bie7u/mvp/issues
- **Discussions**: https://github.com/bie7u/mvp/discussions
- **Email**: support@footballpredictions.com

## License

MIT License - see [LICENSE](LICENSE) file for details.
