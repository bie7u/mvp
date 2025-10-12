# FlowDesk API Documentation

This document provides comprehensive API documentation for implementing the backend server for the FlowDesk application.

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [Role-Based Access Control](#role-based-access-control)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Server-Side Filtering](#server-side-filtering)

## Overview

The FlowDesk API is a RESTful API that uses JSON for request and response bodies. All endpoints (except `/api/login`) require authentication via Bearer token.

**Base URL:** `/api`

## Authentication

### POST /api/login

Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "client_admin"
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "message": "Invalid credentials"
}
```

**Headers:**
- All subsequent requests must include: `Authorization: Bearer <token>`

## Role-Based Access Control

The application supports three user roles with different access levels:

### 1. root_admin
- **Full System Access**
- Can view all clients, users, and data
- Can create new clients
- Can manage all users
- Access to all pages: Dashboard, Analytics, Users, Settings, Clients, Leagues, Ranking

### 2. client_admin
- **Client-Level Administration**
- Can view and manage users within their client organization
- Can view their client's predictions and rankings
- Cannot create new clients
- Access to: Dashboard, Users, Settings, Leagues, Predictions, Ranking

### 3. client_user
- **Limited User Access**
- Can view their own predictions and rankings
- Can create and update predictions
- Cannot manage other users
- Access to: Dashboard, Settings, Leagues, Predictions, Ranking

**Implementation Notes:**
- The user's role should be extracted from the JWT token on each request
- The server must validate that the user has permission to access the requested resource
- Filter data based on the user's role and client association

## API Endpoints

### Dashboard

#### GET /api/dashboard/stats

Get dashboard statistics (aggregated data).

**Access:** All authenticated users

**Response (200 OK):**
```json
{
  "totalUsers": 1523,
  "activeClients": 45,
  "revenue": 125430,
  "growth": 12.5
}
```

**Role-Specific Behavior:**
- `root_admin`: Returns global statistics across all clients
- `client_admin`: Returns statistics for their specific client
- `client_user`: Returns statistics for their specific client

---

### Analytics

#### GET /api/analytics

Get analytics data for charts and visualizations.

**Access:** `root_admin` only

**Response (200 OK):**
```json
{
  "data": [
    { "name": "Jan", "users": 400, "revenue": 2400 },
    { "name": "Feb", "users": 300, "revenue": 1398 },
    { "name": "Mar", "users": 600, "revenue": 9800 }
  ]
}
```

---

### Users Management

#### GET /api/users

Get a list of users with optional server-side filtering.

**Access:** `root_admin`, `client_admin`

**Query Parameters:**
- `search` (string, optional): Search by name or email
- `role` (string, optional): Filter by role (`root_admin`, `client_admin`, `client_user`)
- `status` (string, optional): Filter by status (`active`, `inactive`)
- `clientId` (integer, optional): Filter by client ID (for root_admin)
- `page` (integer, optional): Page number for pagination (default: 1)
- `limit` (integer, optional): Number of results per page (default: 50)

**Example Request:**
```
GET /api/users?search=john&status=active&page=1&limit=20
```

**Response (200 OK):**
```json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "client_admin",
      "status": "active",
      "clientId": 1,
      "clientName": "Acme Corporation"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**Role-Specific Behavior:**
- `root_admin`: Can see all users across all clients
- `client_admin`: Can only see users within their client organization

#### PATCH /api/users/:userId/client

Update a user's client assignment.

**Access:** `root_admin` only

**Request Body:**
```json
{
  "clientId": 2
}
```

**Response (200 OK):**
```json
{
  "message": "User client updated successfully",
  "userId": 3,
  "clientId": 2
}
```

#### DELETE /api/users/:userId

Delete a user.

**Access:** `root_admin`, `client_admin` (for users in their client)

**Response (200 OK):**
```json
{
  "message": "User deleted successfully",
  "userId": 3
}
```

---

### Clients Management

#### GET /api/clients

Get a list of all clients.

**Access:** `root_admin` only

