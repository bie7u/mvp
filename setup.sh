#!/bin/bash

# Football Predictions Platform - Setup Script

set -e

echo "🚀 Setting up Football Predictions Platform..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend/.env from example..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please update backend/.env with your API-Football key and other settings"
fi

# Build and start containers
echo "🐳 Building Docker containers..."
docker-compose build

echo "🚢 Starting containers..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run migrations
echo "📦 Running database migrations..."
docker-compose exec -T backend python manage.py migrate

# Create static files directory
echo "📁 Creating static files..."
docker-compose exec -T backend python manage.py collectstatic --noinput

# Seed database with initial data
echo "🌱 Seeding database with initial data..."
docker-compose exec -T backend python manage.py seed_data

echo "✅ Setup completed successfully!"
echo ""
echo "🎉 Application is running at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   Admin Panel: http://localhost:8000/admin"
echo ""
echo "📋 Test Credentials:"
echo "   Root Admin: admin / admin123"
echo "   Client Admin: client_admin / client123"
echo "   Employees: employee1, employee2, employee3 / employee123"
echo ""
echo "💡 Next steps:"
echo "   1. Update backend/.env with your API-Football key"
echo "   2. Run: docker-compose exec backend python manage.py fetch_match_data"
echo "   3. Access the application at http://localhost:3000"
echo ""
echo "📚 View logs: docker-compose logs -f"
echo "🛑 Stop: docker-compose down"
