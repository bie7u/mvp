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

## 📸 Screenshots

### Login Page
![Login](https://github.com/user-attachments/assets/c644e0da-de7d-42e7-ad59-7c4babc91497)

### Dashboard
![Dashboard](https://github.com/user-attachments/assets/60d1c1a2-f007-488e-b3a7-d1d652507207)

### Analytics
![Analytics](https://github.com/user-attachments/assets/5579284a-e828-4a15-a5c8-d6e1c6e86532)

### Users Management
![Users](https://github.com/user-attachments/assets/dfa7b7de-9e83-4431-89aa-c94e318ad055)
