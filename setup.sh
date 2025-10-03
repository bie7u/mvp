#!/bin/bash

# Football Predictions MVP - Quick Setup Script

echo "🚀 Setting up Football Predictions MVP..."
echo ""

# Backend Setup
echo "📦 Setting up backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
fi

# Run migrations
echo "Running database migrations..."
python manage.py migrate

# Create superuser if it doesn't exist
echo "Creating admin user..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    admin = User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    admin.role = 'admin'
    admin.save()
    print('✅ Admin user created: username=admin, password=admin123')
else:
    print('ℹ️  Admin user already exists')
"

# Populate sample data
echo "Populating sample data..."
python manage.py populate_data

cd ..

# Frontend Setup
echo ""
echo "📦 Setting up frontend..."
cd frontend

# Install dependencies
echo "Installing Node dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
fi

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo ""
echo "1. Start the backend (in one terminal):"
echo "   cd backend"
echo "   source venv/bin/activate  # On Windows: venv\\Scripts\\activate"
echo "   python manage.py runserver"
echo ""
echo "2. Start the frontend (in another terminal):"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Login credentials:"
echo "  Admin: username=admin, password=admin123"
echo "  Client: username=client1, password=client123"
echo "  User: username=user1, password=user123"
echo ""
echo "Happy predicting! ⚽"
