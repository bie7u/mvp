# Football Match Predictions MVP - SaaS Application

A full-stack SaaS application for football match predictions with admin panel, client management, and gamification features.

![Login Page](https://github.com/user-attachments/assets/16e905d2-fe8d-4c74-bd27-b2d5fdd4c251)

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

### Quick Setup (Recommended)

#### Linux/Mac:
```bash
chmod +x setup.sh
./setup.sh
```

#### Windows:
```cmd
setup.bat
```

The setup script will:
- Install all dependencies
- Create database and run migrations
- Create an admin user
- Populate sample data
- Set up environment files

### Manual Setup

If you prefer to set up manually, follow these steps:

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

## 🔑 Accessing the Admin Panel

There are **TWO** admin interfaces available:

### 1. React Admin Dashboard (Recommended for daily use)

The modern React-based admin interface with full client management capabilities:

1. **Access URL**: `http://localhost:3000/`
2. **Login with**:
   - Username: `admin`
   - Password: `admin123`
3. **Features**:
   - ✅ Manage Clients (Add, Edit, Delete)
   - ✅ Manage Users (Add, Edit, Delete)
   - ✅ Manage Matches (Add, Update Results)
   - ✅ View Global Leaderboard
   - ✅ View All Bets
   - ✅ Statistics Dashboard

![Root Admin Dashboard](https://github.com/user-attachments/assets/80fea2f5-b799-4879-b09b-b77b96572c03)

#### How to Add a Client:

1. Login at `http://localhost:3000/` with admin credentials
2. You'll see the "Root Admin Dashboard" with statistics
3. Click on "Manage Clients" card (with 🏢 icon)
4. Click the "+ Add Client" button in the top right
5. Fill in the form:
   - Client Name (required)
   - Logo URL (optional)
   - Primary Color (color picker)
   - Secondary Color (color picker)
6. Click "Create Client"

![Manage Clients Page](https://github.com/user-attachments/assets/2f85daaa-f5c5-4b10-bb19-b5231ad82127)

![Add Client Form](https://github.com/user-attachments/assets/eb9edbe3-ed0a-472e-bd16-eb17ff8441f4)

### 2. Django Admin Interface (Backend management)

The traditional Django admin for database-level management:

1. **Access URL**: `http://localhost:8000/admin/`
2. **Login with**:
   - Username: `admin`
   - Password: `admin123`
3. **Features**:
   - ✅ Full database access
   - ✅ Manage all models (Users, Clients, Matches, Bets, Badges, etc.)
   - ✅ Bulk actions
   - ✅ Advanced filtering and search

![Django Admin Interface](https://github.com/user-attachments/assets/87f7346f-083a-45f7-af9d-cbb802b484f7)

## 📝 User Roles

### Root Admin (`root_admin`)
- ✅ Manage all clients
- ✅ Manage all users
- ✅ Manage all matches
- ✅ View global statistics
- ✅ Access both React and Django admin panels
- ❌ Cannot make predictions (admin role)

### Client Admin (`client_admin`)
- ✅ Manage users within their client
- ✅ Make predictions
- ✅ View client-specific leaderboard
- ❌ Cannot manage other clients

### User (`user`)
- ✅ Make predictions
- ✅ View leaderboard
- ❌ Cannot manage users or clients

## 📸 Screenshots

### Login Page
![Login Page](https://github.com/user-attachments/assets/16e905d2-fe8d-4c74-bd27-b2d5fdd4c251)

### Admin Dashboard
![Admin Dashboard](https://github.com/user-attachments/assets/87630462-9add-45bf-9834-0f3853f6d4cf)

### Manage Clients
![Manage Clients](https://github.com/user-attachments/assets/86910902-562e-485b-8b53-28130a679503)

### Manage Matches
![Manage Matches](https://github.com/user-attachments/assets/6a9c0ad4-63c9-4e13-8bc5-57009024b878)

### User Dashboard
![User Dashboard](https://github.com/user-attachments/assets/701acbf3-05c2-4152-aa5f-58c2aa0bfaf3)

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

## 📞 Troubleshooting

### "I don't see the option to add clients"

**Solution**: Make sure you're logged in as a **root_admin** user:

1. **Check your role**: After logging in to `http://localhost:3000/`, you should see "Root Admin" badge in the top right corner
2. **If you see "Client Admin" or "User"**: You don't have permission to manage clients. Ask a root admin to change your role or use the credentials below.
3. **Use the correct credentials**:
   - Username: `admin`
   - Password: `admin123`
4. **If the admin user doesn't exist**, create it:
   ```bash
   cd backend
   python manage.py shell -c "
   from django.contrib.auth import get_user_model
   User = get_user_model()
   if not User.objects.filter(username='admin').exists():
       admin = User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
       admin.role = 'root_admin'
       admin.save()
       print('Admin user created!')
   "
   ```

### Backend not starting

**Solution**: Make sure you've activated the virtual environment and installed dependencies:
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend not starting

**Solution**: Make sure you've installed dependencies and the .env file exists:
```bash
cd frontend
cp .env.example .env
npm install
npm start
```

### Cannot login - "Failed to load user" error

**Solution**: Make sure both backend and frontend servers are running:
- Backend: `http://localhost:8000/` (check by visiting `http://localhost:8000/api/`)
- Frontend: `http://localhost:3000/`

If the backend is not running, the frontend won't be able to authenticate.

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

After running the setup script or creating the admin user manually, use these credentials to login:

### Root Admin (Full Access)
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `root_admin`
- **Login URL**: `http://localhost:3000/` (React Dashboard) or `http://localhost:8000/admin/` (Django Admin)
- **Permissions**: 
  - ✅ Manage all clients
  - ✅ Manage all users
  - ✅ Manage all matches
  - ✅ View global statistics
  - ❌ Cannot make predictions

### Client Admin (if sample data populated)
- **Username**: `client1`
- **Password**: `client123`
- **Role**: `client_admin`
- **Login URL**: `http://localhost:3000/`
- **Permissions**:
  - ✅ Manage users within their client
  - ✅ Make predictions
  - ❌ Cannot manage clients

### Regular User (if sample data populated)
- **Username**: `user1`, `user2`, `user3`, etc.
- **Password**: `user123`
- **Role**: `user`
- **Login URL**: `http://localhost:3000/`
- **Permissions**:
  - ✅ Make predictions
  - ✅ View leaderboard
  - ❌ Cannot manage anything

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
