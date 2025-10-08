# Football Match Prediction Platform - Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Client Layer                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   ┌─────────────┐  ┌──────────────┐  ┌────────────┐                │
│   │   Browser   │  │    Mobile    │  │   Tablet   │                │
│   │  (Desktop)  │  │   (Safari)   │  │  (Chrome)  │                │
│   └──────┬──────┘  └──────┬───────┘  └─────┬──────┘                │
│          │                 │                 │                        │
│          └─────────────────┼─────────────────┘                        │
│                            │                                          │
└────────────────────────────┼──────────────────────────────────────────┘
                             │
                    HTTP/HTTPS (Port 80/443)
                             │
┌────────────────────────────┼──────────────────────────────────────────┐
│                       Nginx Layer                                     │
├────────────────────────────┼──────────────────────────────────────────┤
│                            │                                          │
│                    ┌───────▼────────┐                                │
│                    │  Nginx Proxy   │                                │
│                    │  Load Balancer │                                │
│                    └────────┬───────┘                                │
│                             │                                          │
│              ┌──────────────┼──────────────┐                          │
│              │              │              │                          │
└──────────────┼──────────────┼──────────────┼──────────────────────────┘
               │              │              │
               │              │              │
┌──────────────▼──────┐  ┌───▼────┐  ┌──────▼──────┐
│   Frontend (React)  │  │ Static │  │   Media     │
│   Port 3000/80      │  │ Files  │  │   Files     │
└─────────────────────┘  └────────┘  └─────────────┘
                             │
                    API Calls (AJAX)
                             │
┌────────────────────────────┼──────────────────────────────────────────┐
│                      Backend Layer (Django)                           │
├────────────────────────────┼──────────────────────────────────────────┤
│                            │                                          │
│                    ┌───────▼────────┐                                │
│                    │  Django REST   │                                │
│                    │   Framework    │                                │
│                    │   (Port 8000)  │                                │
│                    └────────┬───────┘                                │
│                             │                                          │
│         ┌───────────────────┼──────────────────────┐                 │
│         │                   │                      │                 │
│    ┌────▼────┐    ┌─────────▼────────┐    ┌──────▼──────┐          │
│    │  Users  │    │    Companies     │    │   Leagues   │          │
│    │   App   │    │       App        │    │     App     │          │
│    └─────────┘    └──────────────────┘    └─────────────┘          │
│                                                                       │
│    ┌─────────┐    ┌──────────────────┐    ┌─────────────┐          │
│    │ Matches │    │   Predictions    │    │  Rankings   │          │
│    │   App   │    │       App        │    │     App     │          │
│    └────┬────┘    └──────────────────┘    └─────────────┘          │
│         │                                                             │
└─────────┼─────────────────────────────────────────────────────────────┘
          │
          │ API Football Integration
          │
┌─────────▼─────────────────────────────────────────────────────────────┐
│                    Background Services                                │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│    ┌──────────────────┐              ┌──────────────────┐           │
│    │   Cron Service   │              │  Email Service   │           │
│    │   (Every 5 min)  │              │   (SMTP/Gmail)   │           │
│    │                  │              │                  │           │
│    │ • Fetch fixtures │              │ • Invitations    │           │
│    │ • Update results │              │ • Notifications  │           │
│    │ • Calc rankings  │              │ • Password reset │           │
│    └──────────────────┘              └──────────────────┘           │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
          │                                          │
          └──────────────┬───────────────────────────┘
                         │
┌────────────────────────▼──────────────────────────────────────────────┐
│                    Data Layer                                         │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│                    ┌──────────────────┐                              │
│                    │   PostgreSQL     │                              │
│                    │   Database       │                              │
│                    │   (Port 5432)    │                              │
│                    │                  │                              │
│                    │ • Users          │                              │
│                    │ • Companies      │                              │
│                    │ • Leagues        │                              │
│                    │ • Matches        │                              │
│                    │ • Predictions    │                              │
│                    │ • Rankings       │                              │
│                    └──────────────────┘                              │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼──────────────────────────────────────────────┐
│                  External Services                                    │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│                    ┌──────────────────┐                              │
│                    │  API-Football    │                              │
│                    │  (api-sports.io) │                              │
│                    │                  │                              │
│                    │ • Match fixtures │                              │
│                    │ • Live scores    │                              │
│                    │ • Match results  │                              │
│                    │ • League data    │                              │
│                    └──────────────────┘                              │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Authentication Flow
```
User → Login Form → POST /api/auth/login/ → Django JWT → Access + Refresh Tokens
                                                ↓
                                          Store in localStorage
                                                ↓
                                    Include in Authorization header
                                                ↓
                                      Access Protected Routes
```

### 2. Prediction Creation Flow
```
User → Select Match → Enter Scores → POST /api/predictions/
                                           ↓
                                    Validate (not locked)
                                           ↓
                                    Save to Database
                                           ↓
                                    Return Success
                                           ↓
                                    Update UI
```

### 3. Match Data Sync Flow
```
Cron (Every 5 min) → fetch_match_data command
                           ↓
                    API-Football GET /fixtures
                           ↓
                    Parse Response
                           ↓
                    Update/Create Matches
                           ↓
                    Calculate Predictions
                           ↓
                    Update Rankings
```

### 4. Ranking Calculation Flow
```
Match Finishes → Update Match Status → Recalculate Predictions
                                              ↓
                                    Sum Points per User
                                              ↓
                                    Update Rankings Table
                                              ↓
                                    Assign Rank Position
```

## Technology Stack

### Frontend
- **React 18** - UI framework
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **JWT** - Authentication

### Backend
- **Django 4.2** - Web framework
- **Django REST Framework** - API
- **Simple JWT** - Authentication
- **PostgreSQL** - Database
- **Gunicorn** - WSGI server

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **Nginx** - Reverse proxy
- **API-Football** - External data source

## Security Layers

```
┌─────────────────────────────────────────┐
│  Layer 1: Network Security              │
│  • HTTPS/SSL                            │
│  • CORS Configuration                   │
│  • Rate Limiting                        │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  Layer 2: Authentication                │
│  • JWT Tokens                           │
│  • Password Hashing (PBKDF2)            │
│  • Token Expiration                     │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  Layer 3: Authorization                 │
│  • Role-based Access Control (RBAC)     │
│  • Object-level Permissions             │
│  • Company Data Isolation               │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  Layer 4: Data Security                 │
│  • SQL Injection Protection (ORM)       │
│  • XSS Protection                       │
│  • CSRF Protection                      │
│  • Input Validation                     │
└─────────────────────────────────────────┘
```

## Deployment Architecture

### Development
```
docker-compose.yml
  ├── db (PostgreSQL)
  ├── backend (Django + volume mounts)
  ├── frontend (React dev server)
  └── cron (Background tasks)
```

### Production
```
docker-compose.prod.yml
  ├── db (PostgreSQL + persistent volume)
  ├── backend (Django + Gunicorn)
  ├── frontend (React build + Nginx)
  ├── cron (Background tasks)
  └── nginx (Reverse proxy + SSL)
```

## Scalability Considerations

- **Horizontal Scaling**: Stateless backend allows multiple instances
- **Database**: Connection pooling, indexes on frequent queries
- **Caching**: Ready for Redis integration
- **CDN**: Static files can be served via CDN
- **Load Balancing**: Nginx configured for multiple backends
- **Background Tasks**: Celery-ready for async processing

---

This architecture provides:
- ✅ High availability
- ✅ Scalability
- ✅ Security
- ✅ Maintainability
- ✅ Performance
- ✅ Reliability
