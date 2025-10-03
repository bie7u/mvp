@echo off
REM Football Predictions MVP - Quick Setup Script for Windows

echo.
echo 🚀 Setting up Football Predictions MVP...
echo.

REM Backend Setup
echo 📦 Setting up backend...
cd backend

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
)

REM Run migrations
echo Running database migrations...
python manage.py migrate

REM Create superuser
echo Creating admin user...
python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); admin = User.objects.create_superuser('admin', 'admin@example.com', 'admin123') if not User.objects.filter(username='admin').exists() else None; admin.role = 'admin' if admin else None; admin.save() if admin else None; print('Admin user created' if admin else 'Admin already exists')"

REM Populate sample data
echo Populating sample data...
python manage.py populate_data

cd ..

REM Frontend Setup
echo.
echo 📦 Setting up frontend...
cd frontend

REM Install dependencies
echo Installing Node dependencies...
call npm install

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
)

cd ..

echo.
echo ✅ Setup complete!
echo.
echo To start the application:
echo.
echo 1. Start the backend (in one terminal):
echo    cd backend
echo    venv\Scripts\activate
echo    python manage.py runserver
echo.
echo 2. Start the frontend (in another terminal):
echo    cd frontend
echo    npm start
echo.
echo 3. Open http://localhost:3000 in your browser
echo.
echo Login credentials:
echo   Admin: username=admin, password=admin123
echo   Client: username=client1, password=client123
echo   User: username=user1, password=user123
echo.
echo Happy predicting! ⚽
pause