**Query Parameters:**
- `search` (string, optional): Search by client name
- `status` (string, optional): Filter by status (`active`, `inactive`)
- `page` (integer, optional): Page number for pagination
- `limit` (integer, optional): Number of results per page

**Response (200 OK):**
```json
{
  "clients": [
    {
      "id": 1,
      "name": "Acme Corporation",
      "adminName": "Bob Admin",
      "adminEmail": "admin@client.com",
      "status": "active"
    }
  ]
}
```

#### GET /api/clients/:clientId

Get details of a specific client.

**Access:** `root_admin` only

**Response (200 OK):**
```json
{
  "client": {
    "id": 1,
    "name": "Acme Corporation",
    "adminName": "Bob Admin",
    "adminEmail": "admin@client.com",
    "status": "active"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "Client not found"
}
```

#### GET /api/clients/:clientId/users

Get all users belonging to a specific client.

**Access:** `root_admin` only

**Response (200 OK):**
```json
{
  "users": [
    {
      "id": 2,
      "name": "Bob Admin",
      "email": "admin@client.com",
      "role": "client_admin",
      "status": "active",
      "clientId": 1,
      "clientName": "Acme Corporation"
    }
  ]
}
```

#### POST /api/clients

Create a new client organization.

**Access:** `root_admin` only

**Request Body:**
```json
{
  "clientName": "New Corporation",
  "adminName": "Jane Admin",
  "adminEmail": "jane@newcorp.com",
  "adminPassword": "secure_password"
}
```

**Response (200 OK):**
```json
{
  "client": {
    "id": 3,
    "name": "New Corporation",
    "adminName": "Jane Admin",
    "adminEmail": "jane@newcorp.com",
    "status": "active"
  },
  "message": "Client created successfully"
}
```

---

### Predictions

#### GET /api/predictions/matches

Get upcoming matches for predictions with server-side filtering.

**Access:** `client_admin`, `client_user`

**Query Parameters:**
- `league` (string, optional): Filter by league name
- `startDate` (string, optional): ISO date format - get matches from this date onwards
- `endDate` (string, optional): ISO date format - get matches up to this date
- `locked` (boolean, optional): Filter by locked status (true/false)

**Example Request:**
```
GET /api/predictions/matches?league=Premier%20League&startDate=2025-10-13&endDate=2025-10-20
```

**Response (200 OK):**
```json
{
  "matches": [
    {
      "id": 1,
      "homeTeam": "Manchester City",
      "awayTeam": "Arsenal",
      "date": "2025-10-13",
      "time": "15:00",
      "league": "Premier League",
      "locked": false
    }
  ]
}
```

**Implementation Notes:**
- Filter matches to only return those relevant to the user's time window
- Apply league filtering if specified
- Locked matches should include actual scores if available

#### GET /api/predictions/user

Get the authenticated user's predictions.

**Access:** `client_admin`, `client_user`

**Query Parameters:**
- `matchId` (integer, optional): Filter by specific match

**Response (200 OK):**
```json
{
  "predictions": [
    {
      "id": 1,
      "userId": 2,
      "userName": "Bob Admin",
      "email": "admin@client.com",
      "clientId": 1,
      "matchId": 1,
      "homeScore": 2,
      "awayScore": 1
    }
  ]
}
```

**Implementation Notes:**
- Return only predictions belonging to the authenticated user (from JWT token)
- Do NOT return other users' predictions unless the user is viewing rankings

#### POST /api/predictions

Create a new prediction.

**Access:** `client_admin`, `client_user`

**Request Body:**
```json
{
  "matchId": 1,
  "homeScore": 2,
  "awayScore": 1
}
```

**Response (200 OK):**
```json
{
  "prediction": {
    "id": 8,
    "userId": 2,
    "userName": "Bob Admin",
    "email": "admin@client.com",
    "clientId": 1,
    "matchId": 1,
    "homeScore": 2,
    "awayScore": 1
  },
  "message": "Prediction created successfully"
}
```

