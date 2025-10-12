# Server Implementation Guide

This guide provides step-by-step instructions for implementing the backend server for the FlowDesk application based on the current client implementation.

## Prerequisites

Before implementing the server, please read:
1. [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Complete API specifications
2. This guide - Implementation approach and key considerations

## Current Client Implementation

The client application is already updated to work with server-side filtering. Key changes made:

### 1. API Service Layer (`src/services/api.js`)

All API service methods now accept optional `params` objects for filtering:

```javascript
// Users
userService.getUsers({ search: 'john' })

// Clients  
clientService.getClients({ status: 'active' })

// Predictions
predictionsService.getUpcomingMatches({ 
  league: 'Premier League',
  startDate: '2025-10-13',
  endDate: '2025-10-20'
})

// Rankings
rankingService.getRanking(clientId)
```

### 2. Client-Side Filtering Removed

The following client-side filtering has been removed and replaced with server-side filtering:

- **Users Page**: Search filtering now sends `search` parameter to server
- **Predictions Page**: Date range and league filtering now sends parameters to server
- **Ranking Page**: Already using server-side client filtering

## Implementation Steps

### Step 1: Set Up Your Server Framework

Choose your preferred backend framework. Popular options:

**Node.js:**
- Express.js + TypeScript
- NestJS (recommended for structured projects)
- Fastify

**Python:**
- FastAPI (recommended)
- Django REST Framework
- Flask

**Go:**
- Gin
- Echo
- Chi

**Java:**
- Spring Boot

### Step 2: Database Schema

Create the following tables based on the data models in API_DOCUMENTATION.md:

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('root_admin', 'client_admin', 'client_user')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    client_id INTEGER REFERENCES clients(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clients table
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    admin_name VARCHAR(255) NOT NULL,
    admin_email VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Matches table
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    home_team VARCHAR(255) NOT NULL,
    away_team VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    league VARCHAR(255) NOT NULL,
    locked BOOLEAN DEFAULT FALSE,
    actual_home_score INTEGER,
    actual_away_score INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Predictions table
CREATE TABLE predictions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    home_score INTEGER NOT NULL,
    away_score INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, match_id)
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_client_id ON users(client_id);
CREATE INDEX idx_predictions_user_id ON predictions(user_id);
CREATE INDEX idx_predictions_match_id ON predictions(match_id);
CREATE INDEX idx_matches_date ON matches(date);
CREATE INDEX idx_matches_league ON matches(league);
```

### Step 3: Authentication & JWT

Implement JWT-based authentication:

1. **Login Endpoint** (`POST /api/login`):
   - Validate email and password
   - Hash password comparison (bcrypt recommended)
   - Generate JWT token with user info in payload
   - Return token and user object

2. **JWT Payload Structure**:
```json
{
  "userId": 1,
  "email": "admin@client.com",
  "role": "client_admin",
  "clientId": 1,
  "iat": 1234567890,
  "exp": 1234571490
}
```

3. **Authentication Middleware**:
   - Verify JWT token on all protected routes
   - Extract user information from token
   - Attach user to request object
   - Return 401 if token is invalid/missing

### Step 4: Role-Based Access Control (RBAC)

Implement middleware to check user roles:

```javascript
// Example middleware
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    next();
  };
}

// Usage
app.get('/api/analytics', authenticateToken, requireRole('root_admin'), getAnalytics);
```

### Step 5: Implement Server-Side Filtering

**Critical**: All filtering MUST happen on the server, not the client.

#### Users Endpoint with Filtering

```javascript
// GET /api/users
async function getUsers(req, res) {
  const { search, role, status, clientId, page = 1, limit = 50 } = req.query;
  const user = req.user; // From auth middleware
  
  let query = db.select().from('users');
  
  // Role-based filtering
  if (user.role === 'client_admin') {
    // Client admins can only see users from their client
    query = query.where('client_id', user.clientId);
  } else if (user.role !== 'root_admin') {
    return res.status(403).json({ message: 'Insufficient permissions' });
  }
  
  // Server-side search filtering
  if (search) {
    query = query.where(function() {
      this.where('name', 'ilike', `%${search}%`)
          .orWhere('email', 'ilike', `%${search}%`);
    });
  }
  
  // Additional filters
  if (role) {
    query = query.where('role', role);
  }
  
  if (status) {
    query = query.where('status', status);
  }
  
  if (clientId && user.role === 'root_admin') {
    query = query.where('client_id', parseInt(clientId));
  }
  
  // Pagination
  const offset = (page - 1) * limit;
  const total = await query.clone().count();
  const users = await query.limit(limit).offset(offset);
  
  return res.json({
    users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: total[0].count,
      totalPages: Math.ceil(total[0].count / limit)
    }
  });
}
```

#### Predictions/Matches Endpoint with Filtering

```javascript
// GET /api/predictions/matches
async function getUpcomingMatches(req, res) {
  const { league, startDate, endDate, locked } = req.query;
  
  let query = db.select().from('matches');
  
  // Server-side date filtering
  if (startDate) {
    query = query.where('date', '>=', startDate);
  }
  
  if (endDate) {
    query = query.where('date', '<=', endDate);
  }
  
  // Server-side league filtering
  if (league) {
    query = query.where('league', league);
  }
  
  // Filter by locked status
  if (locked !== undefined) {
    query = query.where('locked', locked === 'true');
  }
  
  const matches = await query.orderBy('date', 'asc');
  
  return res.json({ matches });
}
```

#### Rankings Endpoint with Client Filtering

```javascript
// GET /api/rankings
async function getRankings(req, res) {
  const { clientId } = req.query;
  const user = req.user;
  
  let targetClientId;
  
  // Determine which client's rankings to show
  if (user.role === 'root_admin') {
    if (!clientId) {
      return res.status(400).json({ 
        message: 'clientId parameter is required for root_admin' 
      });
    }
    targetClientId = parseInt(clientId);
  } else {
    // For client_admin and client_user, use their clientId from token
    targetClientId = user.clientId;
  }
  
  // Get all users in the client
  const users = await db.select()
    .from('users')
    .where('client_id', targetClientId);
  
  // Calculate rankings for each user
  const rankings = await Promise.all(users.map(async (user) => {
    const predictions = await db.select('p.*', 'm.*')
      .from('predictions as p')
      .join('matches as m', 'p.match_id', 'm.id')
      .where('p.user_id', user.id)
      .where('m.locked', true);
    
    let points = 0;
    let correctResults = 0;
    let correctWinners = 0;
    
    predictions.forEach(pred => {
      const pts = calculatePoints(pred);
      points += pts;
      if (pts === 3) {
        correctResults++;
        correctWinners++;
      } else if (pts === 1) {
        correctWinners++;
      }
    });
    
    return {
      userId: user.id,
      userName: user.name,
      email: user.email,
      points,
      correctResults,
      correctWinners,
      totalPredictions: predictions.length
    };
  }));
  
  // Sort by points (descending), then by correct results
  rankings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.correctResults - a.correctResults;
  });
  
  // Add positions
  const rankedUsers = rankings.map((r, index) => ({
    ...r,
    position: index + 1
  }));
  
  return res.json({ rankings: rankedUsers });
}

