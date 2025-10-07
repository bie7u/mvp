# Project Structure

```
mvp/
│
├── README.md                           # Main project documentation
├── QUICKSTART.md                       # Quick setup guide
├── API_DOCS.md                         # API endpoint documentation
├── IMPLEMENTATION.md                   # Feature implementation status
├── DEPLOYMENT.md                       # Production deployment guide
├── CONTRIBUTING.md                     # Developer contribution guide
├── .env.example                        # Environment variables template
├── .gitignore                         # Git ignore patterns
├── docker-compose.yml                 # Docker services configuration
│
├── backend/                           # Django Backend
│   ├── Dockerfile                     # Backend container configuration
│   ├── entrypoint.sh                  # Startup script with migrations
│   ├── requirements.txt               # Python dependencies
│   ├── manage.py                      # Django management script
│   │
│   ├── config/                        # Django project configuration
│   │   ├── __init__.py
│   │   ├── settings.py               # Django settings
│   │   ├── urls.py                   # Main URL configuration
│   │   ├── wsgi.py                   # WSGI configuration
│   │   ├── asgi.py                   # ASGI configuration
│   │   └── celery.py                 # Celery configuration
│   │
│   ├── accounts/                      # User management app
│   │   ├── models.py                 # Custom User model
│   │   ├── serializers.py            # User serializers
│   │   ├── views.py                  # User views & authentication
│   │   ├── urls.py                   # User endpoints
│   │   ├── admin.py                  # User admin interface
│   │   ├── permissions.py            # Custom permissions
│   │   └── management/
│   │       └── commands/
│   │           └── init_system.py    # System initialization command
│   │
│   ├── companies/                     # Company management app
│   │   ├── models.py                 # Company & CompanyLeague models
│   │   ├── serializers.py            # Company serializers
│   │   ├── views.py                  # Company views
│   │   ├── urls.py                   # Company endpoints
│   │   └── admin.py                  # Company admin interface
│   │
│   ├── matches/                       # Match data app
│   │   ├── models.py                 # League, Team, Match models
│   │   ├── serializers.py            # Match serializers
│   │   ├── views.py                  # Match views
│   │   ├── urls.py                   # Match endpoints
│   │   ├── admin.py                  # Match admin interface
│   │   └── tasks.py                  # Celery tasks for API sync
│   │
│   └── predictions/                   # Predictions & Rankings app
│       ├── models.py                 # Prediction & Ranking models
│       ├── serializers.py            # Prediction serializers
│       ├── views.py                  # Prediction & ranking views
│       ├── urls.py                   # Prediction endpoints
│       ├── admin.py                  # Prediction admin interface
│       └── tasks.py                  # Celery tasks for point calculation
│
└── frontend/                          # React Frontend
    ├── Dockerfile                     # Frontend container configuration
    ├── package.json                   # NPM dependencies
    ├── vite.config.js                # Vite configuration
    ├── tailwind.config.js            # Tailwind CSS configuration
    ├── postcss.config.js             # PostCSS configuration
    ├── .env.example                  # Frontend environment template
    ├── index.html                    # HTML entry point
    │
    └── src/                          # Source code
        ├── main.jsx                  # Application entry point
        ├── App.jsx                   # Main App component
        ├── index.css                 # Global styles with Tailwind
        │
        ├── components/               # Reusable components
        │   └── Layout.jsx           # Main layout with navigation
        │
        ├── pages/                    # Page components
        │   ├── Dashboard.jsx         # User dashboard
        │   ├── Predictions.jsx       # Predictions page
        │   ├── Rankings.jsx          # Rankings leaderboard
        │   ├── Profile.jsx           # User profile
        │   ├── auth/                 # Authentication pages
        │   │   ├── Login.jsx
        │   │   ├── Register.jsx
        │   │   ├── ForgotPassword.jsx
        │   │   └── ResetPassword.jsx
        │   └── admin/                # Admin pages
        │       ├── AdminDashboard.jsx
        │       ├── CompanyManagement.jsx
        │       ├── UserManagement.jsx
        │       └── LeagueManagement.jsx
        │
        ├── services/                 # API services
        │   └── api.js               # Axios instance with interceptors
        │
        └── store/                    # State management
            └── authStore.js         # Authentication state (Zustand)
```

## Key Files Overview

### Configuration Files

- **docker-compose.yml**: Orchestrates all services (PostgreSQL, Redis, Django, Celery, React)
- **.env.example**: Template for environment variables (API keys, database credentials)
- **requirements.txt**: Python packages for backend
- **package.json**: Node packages for frontend

### Backend Structure

- **config/**: Django project settings and configuration
- **accounts/**: User authentication, roles, invitations
- **companies/**: Company management and scoring rules
- **matches/**: League, team, and match data management
- **predictions/**: Predictions and rankings logic

### Frontend Structure

- **src/main.jsx**: Entry point with providers
- **src/App.jsx**: Routing configuration
- **src/components/**: Reusable UI components
- **src/pages/**: Page-level components
- **src/services/**: API integration
- **src/store/**: Global state management

### Documentation Files

- **README.md**: Complete project overview and architecture
- **QUICKSTART.md**: Step-by-step setup guide
- **API_DOCS.md**: Comprehensive API documentation
- **IMPLEMENTATION.md**: Feature implementation checklist
- **DEPLOYMENT.md**: Production deployment guide
- **CONTRIBUTING.md**: Developer contribution guidelines

## Important Scripts

### Backend Management Commands

```bash
# Initialize system with sample data
docker-compose exec backend python manage.py init_system

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Run migrations
docker-compose exec backend python manage.py migrate

# Collect static files
docker-compose exec backend python manage.py collectstatic
```

### Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild services
docker-compose up --build
```

## Service Ports

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Django Admin**: http://localhost:8000/admin
- **API Docs**: http://localhost:8000/api/docs
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Database Models

### User-related
- **User**: Custom user model with roles
- **Company**: Organization with scoring config
- **CompanyLeague**: Company-league associations

### Football-related
- **League**: Football leagues (Top 5 + Ekstraklasa)
- **Team**: Football teams
- **Match**: Match fixtures and results

### Prediction-related
- **Prediction**: User predictions
- **Ranking**: User rankings per period

## Background Tasks (Celery)

### Scheduled Tasks
- **update_match_data**: Every 5 minutes - Syncs with API-Football
- **update_rankings**: Every hour - Recalculates rankings

### On-Demand Tasks
- **calculate_prediction_points**: When matches finish
- **update_company_rankings**: After point calculation
- **fetch_leagues**: Manual league data fetch

## External Dependencies

- **API-Football**: Match data provider
- **SMTP Server**: Email notifications
- **PostgreSQL**: Database
- **Redis**: Message broker for Celery

## Environment Variables

### Required
- `API_FOOTBALL_KEY`: API key from api-football.com

### Optional (with defaults)
- `DEBUG`: Debug mode (default: True)
- `SECRET_KEY`: Django secret key
- `EMAIL_HOST_USER`: SMTP username
- `EMAIL_HOST_PASSWORD`: SMTP password
- `POSTGRES_*`: Database credentials

## Next Steps

1. See **QUICKSTART.md** for setup instructions
2. Review **API_DOCS.md** for API endpoints
3. Check **IMPLEMENTATION.md** for feature status
4. Read **DEPLOYMENT.md** before going to production
5. Consult **CONTRIBUTING.md** for development guidelines
