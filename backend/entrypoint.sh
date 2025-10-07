#!/bin/bash

# Wait for database to be ready
echo "Waiting for database..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "Database is ready!"

# Run migrations
echo "Running migrations..."
python manage.py migrate

# Initialize system with sample data (only in development)
if [ "$INIT_SAMPLE_DATA" = "true" ]; then
  echo "Initializing sample data..."
  python manage.py init_system
fi

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start server
echo "Starting Django server..."
python manage.py runserver 0.0.0.0:8000
