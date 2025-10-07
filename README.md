# Football Match Prediction Platform

A comprehensive B2B web application for football match predictions with company-based private leagues.

## 🎯 Overview

This platform allows companies to create private leagues where employees can predict football match outcomes and compete with colleagues. The system includes:

- **Football Coverage**: Top 5 European leagues (Premier League, La Liga, Bundesliga, Serie A, Ligue 1) + Polish Ekstraklasa
- **Automatic Match Updates**: Integration with API-Football for real-time match data
- **Role-Based Access Control**: Root Admin, Client Admin, and Employee roles
- **Customizable Scoring**: Companies can configure their own point systems
- **Rankings & Statistics**: Weekly, monthly, and seasonal leaderboards
- **Email Notifications**: Invitation system and prediction reminders

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Django 4.2+ with Django REST Framework
- PostgreSQL database
- JWT authentication (Simple JWT)
- Celery for background tasks
- Redis as message broker
- API-Football integration

**Frontend:**
- React 18 with Vite
- Tailwind CSS for styling
- React Query for state management
- React Router for navigation
- Axios for API calls
- Zustand for global state

**Infrastructure:**
- Docker & Docker Compose
- Celery Beat for scheduled tasks

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose
- API-Football API key (get from https://www.api-football.com/)
- SMTP server credentials for email notifications (optional for development)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bie7u/mvp.git
   cd mvp
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   - `API_FOOTBALL_KEY`: Your API-Football API key
   - `EMAIL_HOST_USER` and `EMAIL_HOST_PASSWORD`: Email credentials
   - `SECRET_KEY`: Django secret key (generate a new one for production)

3. **Build and run with Docker:**
   ```bash
   docker compose up --build
   ```
   
   The application will automatically:
   - Set up the database with all migrations
   - Initialize the backend server
   - Start the frontend development server
   - Start Celery workers for background tasks

4. **Create a superuser (Root Admin):**
   ```bash
   docker compose exec backend python manage.py createsuperuser
   ```

5. **Initialize leagues (optional):**
   ```bash
   docker compose exec backend python manage.py shell
   >>> from matches.tasks import fetch_leagues
   >>> fetch_leagues()
   ```

### Troubleshooting

If you encounter issues, please refer to the [Docker Setup Guide](DOCKER_SETUP.md) for detailed troubleshooting steps.

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **API Documentation**: http://localhost:8000/api/docs
- **Django Admin**: http://localhost:8000/admin

## 📋 Features

### User Roles & Permissions

#### Root Admin
- Manage all companies and employees
- Configure leagues for each company
- Customize scoring systems per company
- View global statistics and usage metrics
- Full system access

#### Client Admin
- Manage employees within their company
- Send and resend invitations
- View company rankings and statistics
- Cannot access other companies' data

#### Employee (User)
- Make match predictions
- Edit profile (photo, nickname, email, password)
- View company rankings
- Manage notification preferences
- See other users' predictions only after matches end

### Core Functionality

#### Match Predictions
- Predict scores for upcoming matches
- Edit predictions until match starts
- Automatic point calculation after match ends
- Predictions hidden from other users until match finishes

#### Scoring System
- Default: 3 points for exact score, 1 point for correct outcome
- Customizable per company by Root Admin
- Automatic point calculation
- Real-time ranking updates

#### Rankings & Statistics
- Filter by time period (week, month, season)
- Company-specific leaderboards
- Personal statistics dashboard
- Accuracy and performance metrics

#### Match Data Management
- Automatic updates every 5 minutes via Celery Beat
- Integration with API-Football
- Support for scheduled, in-play, and finished matches
- Automatic result synchronization

## 🔧 API Endpoints

### Authentication
- `POST /api/token/` - Obtain JWT token
- `POST /api/token/refresh/` - Refresh JWT token
- `POST /api/accounts/register/` - Register via invitation
- `POST /api/accounts/password-reset/` - Request password reset
- `POST /api/accounts/password-reset-confirm/` - Confirm password reset

### Users
- `GET /api/accounts/users/` - List users (filtered by role)
- `POST /api/accounts/users/invite/` - Invite new user
- `GET /api/accounts/users/profile/` - Get current user profile
- `PUT /api/accounts/users/profile/` - Update profile
- `POST /api/accounts/users/change_password/` - Change password

### Companies
- `GET /api/companies/companies/` - List companies
- `POST /api/companies/companies/` - Create company (Root Admin)
- `PUT /api/companies/companies/{id}/scoring/` - Update scoring rules
- `GET /api/companies/companies/{id}/statistics/` - Company statistics

### Matches
- `GET /api/matches/matches/` - List matches (paginated)
- `GET /api/matches/matches/upcoming/` - Upcoming matches
- `GET /api/matches/matches/by_league/` - Matches grouped by league
- `GET /api/matches/leagues/` - List leagues
- `GET /api/matches/teams/` - List teams

### Predictions
- `GET /api/predictions/predictions/` - List predictions
- `POST /api/predictions/predictions/` - Create prediction
- `PUT /api/predictions/predictions/{id}/` - Update prediction
- `GET /api/predictions/predictions/my_predictions/` - User's predictions
- `POST /api/predictions/predictions/bulk_create/` - Create multiple predictions

### Rankings
- `GET /api/predictions/rankings/` - List rankings
- `GET /api/predictions/rankings/current_season/` - Current season rankings
- `GET /api/predictions/rankings/current_month/` - Current month rankings
- `GET /api/predictions/rankings/current_week/` - Current week rankings
- `GET /api/predictions/rankings/my_stats/` - User statistics

## 🔄 Background Tasks

### Celery Tasks

1. **Match Data Update** (Every 5 minutes)
   - Fetches latest fixtures from API-Football
   - Updates match scores and statuses
   - Triggers point calculation for finished matches

2. **Rankings Update** (Hourly)
   - Recalculates company rankings
   - Updates weekly, monthly, and seasonal leaderboards
   - Maintains rank positions

3. **Point Calculation** (On-demand)
   - Calculates points when matches finish
   - Applies company-specific scoring rules
   - Updates user predictions

## 📧 Email Notifications

- **User Invitation**: Sent when a new user is invited
- **Password Reset**: Sent upon password reset request
- **Invitation Resend**: Sent when admin resends invitation

Users can toggle email notifications in their profile settings.

## 🗄️ Database Schema

### Main Models

- **User**: Custom user model with role-based access
- **Company**: Company/organization details and scoring configuration
- **CompanyLeague**: Association between companies and leagues
- **League**: Football league information
- **Team**: Football team data
- **Match**: Match details and results
- **Prediction**: User predictions for matches
- **Ranking**: User rankings per period

## 🛡️ Security

- JWT-based authentication
- Role-based access control (RBAC)
- CORS configuration for frontend
- Environment-based configuration
- Secure password validation
- Token refresh mechanism

## 🐛 Development

### Running Tests

```bash
# Backend tests
docker-compose exec backend python manage.py test

# Frontend tests (when implemented)
docker-compose exec frontend npm test
```

### Code Quality

```bash
# Backend linting
docker-compose exec backend flake8

# Frontend linting
docker-compose exec frontend npm run lint
```

### Database Management

```bash
# Create migrations
docker-compose exec backend python manage.py makemigrations

# Apply migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

## 📦 Deployment

### Production Considerations

1. **Environment Variables**:
   - Set `DEBUG=False`
   - Use strong `SECRET_KEY`
   - Configure production database credentials
   - Set proper `ALLOWED_HOSTS`

2. **Static Files**:
   ```bash
   docker-compose exec backend python manage.py collectstatic
   ```

3. **HTTPS**: Configure SSL/TLS certificates

4. **Database**: Use managed PostgreSQL service

5. **Email**: Configure production SMTP settings

6. **API Keys**: Secure API-Football key

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is proprietary software.

## 🆘 Support

For issues and questions:
- Create an issue in the repository
- Contact the development team

## 🔮 Future Enhancements

- Mobile application
- Push notifications
- Social features (comments, discussions)
- Advanced analytics and insights
- Multi-language support
- CSV/PDF export functionality
- Historical ranking archives