**Validation Rules:**
- Match must not be locked
- User can only create one prediction per match
- Scores must be non-negative integers

#### PUT /api/predictions/:predictionId

Update an existing prediction.

**Access:** `client_admin`, `client_user` (own predictions only)

**Request Body:**
```json
{
  "homeScore": 3,
  "awayScore": 1
}
```

**Response (200 OK):**
```json
{
  "prediction": {
    "id": 8,
    "userId": 2,
    "userName": "Bob Admin",
    "email": "admin@client.com",
    "clientId": 1,
    "matchId": 1,
    "homeScore": 3,
    "awayScore": 1
  },
  "message": "Prediction updated successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "message": "Prediction not found"
}
```

**Validation Rules:**
- Match must not be locked
- User can only update their own predictions
- Scores must be non-negative integers

---

### Rankings

#### GET /api/rankings

Get user rankings with server-side filtering.

**Access:** All authenticated users

**Query Parameters:**
- `clientId` (integer, optional): Filter by client ID (required for `root_admin`, ignored for others)

**Example Request:**
```
GET /api/rankings?clientId=1
```

**Response (200 OK):**
```json
{
  "rankings": [
    {
      "position": 1,
      "userId": 2,
      "userName": "Bob Admin",
      "email": "admin@client.com",
      "points": 25,
      "correctResults": 5,
      "correctWinners": 10,
      "totalPredictions": 15
    }
  ]
}
```

**Role-Specific Behavior:**
- `root_admin`: Must provide `clientId` parameter to see rankings for a specific client
- `client_admin`/`client_user`: Rankings are automatically filtered to their client (clientId from JWT token is used)

**Ranking Calculation:**
- Correct result (exact score): 3 points
- Correct winner (but wrong score): 1 point
- Rankings sorted by total points (descending), then by correct results (descending)

---

## Data Models

### User
```typescript
{
  id: number;
  name: string;
  email: string;
  role: 'root_admin' | 'client_admin' | 'client_user';
  status: 'active' | 'inactive';
  clientId: number | null;  // null for root_admin
  clientName: string | null;
}
```

### Client
```typescript
{
  id: number;
  name: string;
  adminName: string;
  adminEmail: string;
  status: 'active' | 'inactive';
}
```

### Match
```typescript
{
  id: number;
  homeTeam: string;
  awayTeam: string;
  date: string;  // ISO date format: YYYY-MM-DD
  time: string;  // HH:MM format
  league: string;
  locked: boolean;
  actualHomeScore?: number;  // Only present if match is locked/finished
  actualAwayScore?: number;  // Only present if match is locked/finished
}
```

### Prediction
```typescript
{
  id: number;
  userId: number;
  userName: string;
  email: string;
  clientId: number;
  matchId: number;
  homeScore: number;
  awayScore: number;
}
```

### Ranking Entry
```typescript
{
  position: number;
  userId: number;
  userName: string;
  email: string;
  points: number;
  correctResults: number;
  correctWinners: number;
  totalPredictions: number;
}
```

## Error Handling

All error responses follow this format:

```json
{
  "message": "Description of the error"
}
```

### HTTP Status Codes

- **200 OK**: Successful request
- **201 Created**: Resource successfully created
- **400 Bad Request**: Invalid request data or validation error
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User doesn't have permission to access the resource
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

### Common Error Scenarios

1. **Missing Authentication**
```json
Status: 401
{
  "message": "Authentication required"
}
```

2. **Insufficient Permissions**
```json
Status: 403
{
  "message": "Insufficient permissions to access this resource"
}
```

3. **Validation Error**
```json
Status: 400
{
  "message": "Invalid input: email is required"
}
```

## Server-Side Filtering

**Important:** All filtering, searching, and sorting MUST be performed on the server side, not on the client.

### Implementation Guidelines

1. **Always accept filter parameters as query parameters**
   - Use consistent naming: `search`, `status`, `role`, `clientId`, etc.
   - Support pagination: `page`, `limit`

