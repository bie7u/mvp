# API Integration Guide

This document explains how to integrate the FlowDesk client application with a real backend API.

## Overview

The application is configured to work with both:
- **Mock API** (using Mock Service Worker - MSW) for development
- **Real API** for production deployments

The configuration is managed through environment variables, making it easy to switch between modes.

## Configuration

### Environment Variables

The application uses the following environment variables:

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `VITE_USE_MOCK_API` | Enable/disable mock API | `true` | `true` or `false` |
| `VITE_API_BASE_URL` | Base URL for real API | `/api` | `https://api.example.com/api` |

### Environment Files

- `.env` - Local development configuration (not tracked in git)
- `.env.example` - Example configuration file (tracked in git)
- `.env.production` - Production configuration template

## Setup Instructions

### Development with Mock API (Default)

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Ensure mock API is enabled in `.env`:
   ```env
   VITE_USE_MOCK_API=true
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will use Mock Service Worker to intercept API calls and return mock data.

### Development with Real API

1. Update your `.env` file:
   ```env
   VITE_USE_MOCK_API=false
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

2. Make sure your backend API is running on the specified URL

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will make real HTTP requests to your backend API.

### Production Deployment

1. Configure environment variables for your production environment:
   ```env
   VITE_USE_MOCK_API=false
   VITE_API_BASE_URL=https://api.yourdomain.com/api
   ```

2. Build the application:
   ```bash
   npm run build
   ```

3. Deploy the `dist` folder to your hosting provider

## API Endpoints

The client expects the following API endpoints to be available:

### Authentication
- `POST /api/login` - User login
  - Request: `{ email: string, password: string }`
  - Response: `{ token: string, user: { id, name, email, role } }`

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
  - Response: `{ totalUsers, activeClients, revenue, growth }`

### Analytics
- `GET /api/analytics` - Get analytics data
  - Response: `{ data: Array<{ name, users, revenue }> }`

### Users
- `GET /api/users` - Get all users
  - Response: `{ users: Array<User> }`
- `PATCH /api/users/:userId/client` - Update user's client
  - Request: `{ clientId: number }`
- `DELETE /api/users/:userId` - Delete a user

### Clients
- `GET /api/clients` - Get all clients
  - Response: `{ clients: Array<Client> }`
- `GET /api/clients/:clientId` - Get client by ID
  - Response: `{ client: Client }`
- `GET /api/clients/:clientId/users` - Get users for a client
  - Response: `{ users: Array<User> }`
- `POST /api/clients` - Create a new client
  - Request: `{ clientName, adminName, adminEmail, adminPassword }`

### Predictions
- `GET /api/predictions/matches` - Get upcoming matches
  - Response: `{ matches: Array<Match> }`
- `GET /api/predictions/user` - Get user's predictions
  - Response: `{ predictions: Array<Prediction> }`
- `POST /api/predictions` - Create a prediction
  - Request: `{ matchId, homeScore, awayScore }`
- `PUT /api/predictions/:predictionId` - Update a prediction
  - Request: `{ homeScore, awayScore }`

### Rankings
- `GET /api/rankings?clientId=X` - Get rankings for a client
  - Response: `{ rankings: Array<RankingEntry> }`

## Authentication

All authenticated requests include a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

The token is automatically added by the Axios interceptor in `src/services/api.js` and is stored in `localStorage` after successful login.

## CORS Configuration

Make sure your backend API is configured to accept requests from your frontend domain. Example CORS configuration:

```javascript
// Express.js example
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

## Troubleshooting

### Mock API not working
- Ensure `VITE_USE_MOCK_API=true` in your `.env` file
- Check that `public/mockServiceWorker.js` exists
- Open browser console and look for MSW logs

### Real API connection issues
- Verify `VITE_USE_MOCK_API=false` in your `.env` file
- Check that `VITE_API_BASE_URL` points to the correct backend URL
- Ensure backend API is running and accessible
- Check CORS configuration on the backend
- Inspect network requests in browser DevTools

### Environment variables not loading
- Restart the development server after changing `.env` files
- Ensure environment variable names start with `VITE_`
- Check that `.env` file is in the project root directory

## Additional Resources

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Mock Service Worker Documentation](https://mswjs.io/docs/)
- [Axios Documentation](https://axios-http.com/docs/intro)
