# Cron Jobs Setup

This project uses django-extensions jobs for scheduled tasks instead of Celery Beat.

## Available Jobs

### Match Updates (Quarter Hourly - Every 15 minutes)
- **App**: matches
- **Job**: update_match_data
- **Frequency**: quarter_hourly
- **Description**: Updates match data from API-Football

### Rankings Update (Hourly)
- **App**: predictions
- **Job**: update_rankings
- **Frequency**: hourly
- **Description**: Updates rankings for all companies

## Running Jobs Manually

To run jobs manually for testing:

```bash
# Run quarter hourly jobs (match data update)
python manage.py runjobs quarter_hourly

# Run hourly jobs (rankings update)
python manage.py runjobs hourly

# List all available jobs
python manage.py runjobs --list
```

## Setting Up Cron

To schedule these jobs in production, add the following to your system crontab:

```bash
# Edit crontab
crontab -e

# Add these lines (adjust path to your project):
*/15 * * * * cd /path/to/mvp/backend && /path/to/python manage.py runjobs quarter_hourly
0 * * * * cd /path/to/mvp/backend && /path/to/python manage.py runjobs hourly
```

## Docker Setup

For Docker deployments, you can add a cron container to docker-compose.yml:

```yaml
  cron:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: >
      sh -c "
        apt-get update && apt-get install -y cron &&
        echo '*/15 * * * * cd /app && python manage.py runjobs quarter_hourly >> /var/log/cron.log 2>&1' > /etc/cron.d/django-jobs &&
        echo '0 * * * * cd /app && python manage.py runjobs hourly >> /var/log/cron.log 2>&1' >> /etc/cron.d/django-jobs &&
        chmod 0644 /etc/cron.d/django-jobs &&
        crontab /etc/cron.d/django-jobs &&
        touch /var/log/cron.log &&
        cron && tail -f /var/log/cron.log
      "
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - DEBUG=${DEBUG}
      - SECRET_KEY=${SECRET_KEY}
      - API_FOOTBALL_KEY=${API_FOOTBALL_KEY}
    depends_on:
      - db
      - redis
```

Or use a simpler approach with a shell script that runs in a loop:

```yaml
  cron:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: >
      sh -c "
        while true; do
          python manage.py runjobs quarter_hourly;
          sleep 900;
        done
      "
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - DEBUG=${DEBUG}
      - SECRET_KEY=${SECRET_KEY}
      - API_FOOTBALL_KEY=${API_FOOTBALL_KEY}
    depends_on:
      - db
      - redis
```

## Migration from Celery Beat

This implementation replaces Celery Beat with django-extensions jobs:
- No need for celery-beat service
- No need for django-celery-beat database tables
- Simpler cron-based scheduling
- Jobs run as regular Django management commands

The task functions in `tasks.py` files have been converted from Celery tasks to regular Python functions, but they remain available for manual execution or integration with other parts of the application.
