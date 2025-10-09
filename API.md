# API Documentation

## Authentication

All API endpoints (except login) require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Login
**POST** `/api/auth/login/`

Request:
```json
{
  "username": "string",
  "password": "string"
}
```

Response:
```json
{
  "access": "string",
  "refresh": "string"
}
```

### Refresh Token
**POST** `/api/auth/refresh/`

Request:
```json
{
  "refresh": "string"
}
```

Response:
```json
{
  "access": "string"
}
```

## Users

### Get Current User Profile
**GET** `/api/users/profile/`

Response:
```json
{
  "id": 1,
  "username": "string",
  "email": "string",
  "first_name": "string",
  "last_name": "string",
  "nickname": "string",
  "role": "employee|client_admin|root_admin",
  "company": 1,
  "profile_picture": "string",
  "email_notifications": true
}
```

### Update Profile
**PATCH** `/api/users/profile/`

Request:
```json
{
  "nickname": "string",
  "email": "string",
  "first_name": "string",
  "last_name": "string",
  "email_notifications": true
}
```

### Change Password
**POST** `/api/users/change_password/`

Request:
```json
{
  "old_password": "string",
  "new_password": "string",
  "new_password2": "string"
}
```

### List Users (Admin only)
**GET** `/api/users/`

Query Parameters:
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20)

### Create User (Root Admin only)
**POST** `/api/users/`

Request:
```json
{
  "username": "string",
  "email": "string",
  "first_name": "string",
  "last_name": "string",
  "password": "string",
  "password2": "string",
  "company": 1,
  "role": "employee|client_admin"
}
```

### Resend Invitation (Client Admin)
**POST** `/api/users/{id}/resend_invitation/`

## Companies

### List Companies (Root Admin only)
**GET** `/api/companies/`

Response:
```json
{
  "results": [
    {
      "id": 1,
      "name": "string",
      "description": "string",
      "is_active": true,
      "employee_count": 10,
      "leagues": [...],
      "scoring_config": {...},
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Create Company (Root Admin only)
**POST** `/api/companies/`

Request:
```json
{
  "name": "string",
  "description": "string",
  "is_active": true
}
```

### Assign League to Company
**POST** `/api/companies/{id}/assign_league/`

Request:
```json
{
  "league_id": 1
}
```

### Get/Update Scoring Config
**GET/PATCH** `/api/companies/{id}/scoring_config/`

Request (PATCH):
```json
{
  "correct_score_points": 3,
  "correct_outcome_points": 1
}
```

## Leagues

### List Leagues
**GET** `/api/leagues/`

Query Parameters:
- `is_active`: Filter by active status (true/false)

Response:
```json
{
  "results": [
    {
      "id": 1,
      "name": "premier_league",
      "league_display_name": "Premier League",
      "api_football_id": 39,
      "country": "England",
      "season": "2023-2024",
      "is_active": true
    }
  ]
}
```

### Create League (Root Admin only)
**POST** `/api/leagues/`

Request:
```json
{
  "name": "premier_league",
  "api_football_id": 39,
  "country": "England",
  "season": "2023-2024",
  "is_active": true
}
```

### List League Standings
**GET** `/api/leagues/standings/`

Query Parameters:
- `league`: Filter by league ID

Response:
```json
{
  "results": [
    {
      "id": 1,
      "league": 1,
      "league_name": "Premier League",
      "rank": 1,
      "team_name": "Manchester City",
      "team_logo": "https://...",
      "played": 38,
      "won": 28,
      "drawn": 5,
      "lost": 5,
      "goals_for": 94,
      "goals_against": 33,
      "goal_difference": 61,
      "points": 89,
      "form": "WWDWL",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Get Standing Details
**GET** `/api/leagues/standings/{id}/`

Response:
```json
{
  "id": 1,
  "league": 1,
  "league_name": "Premier League",
  "rank": 1,
  "team_name": "Manchester City",
  "team_logo": "https://...",
  "played": 38,
  "won": 28,
  "drawn": 5,
  "lost": 5,
  "goals_for": 94,
  "goals_against": 33,
  "goal_difference": 61,
  "points": 89,
  "form": "WWDWL",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## Matches

### List Matches
**GET** `/api/matches/`

Query Parameters:
- `league`: Filter by league ID
- `status`: Filter by status (scheduled, live, finished)
- `round`: Filter by round
- `date_from`: Filter by start date (ISO format)
- `date_to`: Filter by end date (ISO format)
- `page`: Page number
- `page_size`: Items per page

Response:
```json
{
  "results": [
    {
      "id": 1,
      "league": 1,
      "league_name": "Premier League",
      "home_team": "Team A",
      "away_team": "Team B",
      "round": "Round 1",
      "kickoff_time": "2024-01-15T15:00:00Z",
      "status": "scheduled",
      "status_display": "Scheduled",
      "home_score": null,
      "away_score": null,
      "is_prediction_locked": false
    }
  ]
}
```

### Get Match Details
**GET** `/api/matches/{id}/`

## Predictions

### List Predictions
**GET** `/api/predictions/`

Query Parameters:
- `match`: Filter by match ID
- `user`: Filter by user ID
- `page`: Page number

Response:
```json
{
  "results": [
    {
      "id": 1,
      "user": 1,
      "username": "employee1",
      "match": 1,
      "match_details": {...},
      "home_score": 2,
      "away_score": 1,
      "points_earned": 3,
      "created_at": "2024-01-14T10:00:00Z"
    }
  ]
}
```

### Create Prediction
**POST** `/api/predictions/`

Request:
```json
{
  "match": 1,
  "home_score": 2,
  "away_score": 1
}
```

### Update Prediction
**PATCH** `/api/predictions/{id}/`

Request:
```json
{
  "home_score": 3,
  "away_score": 1
}
```

**Note**: Predictions can only be created/updated before match kickoff.

### Delete Prediction
**DELETE** `/api/predictions/{id}/`

**Note**: Predictions can only be deleted before match kickoff.

## Rankings

### List Rankings
**GET** `/api/rankings/`

Query Parameters:
- `company`: Filter by company ID
- `period`: Filter by period (week, month, season)
- `period_identifier`: Filter by period identifier (e.g., "2024-W01", "2024-01", "2023-2024")

Response:
```json
{
  "results": [
    {
      "id": 1,
      "user": 1,
      "username": "employee1",
      "user_nickname": "Player 1",
      "company": 1,
      "company_name": "Test Company",
      "period": "season",
      "period_display": "Season",
      "period_identifier": "2023-2024",
      "total_points": 25,
      "rank": 1,
      "updated_at": "2024-01-15T12:00:00Z"
    }
  ]
}
```

### Update Rankings (Admin only)
**POST** `/api/rankings/update_rankings/`

Request:
```json
{
  "company_id": 1,
  "period": "season",
  "period_identifier": "2023-2024"
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "field_name": ["Error message"]
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error."
}
```

## Rate Limiting

API requests are rate-limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## Pagination

List endpoints support pagination with the following parameters:
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20, max: 100)

Response includes pagination metadata:
```json
{
  "count": 100,
  "next": "http://api.example.com/endpoint/?page=2",
  "previous": null,
  "results": [...]
}
```

## Filtering and Ordering

Many list endpoints support filtering and ordering:
- Use query parameters for filtering (e.g., `?status=active`)
- Use `ordering` parameter for sorting (e.g., `?ordering=-created_at`)
- Prefix with `-` for descending order

## API Versioning

The API is currently at version 1. Future versions will be accessible via:
```
/api/v2/...
```
