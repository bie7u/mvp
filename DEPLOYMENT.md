# Production Deployment Guide

This guide covers deploying the Football Match Prediction Platform to production.

## Prerequisites

- Server with Docker and Docker Compose installed
- Domain name configured with DNS
- SSL certificate (Let's Encrypt recommended)
- API-Football API key
- SMTP email service credentials
- PostgreSQL database (managed service recommended)

## 1. Server Setup

### Install Docker

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y

# Add user to docker group
sudo usermod -aG docker $USER
```

### Configure Firewall

```bash
# Allow HTTP, HTTPS, and SSH
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 2. Application Setup

### Clone Repository

```bash
git clone https://github.com/bie7u/mvp.git
cd mvp
```

### Configure Environment

Create production `.env` file:

```bash
cp .env.example .env
nano .env
```

**Important Production Settings:**

```env
# Django
DEBUG=False
SECRET_KEY=<generate-strong-secret-key>
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database (use managed PostgreSQL service)
POSTGRES_DB=football_predictions_prod
POSTGRES_USER=prod_user
POSTGRES_PASSWORD=<strong-password>
POSTGRES_HOST=your-db-host.com
POSTGRES_PORT=5432

# API Football
API_FOOTBALL_KEY=<your-api-key>

# Email (use production SMTP)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=<your-sendgrid-api-key>
DEFAULT_FROM_EMAIL=noreply@yourdomain.com

# Redis (use managed Redis service)
CELERY_BROKER_URL=redis://your-redis-host:6379/0
CELERY_RESULT_BACKEND=redis://your-redis-host:6379/0

# Frontend
FRONTEND_URL=https://yourdomain.com
REACT_APP_API_URL=https://yourdomain.com/api

# Security
INIT_SAMPLE_DATA=false
```

### Generate Secret Key

```bash
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

## 3. Production Docker Setup

### Create Production docker-compose.yml

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
    volumes:
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    env_file:
      - .env
    depends_on:
      - redis

  celery:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: celery -A config worker -l info
    env_file:
      - .env
    depends_on:
      - redis

  celery-beat:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: celery -A config beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
    env_file:
      - .env
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    restart: always

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - static_volume:/usr/share/nginx/html/static
      - media_volume:/usr/share/nginx/html/media
      - ./frontend/build:/usr/share/nginx/html
    depends_on:
      - backend

volumes:
  static_volume:
  media_volume:
```

### Update Backend Requirements

Add to `backend/requirements.txt`:

```
gunicorn>=21.2.0
whitenoise>=6.6.0
```

### Create Nginx Configuration

Create `nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    include mime.types;
    default_type application/octet-stream;

    upstream backend {
        server backend:8000;
    }

    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        
        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Security Headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # API
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Host $host;
            proxy_redirect off;
        }

        # Django Admin
        location /admin/ {
            proxy_pass http://backend;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Host $host;
            proxy_redirect off;
        }

        # Static files
        location /static/ {
            alias /usr/share/nginx/html/static/;
            expires 30d;
            add_header Cache-Control "public, immutable";
        }

        # Media files
        location /media/ {
            alias /usr/share/nginx/html/media/;
            expires 30d;
            add_header Cache-Control "public, immutable";
        }

        # React App
        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
            expires 1h;
            add_header Cache-Control "public";
        }
    }
}
```

## 4. SSL Certificate Setup

### Using Let's Encrypt (Recommended)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx -y

# Generate certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Copy certificates
mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/key.pem
```

### Auto-Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Set up cron job
sudo crontab -e

# Add this line for daily check at 2 AM
0 2 * * * certbot renew --quiet --post-hook "docker-compose -f /path/to/mvp/docker-compose.prod.yml restart nginx"
```

## 5. Build Frontend for Production

```bash
# Install dependencies
cd frontend
npm install

# Build production bundle
REACT_APP_API_URL=https://yourdomain.com/api npm run build

# Files will be in frontend/build/
```

## 6. Database Setup

### Using Managed PostgreSQL (Recommended)

1. Create PostgreSQL instance (AWS RDS, DigitalOcean, etc.)
2. Note connection details
3. Update `.env` with database credentials
4. Create database and user:

```sql
CREATE DATABASE football_predictions_prod;
CREATE USER prod_user WITH PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE football_predictions_prod TO prod_user;
```

### Run Migrations

```bash
docker-compose -f docker-compose.prod.yml run --rm backend python manage.py migrate
```

## 7. Collect Static Files

```bash
docker-compose -f docker-compose.prod.yml run --rm backend python manage.py collectstatic --noinput
```

## 8. Create Superuser

```bash
docker-compose -f docker-compose.prod.yml run --rm backend python manage.py createsuperuser
```

## 9. Deploy

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 10. Monitoring & Maintenance

### Log Management

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service
docker-compose -f docker-compose.prod.yml logs -f backend

# Rotate logs
docker-compose -f docker-compose.prod.yml logs --no-log-prefix > app.log
```

### Backup Strategy

```bash
# Database backup
docker-compose -f docker-compose.prod.yml exec backend python manage.py dumpdata > backup.json

# Or use pg_dump for PostgreSQL
pg_dump -h your-db-host -U prod_user football_predictions_prod > backup.sql
```

### Health Checks

Create monitoring script `healthcheck.sh`:

```bash
#!/bin/bash

# Check if services are running
docker-compose -f /path/to/mvp/docker-compose.prod.yml ps

# Check API health
curl -f https://yourdomain.com/api/schema/ || exit 1

# Check frontend
curl -f https://yourdomain.com/ || exit 1

echo "All services healthy"
```

### Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker-compose -f docker-compose.prod.yml run --rm backend python manage.py migrate

# Collect static
docker-compose -f docker-compose.prod.yml run --rm backend python manage.py collectstatic --noinput
```

## 11. Performance Optimization

### Database Optimization

```python
# In settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        # ... other settings
        'CONN_MAX_AGE': 600,  # Connection pooling
        'OPTIONS': {
            'connect_timeout': 10,
        }
    }
}
```

### Caching

```python
# Add Redis caching
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://redis:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Cache API responses
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',
        'user': '1000/day'
    }
}
```

### CDN for Static Files

Consider using AWS S3 + CloudFront or similar for static/media files.

## 12. Security Checklist

- [x] DEBUG=False
- [x] Strong SECRET_KEY
- [x] HTTPS enabled
- [x] ALLOWED_HOSTS configured
- [x] Database credentials secured
- [x] API keys in environment variables
- [x] Firewall configured
- [x] Regular backups scheduled
- [x] Monitoring enabled
- [x] Rate limiting configured
- [x] CORS properly configured
- [x] Security headers in Nginx
- [x] Regular updates scheduled

## 13. Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend

# Check environment variables
docker-compose -f docker-compose.prod.yml config
```

### Database Connection Issues

```bash
# Test connection
docker-compose -f docker-compose.prod.yml run --rm backend python manage.py dbshell
```

### Static Files Not Loading

```bash
# Recollect static files
docker-compose -f docker-compose.prod.yml run --rm backend python manage.py collectstatic --noinput

# Check Nginx config
docker-compose -f docker-compose.prod.yml exec nginx nginx -t
```

### High Memory Usage

```bash
# Limit container memory
docker-compose -f docker-compose.prod.yml up -d --build --scale celery=2
```

## 14. Scaling

### Horizontal Scaling

```bash
# Scale Celery workers
docker-compose -f docker-compose.prod.yml up -d --scale celery=4

# Scale backend (behind load balancer)
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

### Load Balancing

Use AWS ELB, DigitalOcean Load Balancer, or nginx upstream for multiple backend instances.

## Support

For production issues:
- Check logs first
- Review error messages
- Consult documentation
- Open GitHub issue with details

## Post-Deployment

1. Test all functionality
2. Monitor error logs
3. Set up automated backups
4. Configure monitoring/alerting
5. Document any custom configurations
6. Train administrators

Your Football Match Prediction Platform is now live! 🎉⚽
