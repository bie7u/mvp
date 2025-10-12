# FlowDesk - Modern SaaS Application

A fully responsive, mobile-first SaaS single-page application built with React, TailwindCSS, and role-based access control (RBAC).

## 🎯 Features

- **Authentication & RBAC**: Role-based access control with three user roles
  - `root_admin`: Full access to all pages and data
  - `client_admin`: Access to client-specific data and user management
  - `client_user`: Limited access (dashboard + analytics)
- **Modern UI**: Clean, professional design with TailwindCSS
- **Dark Mode**: Toggle between light and dark themes with persistence
- **Responsive Design**: Mobile-first approach with dedicated bottom navigation
- **Mock API**: Built-in Mock Service Worker for development and testing
- **Analytics Dashboard**: Interactive charts with Recharts
- **User Management**: Complete user administration interface

## 🧠 Tech Stack

- **Framework**: React 19+ (functional components + hooks)
- **Styling**: TailwindCSS v4
- **Routing**: React Router DOM v6
- **State Management**: Context API (Auth) + Zustand (Dark Mode)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **API Client**: Axios
- **Mock Backend**: Mock Service Worker (MSW)
- **Charts**: Recharts
- **Build Tool**: Vite

## 📦 Installation

```bash
npm install
npm run dev
```

## 🔐 Demo Credentials

- **Root Admin**: `root@flowdesk.com` / `password`
- **Client Admin**: `admin@client.com` / `password`
- **Client User**: `user@client.com` / `password`

## 🚀 Server Implementation

This application is ready for backend integration! The client implements **server-side filtering** and is fully documented for backend development.

### 📚 Documentation

- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API specifications with all endpoints, request/response formats, and filtering parameters
- **[SERVER_IMPLEMENTATION_GUIDE.md](./SERVER_IMPLEMENTATION_GUIDE.md)** - Step-by-step guide to implement the backend server with code examples
- **[CHANGES_SUMMARY.md](./CHANGES_SUMMARY.md)** - Overview of client-side changes for server-side filtering

### ✨ Key Features for Server Implementation

- **Server-Side Filtering**: All filtering (search, date range, league, etc.) happens on the server
- **JWT Authentication**: Token-based auth with role validation
- **Role-Based Access Control**: Three user roles with different permissions
- **RESTful API**: Clean, well-documented REST endpoints
- **Ready to Deploy**: Database schema, Docker config, and deployment guide included

### 🔧 Quick Start for Backend

1. Read `API_DOCUMENTATION.md` for complete API specs
2. Follow `SERVER_IMPLEMENTATION_GUIDE.md` for implementation
3. Implement endpoints with server-side filtering (examples provided)
4. Update frontend API URL to point to your server

## 📸 Screenshots

### Login Page
![Login](https://github.com/user-attachments/assets/c644e0da-de7d-42e7-ad59-7c4babc91497)

### Dashboard
![Dashboard](https://github.com/user-attachments/assets/60d1c1a2-f007-488e-b3a7-d1d652507207)

### Analytics
![Analytics](https://github.com/user-attachments/assets/5579284a-e828-4a15-a5c8-d6e1c6e86532)

### Users Management
![Users](https://github.com/user-attachments/assets/dfa7b7de-9e83-4431-89aa-c94e318ad055)
