# Server Implementation Guide

This guide provides an overview of the server-side implementation requirements for the FlowDesk SaaS application based on the mock API handlers.

## Overview

The FlowDesk application requires a backend server that implements the endpoints documented in `API_DOCUMENTATION.md`. The mock handlers in `src/mocks/handlers.js` demonstrate the expected behavior, including server-side filtering, pagination, and role-based access control.

## Key Features Implemented

### 1. Server-Side Filtering

All list endpoints now support server-side filtering through query parameters:

- **Users Endpoint** (`/api/users`): Filter by `clientId`, `role`, `status`, and `search`
- **Clients Endpoint** (`/api/clients`): Filter by `status` and `search`
- **Client Users Endpoint** (`/api/clients/:clientId/users`): Filter by `role` and `status`
- **Matches Endpoint** (`/api/predictions/matches`): Filter by `league`, `date`, and `locked` status
- **User Predictions Endpoint** (`/api/predictions/user`): Filter by `matchId` and `status`
- **Rankings Endpoint** (`/api/rankings`): Filter by `clientId`
- **Analytics Endpoint** (`/api/analytics`): Filter by `clientId`, `startDate`, and `endDate`

### 2. Pagination

All list endpoints return paginated results with the following structure:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

**Query Parameters:**
- `page` (default: 1): Page number
- `limit` (default: 10, max: 100): Items per page

### 3. Role-Based Access Control

The application supports three user roles:

1. **root_admin**: Full access to all data and endpoints
2. **client_admin**: Access to their client's data and user management
3. **client_user**: Limited access to predictions and rankings

## Mock Handler Examples

### Users Endpoint with Filtering

```javascript
http.get('/api/users', ({ request }) => {
  const url = new URL(request.url);
  const clientIdParam = url.searchParams.get('clientId');
  const roleParam = url.searchParams.get('role');
  const statusParam = url.searchParams.get('status');
  const searchParam = url.searchParams.get('search');
  const pageParam = parseInt(url.searchParams.get('page')) || 1;
  const limitParam = Math.min(parseInt(url.searchParams.get('limit')) || 10, 100);

  // Apply filters
  let filteredUsers = allUsers;

  if (clientIdParam) {
    filteredUsers = filteredUsers.filter(u => u.clientId === parseInt(clientIdParam));
  }

  if (roleParam) {
    filteredUsers = filteredUsers.filter(u => u.role === roleParam);
  }

  if (statusParam) {
    filteredUsers = filteredUsers.filter(u => u.status === statusParam);
  }

  if (searchParam) {
    const search = searchParam.toLowerCase();
    filteredUsers = filteredUsers.filter(u =>
      u.name.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search)
    );
  }

  // Apply pagination
  const startIndex = (pageParam - 1) * limitParam;
  const endIndex = startIndex + limitParam;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  return HttpResponse.json({
    users: paginatedUsers,
    pagination: {
      page: pageParam,
      limit: limitParam,
      total: filteredUsers.length,
      totalPages: Math.ceil(filteredUsers.length / limitParam),
    },
  });
});
```

## Technology Stack Recommendations

### Backend Framework Options

1. **Node.js with Express**
   - Fast and lightweight
   - Easy to integrate with existing JavaScript ecosystem
   - Middleware support for authentication and validation

2. **Node.js with NestJS**
   - TypeScript support
   - Built-in validation and guards
   - Modular architecture

3. **Python with FastAPI**
   - Automatic API documentation
   - Type hints and validation
   - High performance

4. **Python with Django REST Framework**
   - Comprehensive ORM
   - Built-in admin interface
   - Robust authentication

### Database Options

1. **PostgreSQL**
   - Robust relational database
   - Strong support for complex queries
   - ACID compliant

2. **MongoDB**
   - Flexible schema
   - Good for rapid development
   - Easy to scale horizontally

3. **MySQL**
   - Widely supported
   - Good performance
   - Strong community

### Authentication

1. **JWT (JSON Web Tokens)**
   - Stateless authentication
   - Easy to implement
   - Works well with SPAs

2. **OAuth 2.0**
   - Industry standard
   - Supports third-party login
   - More complex to implement

## Implementation Steps

### Phase 1: Core Setup
1. Set up the backend framework and database
2. Create database schema based on recommendations in API_DOCUMENTATION.md
3. Implement user authentication with JWT
4. Set up basic CRUD endpoints

### Phase 2: Authentication & Authorization
1. Implement login endpoint with password hashing (bcrypt)
2. Create middleware for JWT validation
3. Implement role-based access control middleware
4. Add token refresh mechanism

### Phase 3: Data Endpoints
1. Implement users endpoint with filtering and pagination
2. Implement clients endpoint with filtering and pagination
3. Implement predictions endpoints
4. Implement rankings endpoint with scoring logic
5. Implement analytics endpoint

### Phase 4: Business Logic
1. Implement prediction scoring algorithm
2. Create ranking calculation logic
3. Add match locking mechanism
4. Implement validation rules

### Phase 5: Optimization
1. Add database indexes for filtering fields
2. Implement caching for frequently accessed data
3. Add rate limiting
4. Set up logging and monitoring

### Phase 6: Security
1. Implement input validation and sanitization
2. Set up CORS properly
3. Add security headers
4. Implement rate limiting
5. Set up HTTPS

## Code Examples

### Express.js Example - Users Endpoint

