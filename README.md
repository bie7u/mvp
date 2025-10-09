# Football Match Prediction Platform

A full-stack B2B web application for football match predictions. Companies can create private leagues for their employees to predict matches and compete internally.

## 🎯 Features

### Core Functionality
- **Football Coverage**: Premier League, La Liga, Bundesliga, Serie A, Ligue 1, and Polish Ekstraklasa
- **Role-Based Access Control**:
  - Root Admin: Manage companies, leagues, and global settings
  - Client Admin: Manage employees and view company rankings
  - Employee: Make predictions and view rankings
- **Match Predictions**: Users predict match scores before kickoff
- **Automatic Updates**: Match results update via API-Football integration
- **Rankings System**: Company-specific rankings (weekly, monthly, seasonal)
- **Email Notifications**: Invitation emails and prediction reminders
- **Customizable Scoring**: Configurable points per company

### Technical Stack
- **Backend**: Django + Django REST Framework + JWT Authentication
- **Frontend**: React + Tailwind CSS (Mobile-first SPA)
- **Database**: PostgreSQL
- **Deployment**: Docker + docker-compose
- **API Integration**: API-Football for match data
- **Testing**: pytest (backend) + Jest/React Testing Library (frontend)

## 📁 Project Structure

```
mvp/
├── backend/
│   ├── apps/
│   │   ├── users/          # User management and authentication
│   │   ├── companies/      # Company and scoring configuration
│   │   ├── leagues/        # Football leagues
│   │   ├── matches/        # Match data and API integration
│   │   ├── predictions/    # User predictions
│   │   └── rankings/       # Ranking calculations
│   ├── config/             # Django settings and URLs
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── contexts/       # React contexts
│   │   └── utils/          # Utility functions
│   ├── public/
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml

```

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose
- API-Football API key (get from https://www.api-football.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bie7u/mvp.git
   cd mvp
   ```

2. **Configure environment variables**
   ```bash
   cp backend/.env.example backend/.env
   ```
   
   Edit `backend/.env` and add your API-Football key:
   ```
   API_FOOTBALL_KEY=your-api-key-here
   ```

3. **Build and start containers**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Admin Panel: http://localhost:8000/admin

### Initial Setup

1. **Create superuser (Root Admin)**
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

2. **Load initial league data**
   ```bash
   docker-compose exec backend python manage.py shell
   ```
   ```python
   from apps.leagues.models import League
   
   League.objects.create(
       name='premier_league',
       api_football_id=39,
       country='England',
       season='2023-2024',
       is_active=True
   )
   # Add other leagues similarly
   ```

3. **Fetch match data and standings**
   ```bash
   # Fetch all season fixtures and standings
   docker-compose exec backend python manage.py fetch_match_data
   
   # Or fetch specific data:
   # - Fetch only fixtures
   docker-compose exec backend python manage.py fetch_match_data --fetch-fixtures
   
   # - Fetch only standings
   docker-compose exec backend python manage.py fetch_match_data --fetch-standings
   
   # - Update results only
   docker-compose exec backend python manage.py fetch_match_data --update-results
   
   # - Fetch for a specific league
   docker-compose exec backend python manage.py fetch_match_data --league premier_league
   ```

## 🔧 Development

### Backend Development

**Run migrations:**
```bash
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate
```

**Run tests:**
```bash
docker-compose exec backend pytest
```

**Create Django app:**
```bash
docker-compose exec backend python manage.py startapp app_name
```

### Frontend Development

**Install dependencies:**
```bash
cd frontend
npm install
```

**Run development server:**
```bash
npm start
```

**Run tests:**
```bash
npm test
```

**Build for production:**
```bash
npm run build
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login/` - JWT login
- `POST /api/auth/refresh/` - Refresh JWT token

### Users
- `GET /api/users/` - List users
- `POST /api/users/` - Create user (Root Admin only)
- `GET /api/users/profile/` - Get current user profile
- `PATCH /api/users/profile/` - Update profile
- `POST /api/users/change_password/` - Change password
- `POST /api/users/reset_password/` - Request password reset

### Companies
- `GET /api/companies/` - List companies (Root Admin)
- `POST /api/companies/` - Create company (Root Admin)
- `GET /api/companies/{id}/scoring_config/` - Get scoring config
- `PATCH /api/companies/{id}/scoring_config/` - Update scoring config
- `POST /api/companies/{id}/assign_league/` - Assign league to company

### Leagues
- `GET /api/leagues/` - List available leagues
- `POST /api/leagues/` - Create league (Root Admin)

### Matches
- `GET /api/matches/` - List matches (with filters)
- `GET /api/matches/{id}/` - Get match details

### Predictions
- `GET /api/predictions/` - List predictions
- `POST /api/predictions/` - Create prediction
- `PATCH /api/predictions/{id}/` - Update prediction
- `DELETE /api/predictions/{id}/` - Delete prediction

### Rankings
- `GET /api/rankings/` - Get rankings (filtered by period)
- `POST /api/rankings/update_rankings/` - Trigger ranking update

## 🎮 User Roles & Permissions

### Root Admin
- Manage all companies and their settings
- Assign leagues to companies
- Configure scoring rules per company
- View global statistics
- Manage all users

### Client Admin
- Manage employees within their company
- Resend invitations
- View company rankings and statistics
- Cannot modify scoring rules

### Employee
- Make and edit predictions (before match kickoff)
- View rankings
- Edit own profile
- Manage notification preferences

## 🔄 Cron Jobs & Data Management

The application runs a cron job every 5 minutes to:
1. Fetch all season fixtures from API-Football
2. Update results for finished matches
3. Fetch league standings/tables
4. Recalculate prediction points
5. Update rankings

**Manual trigger:**
```bash
docker-compose exec backend python manage.py fetch_match_data

# With specific options:
docker-compose exec backend python manage.py fetch_match_data --fetch-fixtures --fetch-standings
docker-compose exec backend python manage.py fetch_match_data --update-results
docker-compose exec backend python manage.py fetch_match_data --league "premier_league"
```
```bash
docker-compose exec backend python manage.py fetch_match_data
```

## 🧪 Testing

### Backend Tests
```bash
# Run all tests
docker-compose exec backend pytest

# Run with coverage
docker-compose exec backend pytest --cov=.

# Run specific test file
docker-compose exec backend pytest apps/users/tests.py
```

### Frontend Tests
```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run E2E tests (if using Cypress)
npm run cypress:open
```

## 🔐 Security

- JWT-based authentication with token refresh
- Role-based access control (RBAC)
- Password validation and hashing
- CORS configuration for frontend-backend communication
- Environment-based secrets management
- Protected API endpoints

## 📱 Mobile-First Design

The frontend is built with a mobile-first approach using Tailwind CSS:
- Responsive layouts that work on all screen sizes
- Touch-friendly UI elements
- Optimized for mobile performance
- Progressive enhancement for desktop

## 🚢 Deployment

### Production Build

1. **Update environment variables** for production in `backend/.env`

2. **Build and deploy**
   ```bash
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

3. **Collect static files**
   ```bash
   docker-compose exec backend python manage.py collectstatic --noinput
   ```

### Environment Variables

**Backend (.env)**
```
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com
DB_NAME=football_predictions
DB_USER=postgres
DB_PASSWORD=secure-password
API_FOOTBALL_KEY=your-api-key
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your-email
EMAIL_HOST_PASSWORD=your-password
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

For support, email support@footballpredictions.com or open an issue on GitHub.

## 🎉 Acknowledgments

- API-Football for match data
- Django REST Framework
- React and Tailwind CSS communities
