# Docker Setup Guide

## Issues Fixed

### 1. Backend Migration Error
**Problem**: The backend was failing with:
```
ValueError: Dependency on app with no migrations: accounts
```

**Solution**: Created initial migrations for all Django apps in the correct dependency order:
- `matches/migrations/0001_initial.py` (no dependencies)
- `companies/migrations/0001_initial.py` (depends on matches)
- `accounts/migrations/0001_initial.py` (depends on companies)
- `predictions/migrations/0001_initial.py` (depends on accounts and matches)

### 2. Frontend PostCSS Configuration Error
**Problem**: The frontend was crashing with:
```
SyntaxError: Unexpected token 'export'
/app/postcss.config.js:1
export default {
^^^^^^
```

**Solution**: Changed `postcss.config.js` from ES module syntax to CommonJS:
```javascript
// Before
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

// After
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

## Running the Application

### Prerequisites
- Docker and Docker Compose installed
- At least 4GB of available RAM
- Port 3000, 5432, 6379, and 8000 available

### Steps to Run

1. **Clone the repository** (if not already done):
   ```bash
   git clone https://github.com/bie7u/mvp.git
   cd mvp
   ```

2. **Create environment file**:
   ```bash
   cp .env.example .env
   ```
   
   Optionally, edit `.env` to customize settings like database credentials or API keys.

3. **Build and start the containers**:
   ```bash
   docker compose up --build
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api
   - Admin Panel: http://localhost:8000/admin

### Troubleshooting

#### Issue: SSL Certificate Errors During Build
If you encounter SSL certificate verification errors during Docker build, this is usually due to:
- Corporate proxy/firewall
- Network issues
- Self-signed certificates in your environment

**Solutions**:
1. If behind a corporate proxy, configure Docker to use the proxy
2. Try building with `--no-cache` flag:
   ```bash
   docker compose build --no-cache
   ```
3. For development only, you can temporarily disable SSL verification (not recommended for production):
   - Add to Dockerfile before pip install:
     ```dockerfile
     ENV PIP_TRUSTED_HOST=pypi.org,files.pythonhosted.org
     ```

#### Issue: Port Already in Use
If you see an error about ports already in use:
```bash
# Check which process is using the port
sudo lsof -i :3000  # or :8000, :5432, :6379

# Stop the process or change the port in docker-compose.yml
```

#### Issue: Database Connection Failed
If the backend can't connect to the database:
1. Ensure the database service is healthy:
   ```bash
   docker compose ps
   ```
2. Check database logs:
   ```bash
   docker compose logs db
   ```
3. Restart the services:
   ```bash
   docker compose down -v
   docker compose up --build
   ```

### Stopping the Application

```bash
# Stop containers (keeps data)
docker compose down

# Stop containers and remove volumes (fresh start)
docker compose down -v
```

### Development Tips

1. **View logs**:
   ```bash
   # All services
   docker compose logs -f
   
   # Specific service
   docker compose logs -f backend
   docker compose logs -f frontend
   ```

2. **Execute commands in containers**:
   ```bash
   # Django shell
   docker compose exec backend python manage.py shell
   
   # Create superuser
   docker compose exec backend python manage.py createsuperuser
   
   # Run migrations manually
   docker compose exec backend python manage.py migrate
   ```

3. **Rebuild after code changes**:
   ```bash
   # Backend changes usually don't require rebuild (volume mounted)
   docker compose restart backend
   
   # Frontend changes usually don't require rebuild (volume mounted)
   docker compose restart frontend
   
   # If dependencies changed, rebuild:
   docker compose up --build backend
   ```

## Migration Details

The migrations are created in the correct order to handle Foreign Key dependencies:

1. **matches** (0001_initial.py):
   - Creates League, Team, and Match models
   - No dependencies on other apps

2. **companies** (0001_initial.py):
   - Creates Company and CompanyLeague models
   - Depends on matches for the League reference

3. **accounts** (0001_initial.py):
   - Creates User model (custom user)
   - Depends on companies for the Company reference

4. **predictions** (0001_initial.py):
   - Creates Prediction and Ranking models
   - Depends on accounts (User) and matches (Match)

This order ensures all referenced models exist before creating foreign keys to them.