```javascript
const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const User = require('../models/User');

router.get('/users', 
  authenticateToken, 
  authorizeRoles(['root_admin', 'client_admin']),
  async (req, res) => {
    try {
      const { clientId, role, status, search, page = 1, limit = 10 } = req.query;
      
      // Build query
      let query = {};
      
      // Role-based filtering
      if (req.user.role === 'client_admin') {
        query.clientId = req.user.clientId;
      } else if (clientId) {
        query.clientId = clientId;
      }
      
      // Additional filters
      if (role) query.role = role;
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Execute query with pagination
      const limitNum = Math.min(parseInt(limit), 100);
      const pageNum = parseInt(page);
      const skip = (pageNum - 1) * limitNum;
      
      const [users, total] = await Promise.all([
        User.find(query).skip(skip).limit(limitNum).select('-password'),
        User.countDocuments(query)
      ]);
      
      res.json({
        users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

module.exports = router;
```

### FastAPI Example - Users Endpoint

```python
from fastapi import APIRouter, Depends, Query
from typing import Optional, List
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.auth import get_current_user, require_roles
from app.schemas import UserResponse, PaginatedUsersResponse

router = APIRouter()

@router.get("/users", response_model=PaginatedUsersResponse)
async def get_users(
    current_user: User = Depends(get_current_user),
    _: None = Depends(require_roles(["root_admin", "client_admin"])),
    db: Session = Depends(get_db),
    client_id: Optional[int] = Query(None),
    role: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    # Build query
    query = db.query(User)
    
    # Role-based filtering
    if current_user.role == "client_admin":
        query = query.filter(User.client_id == current_user.client_id)
    elif client_id:
        query = query.filter(User.client_id == client_id)
    
    # Additional filters
    if role:
        query = query.filter(User.role == role)
    if status:
        query = query.filter(User.status == status)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (User.name.ilike(search_term)) | (User.email.ilike(search_term))
        )
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    skip = (page - 1) * limit
    users = query.offset(skip).limit(limit).all()
    
    return {
        "users": users,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": (total + limit - 1) // limit
        }
    }
```

## Testing

### Unit Tests

Test each endpoint individually:
- Test filtering with various parameters
- Test pagination edge cases
- Test role-based access control
- Test validation errors

### Integration Tests

Test complete workflows:
- User login and token usage
- Creating predictions and calculating rankings
- Client admin managing their users
- Root admin filtering data by client

### Example Test (Jest)

```javascript
describe('Users Endpoint', () => {
  it('should filter users by client ID', async () => {
    const response = await request(app)
      .get('/api/users?clientId=1')
      .set('Authorization', `Bearer ${rootAdminToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ clientId: 1 })
      ])
    );
    expect(response.body.pagination).toMatchObject({
      page: 1,
      limit: 10,
      total: expect.any(Number),
      totalPages: expect.any(Number)
    });
  });

  it('should filter users by search term', async () => {
    const response = await request(app)
      .get('/api/users?search=alice')
      .set('Authorization', `Bearer ${rootAdminToken}`);
    
    expect(response.status).toBe(200);
    expect(response.body.users.length).toBeGreaterThan(0);
    expect(
      response.body.users.some(u => 
        u.name.toLowerCase().includes('alice') || 
        u.email.toLowerCase().includes('alice')
      )
    ).toBe(true);
  });

  it('should deny access to unauthorized roles', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${clientUserToken}`);
    
    expect(response.status).toBe(403);
  });
});
```

## Deployment Considerations

### Environment Variables

```bash
# Server
PORT=3000
NODE_ENV=production

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=flowdesk
DB_USER=dbuser
DB_PASSWORD=securepassword

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# CORS
ALLOWED_ORIGINS=https://flowdesk.com,https://www.flowdesk.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### Production Checklist

- [ ] Set up HTTPS/SSL certificates
- [ ] Configure CORS for production domains
- [ ] Set up database backups
- [ ] Implement logging and monitoring
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure rate limiting
- [ ] Set up health check endpoints
- [ ] Implement database migrations
- [ ] Set up CI/CD pipeline
- [ ] Configure environment-specific settings
- [ ] Set up load balancing (if needed)
- [ ] Implement caching strategy
- [ ] Set up database connection pooling

## Monitoring and Maintenance

### Key Metrics to Monitor

1. **API Performance**
   - Response times per endpoint
   - Request rate
   - Error rate

2. **Database Performance**
   - Query execution time
   - Connection pool usage
   - Slow query log

3. **Security**
   - Failed login attempts
   - Rate limit violations
   - Unauthorized access attempts

4. **Business Metrics**
   - Active users
   - Predictions per day
   - Client growth

### Logging Best Practices

- Log all authentication attempts
- Log API errors with stack traces
- Log slow queries
- Log security-related events
- Use structured logging (JSON format)
- Implement log rotation
- Set up centralized logging (e.g., ELK stack)

## Resources

- [API Documentation](./API_DOCUMENTATION.md) - Complete API specification
- [Mock Handlers](./src/mocks/handlers.js) - Reference implementation
- JWT: https://jwt.io/
- Express.js: https://expressjs.com/
- FastAPI: https://fastapi.tiangolo.com/
- PostgreSQL: https://www.postgresql.org/
- MongoDB: https://www.mongodb.com/

## Support

For questions or issues related to the API implementation, please refer to:
1. The comprehensive API documentation in `API_DOCUMENTATION.md`
2. The mock handlers in `src/mocks/handlers.js` for behavior examples
3. This implementation guide for best practices and code examples
