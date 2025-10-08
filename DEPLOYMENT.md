# Deployment Checklist

## Pre-Deployment

### 1. Environment Configuration
- [ ] Copy `backend/.env.example` to `backend/.env`
- [ ] Set `DEBUG=False`
- [ ] Generate new `SECRET_KEY` (use `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`)
- [ ] Update `ALLOWED_HOSTS` with your domain
- [ ] Configure database credentials
- [ ] Add API-Football API key
- [ ] Configure email settings (SMTP)
- [ ] Set `FRONTEND_URL` to production URL
- [ ] Update `CORS_ALLOWED_ORIGINS`

### 2. Database Setup
- [ ] PostgreSQL installed and running
- [ ] Database created
- [ ] Database user created with proper permissions
- [ ] Backup strategy in place
- [ ] Database connection tested

### 3. SSL/HTTPS
- [ ] SSL certificate obtained
- [ ] Certificate files in proper location
- [ ] Nginx configured for HTTPS
- [ ] HTTP to HTTPS redirect configured
- [ ] SSL tested

### 4. Static & Media Files
- [ ] Static files directory created
- [ ] Media files directory created
- [ ] Proper permissions set
- [ ] CDN configured (optional)

### 5. Security
- [ ] Strong database password
- [ ] Firewall configured
- [ ] Only necessary ports open (80, 443)
- [ ] Rate limiting configured
- [ ] CSRF protection enabled
- [ ] Security headers configured

## Deployment Steps

### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

### 2. Application Deployment

```bash
# Clone repository
git clone https://github.com/bie7u/mvp.git
cd mvp

# Configure environment
cp backend/.env.example backend/.env
nano backend/.env  # Edit configuration

# Build and start services
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to start
sleep 30

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Create superuser
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser

# Collect static files
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput

# Seed initial data (optional)
docker-compose -f docker-compose.prod.yml exec backend python manage.py seed_data
```

### 3. Verify Deployment

```bash
# Check all services are running
docker-compose -f docker-compose.prod.yml ps

# Check logs for errors
docker-compose -f docker-compose.prod.yml logs

# Test backend API
curl http://localhost:8000/api/

# Test frontend
curl http://localhost:3000/
```

## Post-Deployment

### 1. Monitoring Setup
- [ ] Application logs monitored
- [ ] Database logs monitored
- [ ] Error tracking configured (e.g., Sentry)
- [ ] Uptime monitoring configured
- [ ] Performance monitoring configured
- [ ] Disk space monitoring

### 2. Backups
- [ ] Database backup configured
- [ ] Media files backup configured
- [ ] Backup restoration tested
- [ ] Backup schedule automated

### 3. Testing
- [ ] Login functionality tested
- [ ] API endpoints tested
- [ ] Prediction creation tested
- [ ] Rankings display tested
- [ ] Email notifications tested
- [ ] Admin panel access tested

### 4. Documentation
- [ ] Deployment notes documented
- [ ] Server credentials stored securely
- [ ] API keys stored securely
- [ ] Runbook created
- [ ] Team trained

## Production Checklist

### Performance
- [ ] Database queries optimized
- [ ] Indexes created
- [ ] Caching configured (Redis)
- [ ] Static files compressed
- [ ] CDN configured
- [ ] Load testing completed

### Security
- [ ] Security audit completed
- [ ] Penetration testing done
- [ ] Dependencies updated
- [ ] Secrets rotated
- [ ] Access controls verified
- [ ] Logs monitored

### Scalability
- [ ] Load balancing configured
- [ ] Auto-scaling configured (optional)
- [ ] Database replication (optional)
- [ ] Backup servers ready

### Compliance
- [ ] GDPR compliance checked
- [ ] Data retention policy set
- [ ] Privacy policy updated
- [ ] Terms of service updated
- [ ] Cookie consent implemented

## Maintenance

### Daily
- [ ] Check application logs
- [ ] Monitor error rates
- [ ] Verify backups completed
- [ ] Check disk space

### Weekly
- [ ] Review performance metrics
- [ ] Check security logs
- [ ] Update dependencies (if needed)
- [ ] Database optimization

### Monthly
- [ ] Security updates
- [ ] Full backup verification
- [ ] Performance review
- [ ] Cost optimization

## Rollback Plan

### If deployment fails:

1. **Stop new containers**
   ```bash
   docker-compose -f docker-compose.prod.yml down
   ```

2. **Restore database backup**
   ```bash
   # Restore from backup
   ```

3. **Revert to previous version**
   ```bash
   git checkout <previous-version>
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Verify rollback**
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   # Test application
   ```

## Useful Commands

### Docker Management
```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart service
docker-compose -f docker-compose.prod.yml restart backend

# Execute command in container
docker-compose -f docker-compose.prod.yml exec backend bash

# View resource usage
docker stats
```

### Database Management
```bash
# Backup database
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres football_predictions > backup.sql

# Restore database
docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres football_predictions < backup.sql

# Access database
docker-compose -f docker-compose.prod.yml exec db psql -U postgres football_predictions
```

### Application Management
```bash
# Fetch match data manually
docker-compose -f docker-compose.prod.yml exec backend python manage.py fetch_match_data

# Create superuser
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Collect static files
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

## Health Checks

### Backend
```bash
curl http://localhost:8000/api/
```

### Frontend
```bash
curl http://localhost:3000/
```

### Database
```bash
docker-compose -f docker-compose.prod.yml exec db pg_isready -U postgres
```

### Cron Service
```bash
docker-compose -f docker-compose.prod.yml logs cron
```

## Troubleshooting

### Container won't start
- Check logs: `docker-compose logs <service>`
- Verify environment variables
- Check disk space
- Verify ports aren't in use

### Database connection error
- Verify database is running
- Check credentials in .env
- Verify network connectivity
- Check firewall rules

### Static files not loading
- Run collectstatic
- Check Nginx configuration
- Verify file permissions
- Check volume mounts

### API errors
- Check backend logs
- Verify migrations ran
- Check database connection
- Verify environment variables

## Support

- **Documentation**: See README.md
- **Issues**: GitHub Issues
- **Emergency Contact**: [Your contact info]

---

**Last Updated**: 2024
**Version**: 1.0.0
