# Football Match Predictions MVP - SaaS Application

A full-stack SaaS application for football match predictions with admin panel, client management, and gamification features.

## 🚀 Features

### Admin Panel
- 🔐 Secure JWT authentication for administrators
- 👥 Manage clients (create, edit, delete organizations)
- 🏢 Manage users for each client
- ⚽ Manage matches (add, update results)
- 📊 View global statistics and rankings
- 🎨 Allow clients to customize branding (logo, colors)

### Client Panel
- 📱 Mobile-first responsive design
- 🎯 Dashboard with upcoming matches
- 🔮 Make predictions on match results
- 🏆 Client-specific rankings and leaderboards
- 🎨 Customize branding (logo, theme colors)
- 📈 Track prediction accuracy and points

### Gamification
- ⭐ Points system for correct predictions:
  - 10 points for exact score match
  - 5 points for correct goal difference
  - 3 points for correct match outcome
- 🏅 Individual and team rankings
- 🎖️ Achievement badges (future feature)

## 🛠️ Tech Stack

### Backend
- **Django 5.2.7** - Python web framework
- **Django REST Framework** - REST API
- **djangorestframework-simplejwt** - JWT authentication
- **django-cors-headers** - CORS support
- **PostgreSQL** - Database (SQLite for development)
- **python-decouple** - Environment configuration

### Frontend
- **React.js** - UI library
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client

## 📁 Project Structure

```
mvp/
├── backend/                 # Django backend
│   ├── config/             # Django project settings
│   ├── core/               # Main application
│   │   ├── models.py       # Database models
│   │   ├── serializers.py  # DRF serializers
│   │   ├── views.py        # API views
│   │   ├── urls.py         # URL routing
│   │   └── admin.py        # Admin configuration
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/               # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── admin/      # Admin panel components
│   │   │   ├── client/     # Client panel components
│   │   │   └── common/     # Shared components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   └── App.js          # Main application
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Python 3.8+ 
- Node.js 16+
- npm or yarn
- PostgreSQL (optional, SQLite used for development)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file from example:
```bash
cp .env.example .env
```

5. Run migrations:
```bash
python manage.py migrate
```

6. Create a superuser (admin):
```bash
python manage.py createsuperuser
```

7. Start the development server:
```bash
python manage.py runserver
```

The backend API will be available at `http://localhost:8000/`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000/`

## 📋 API Endpoints

### Authentication
- `POST /api/auth/login/` - Login and get JWT tokens
- `POST /api/auth/refresh/` - Refresh access token

### Users
- `GET /api/users/` - List users
- `POST /api/users/` - Create user (admin only)
- `GET /api/users/me/` - Get current user info
- `PATCH /api/users/{id}/` - Update user (admin only)
- `DELETE /api/users/{id}/` - Delete user (admin only)

### Clients
- `GET /api/clients/` - List clients
- `POST /api/clients/` - Create client (admin only)
- `GET /api/clients/{id}/` - Get client details
- `PATCH /api/clients/{id}/` - Update client
- `DELETE /api/clients/{id}/` - Delete client (admin only)
- `GET /api/clients/{id}/users/` - Get client users
- `GET /api/clients/{id}/statistics/` - Get client statistics

### Matches
- `GET /api/matches/` - List matches
- `POST /api/matches/` - Create match (admin only)
- `GET /api/matches/upcoming/` - Get upcoming matches
- `GET /api/matches/recent/` - Get recent finished matches
- `POST /api/matches/{id}/update_result/` - Update match result (admin only)

### Bets (Predictions)
- `GET /api/bets/` - List bets
- `POST /api/bets/` - Create bet
- `GET /api/bets/my_bets/` - Get current user's bets
- `GET /api/bets/pending/` - Get pending bets

### Leaderboard
- `GET /api/leaderboard/global_ranking/` - Global rankings
- `GET /api/leaderboard/client_ranking/` - Client-specific rankings

### Statistics
- `GET /api/statistics/overview/` - Global statistics overview

## 🎨 Database Models

### User
- Custom user model extending Django's AbstractUser
- Fields: username, email, role (admin/client/user), client, points
- Roles determine access permissions

### Client
- Organization/company entity
- Fields: name, logo, primary_color, secondary_color, is_active
- Can have multiple users

### Match
- Football match information
- Fields: home_team, away_team, match_date, status, scores, league
- Supports multiple statuses: scheduled, live, finished

### Bet
- User predictions for matches
- Fields: user, match, predicted_home_score, predicted_away_score, points_earned
- Automatically calculates points when match finishes

### Badge
- Achievement badges for gamification
- Fields: name, description, badge_type, icon, requirement

### Point
- Point history for tracking
- Records all point changes with reasons

## 🎯 Scoring System

- **Exact Score Match**: 10 points
- **Correct Goal Difference**: 5 points
- **Correct Match Outcome** (win/draw/loss): 3 points

## 🔐 Security

- JWT authentication for all API endpoints
- Role-based access control (Admin, Client, User)
- CORS configuration for frontend-backend communication
- Password hashing with Django's built-in system
- No self-registration - users created by administrators

## 🌐 Deployment

### Backend (Render/Heroku/Railway)
1. Set environment variables
2. Configure PostgreSQL database
3. Run migrations
4. Collect static files: `python manage.py collectstatic`
5. Deploy with gunicorn

### Frontend (Vercel)
1. Build the app: `npm run build`
2. Deploy build folder to Vercel
3. Set environment variable for API URL

## 📝 Default Credentials

After running `createsuperuser`, use those credentials to log in.

Example:
- Username: admin
- Password: (the one you set)

## 🎨 Mobile-First Design

The application is designed with a mobile-first approach:
- Responsive layouts using TailwindCSS
- Touch-friendly UI elements
- Optimized for screens from 320px to 1920px
- Grid layouts that adapt to screen size

## 🔄 Future Enhancements

- Sports API integration (API-Football, Sportmonks)
- Real-time match updates with WebSockets
- Push notifications for match starts
- More detailed player prediction features
- Social sharing of predictions
- Email notifications
- Advanced analytics and charts
- Multi-language support

## 📄 License

This project is part of an MVP development task.

## 🤝 Contributing

This is an MVP project. For production use, consider:
- Adding comprehensive tests
- Implementing rate limiting
- Adding caching (Redis)
- Improving error handling
- Adding logging and monitoring
- Setting up CI/CD pipelines

## 📞 Support

For issues or questions, please create an issue in the repository.