2. **Apply role-based filtering automatically**
   - Extract user info from JWT token
   - Filter data based on user's role and client association
   - Don't rely on client to send correct clientId - always validate against token

3. **Return filtered and paginated results**
   - Include pagination metadata when applicable
   - Apply filters before pagination

4. **Examples of Server-Side Filtering:**

   **Users endpoint with search:**
   ```javascript
   // Client sends:
   GET /api/users?search=john&status=active
   
   // Server filters:
   // 1. Extract user from JWT token
   // 2. If client_admin, filter to their clientId
   // 3. Apply search filter on name/email
   // 4. Apply status filter
   // 5. Return filtered results
   ```

   **Matches endpoint with date range:**
   ```javascript
   // Client sends:
   GET /api/predictions/matches?startDate=2025-10-13&endDate=2025-10-20&league=Premier%20League
   
   // Server filters:
   // 1. Filter matches between startDate and endDate
   // 2. Apply league filter if provided
   // 3. Return only unlocked matches (or include locked with actual scores)
   ```

   **Rankings with client filter:**
   ```javascript
   // Client sends (root_admin):
   GET /api/rankings?clientId=1
   
   // Server filters:
   // 1. Verify user is root_admin OR extract clientId from token
   // 2. Calculate rankings only for users in that client
   // 3. Sort by points and return
   ```

### Migration from Client-Side to Server-Side Filtering

When implementing the server:

1. **Identify all client-side filters** (`.filter()`, `.map()`, etc. in frontend code)
2. **Move filtering logic to server endpoints**
3. **Update API endpoints to accept filter parameters**
4. **Update frontend to send filter parameters instead of filtering locally**
5. **Remove client-side filtering logic**

Example transformation:

**Before (Client-Side Filtering):**
```javascript
// Frontend code
const response = await api.get('/users');
const filteredUsers = response.data.users.filter(u => 
  u.name.toLowerCase().includes(searchTerm.toLowerCase())
);
```

**After (Server-Side Filtering):**
```javascript
// Frontend code
const response = await api.get('/users', { 
  params: { search: searchTerm } 
});
const users = response.data.users; // Already filtered by server
```

## Security Considerations

1. **JWT Token Validation**
   - Validate token on every request
   - Extract user information from token, don't trust client-sent data
   - Set appropriate token expiration

2. **Role-Based Access**
   - Always check user role before returning data
   - Filter data based on user's client association
   - Return 403 Forbidden for unauthorized access attempts

3. **Input Validation**
   - Validate all input data
   - Sanitize user inputs to prevent injection attacks
   - Enforce business rules (e.g., can't predict on locked matches)

4. **Data Isolation**
   - Ensure users can only access data from their client
   - root_admin can access all data
   - Prevent cross-client data leakage

## Implementation Checklist

- [ ] Set up authentication middleware to validate JWT tokens
- [ ] Implement role-based access control middleware
- [ ] Create database schema matching the data models
- [ ] Implement all endpoints with proper error handling
- [ ] Add server-side filtering for all list endpoints
- [ ] Validate user permissions on every request
- [ ] Test with different user roles
- [ ] Ensure client-side filtering is removed from frontend
- [ ] Implement rate limiting to prevent abuse
- [ ] Add logging for security events and errors

## Additional Notes

### Database Recommendations

- **PostgreSQL** or **MySQL** for relational data
- Consider adding indexes on frequently queried fields:
  - `users.email`
  - `users.clientId`
  - `predictions.userId`
  - `predictions.matchId`
  - `matches.date`

### Caching Strategy

Consider implementing caching for:
- `/api/predictions/matches` (matches don't change frequently)
- `/api/clients` (for root_admin)
- `/api/rankings` (can be cached with short TTL)

### Future Enhancements

- Real-time updates using WebSockets for live match scores
- Email notifications for match results
- Advanced analytics for root_admin
- Batch prediction creation
- Match result management endpoints for root_admin
- User profile management
- Password reset functionality
- Two-factor authentication

---

**Version:** 1.0  
**Last Updated:** 2025-10-12