function calculatePoints(prediction) {
  const { home_score, away_score, actual_home_score, actual_away_score } = prediction;
  
  if (actual_home_score === null || actual_away_score === null) {
    return 0;
  }
  
  // Exact score = 3 points
  if (home_score === actual_home_score && away_score === actual_away_score) {
    return 3;
  }
  
  // Correct winner = 1 point
  const predWinner = home_score > away_score ? 'home' : 
                    home_score < away_score ? 'away' : 'draw';
  const actualWinner = actual_home_score > actual_away_score ? 'home' : 
                      actual_home_score < actual_away_score ? 'away' : 'draw';
  
  return predWinner === actualWinner ? 1 : 0;
}
```

### Step 6: Input Validation

Validate all inputs to prevent injection attacks and ensure data integrity:

```javascript
// Example using express-validator
const { body, query, validationResult } = require('express-validator');

// Login validation
app.post('/api/login',
  body('email').isEmail().normalizeEmail(),
  body('password').isString().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // ... login logic
  }
);

// Prediction validation
app.post('/api/predictions',
  authenticateToken,
  body('matchId').isInt(),
  body('homeScore').isInt({ min: 0 }),
  body('awayScore').isInt({ min: 0 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Check if match is locked
    const match = await db.select().from('matches').where('id', req.body.matchId).first();
    if (match.locked) {
      return res.status(400).json({ message: 'Match is locked' });
    }
    
    // ... create prediction
  }
);
```

### Step 7: Error Handling

Implement consistent error handling:

```javascript
// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  
  return res.status(500).json({ 
    message: 'Internal server error' 
  });
});
```

### Step 8: CORS Configuration

Configure CORS to allow the frontend to communicate with the backend:

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

### Step 9: Environment Variables

Create `.env` file for configuration:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/flowdesk

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=24h

# Server
PORT=3000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:5173
```

### Step 10: Testing

Test all endpoints with different user roles:

1. **Test as root_admin**: Should see all data
2. **Test as client_admin**: Should only see their client's data
3. **Test as client_user**: Should only see their own data

Example test scenarios:
- Search users with different search terms
- Filter matches by league and date range
- View rankings for different clients
- Create and update predictions
- Attempt unauthorized access (should return 403)

## Migration from Mock to Real Server

The client is already configured to work with a real server. To switch:

1. **Update API Base URL**: In `src/services/api.js`, change the `baseURL`:
   ```javascript
   const api = axios.create({
     baseURL: process.env.VITE_API_URL || '/api',
   });
   ```

2. **Set Environment Variable**: Create `.env` file in the frontend:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

3. **Remove MSW**: When ready for production, remove or disable MSW:
   - Remove MSW setup from `src/main.jsx`
   - Or conditionally enable it only in development

## Security Checklist

- [ ] Passwords are hashed with bcrypt (min 10 rounds)
- [ ] JWT tokens have expiration (recommended: 24h)
- [ ] JWT secret is stored securely in environment variables
- [ ] All inputs are validated and sanitized
- [ ] SQL injection protection (use parameterized queries)
- [ ] XSS protection (sanitize user inputs)
- [ ] CSRF protection (if using cookies)
- [ ] Rate limiting on login endpoint
- [ ] HTTPS in production
- [ ] Secure HTTP headers (helmet.js)
- [ ] Database credentials not in code
- [ ] Proper error messages (don't leak sensitive info)

## Performance Considerations

1. **Database Indexing**: Create indexes on frequently queried columns
2. **Connection Pooling**: Use database connection pools
3. **Caching**: Cache frequently accessed data (Redis recommended)
4. **Pagination**: Always paginate list endpoints
5. **Query Optimization**: Use joins instead of multiple queries where possible

## Deployment

### Docker Example

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/flowdesk
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
  
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=flowdesk
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## Additional Resources

- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP API Security](https://owasp.org/www-project-api-security/)

## Support

For questions or issues:
1. Review the API documentation
2. Check the mock implementation in `src/mocks/handlers.js`
3. Verify client-side code in `src/pages/` and `src/services/`

---

**Remember**: The client application expects all filtering to be done server-side. Never trust client-sent data for authorization - always validate against the JWT token.
