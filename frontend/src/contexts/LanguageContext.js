import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    // Navbar
    footballPredictions: 'Football Predictions',
    logout: 'Logout',
    
    // Login
    welcomeBack: 'Welcome back! Please login to continue',
    username: 'Username',
    password: 'Password',
    enterUsername: 'Enter your username',
    enterPassword: 'Enter your password',
    loggingIn: 'Logging in...',
    login: 'Login',
    invalidCredentials: 'Invalid username or password',
    userRoles: 'User Roles',
    rootAdmin: 'Root Admin',
    clientAdmin: 'Client Admin',
    user: 'User',
    manageClientsUsers: 'Manage clients & users',
    manageUsersPredict: 'Manage users & predict',
    predictMatches: 'Predict matches',
    
    // Admin Dashboard
    rootAdminDashboard: 'Root Admin Dashboard',
    manageClientsUsersMatches: 'Manage clients, users, and matches',
    totalUsers: 'Total Users',
    activeClients: 'Active Clients',
    totalMatches: 'Total Matches',
    totalBets: 'Total Bets',
    upcomingMatches: 'Upcoming Matches',
    finishedMatches: 'Finished Matches',
    manageClients: 'Manage Clients',
    addEditManageClients: 'Add, edit, and manage client organizations',
    manageUsers: 'Manage Users',
    createManageUserAccounts: 'Create and manage user accounts',
    manageMatches: 'Manage Matches',
    addMatchesUpdateResults: 'Add matches and update results',
    globalLeaderboard: 'Global Leaderboard',
    viewGlobalRankings: 'View global rankings and statistics',
    viewBets: 'View Bets',
    monitorAllPredictions: 'Monitor all user predictions',
    rootAdminPermissions: 'Root Admin Permissions',
    rootAdminPermissionsDesc: 'As a Root Admin, you can manage clients, users, and matches, but you cannot make predictions. This role is focused on customer service and system management.',
    
    // Client Dashboard
    dashboard: 'Dashboard',
    yourPoints: 'Your Points',
    youCanManageUsers: 'You can manage users for your company',
    upcomingMatchesTitle: 'Upcoming Matches',
    noUpcomingMatches: 'No upcoming matches',
    vs: 'vs',
    predict: 'Predict',
    viewAllMatches: 'View All Matches',
    myRecentPredictions: 'My Recent Predictions',
    noPredictions: 'No predictions yet',
    startPredicting: 'Start predicting to earn points!',
    yourPrediction: 'Your prediction',
    points: 'points',
    pending: 'Pending',
    viewAllPredictions: 'View All Predictions',
    topPlayers: 'Top Players',
    noRankings: 'No rankings available',
    rank: 'Rank',
    player: 'Player',
    accuracy: 'Accuracy',
    viewFullLeaderboard: 'View Full Leaderboard',
    
    // Common
    loading: 'Loading...',
  },
  pl: {
    // Navbar
    footballPredictions: 'Typy Piłkarskie',
    logout: 'Wyloguj',
    
    // Login
    welcomeBack: 'Witaj ponownie! Zaloguj się, aby kontynuować',
    username: 'Nazwa użytkownika',
    password: 'Hasło',
    enterUsername: 'Wprowadź nazwę użytkownika',
    enterPassword: 'Wprowadź hasło',
    loggingIn: 'Logowanie...',
    login: 'Zaloguj',
    invalidCredentials: 'Nieprawidłowa nazwa użytkownika lub hasło',
    userRoles: 'Role użytkowników',
    rootAdmin: 'Administrator główny',
    clientAdmin: 'Administrator klienta',
    user: 'Użytkownik',
    manageClientsUsers: 'Zarządzaj klientami i użytkownikami',
    manageUsersPredict: 'Zarządzaj użytkownikami i typuj',
    predictMatches: 'Typuj mecze',
    
    // Admin Dashboard
    rootAdminDashboard: 'Panel Administratora Głównego',
    manageClientsUsersMatches: 'Zarządzaj klientami, użytkownikami i meczami',
    totalUsers: 'Wszyscy użytkownicy',
    activeClients: 'Aktywni klienci',
    totalMatches: 'Wszystkie mecze',
    totalBets: 'Wszystkie typy',
    upcomingMatches: 'Nadchodzące mecze',
    finishedMatches: 'Zakończone mecze',
    manageClients: 'Zarządzaj klientami',
    addEditManageClients: 'Dodaj, edytuj i zarządzaj organizacjami klientów',
    manageUsers: 'Zarządzaj użytkownikami',
    createManageUserAccounts: 'Twórz i zarządzaj kontami użytkowników',
    manageMatches: 'Zarządzaj meczami',
    addMatchesUpdateResults: 'Dodawaj mecze i aktualizuj wyniki',
    globalLeaderboard: 'Globalna tabela',
    viewGlobalRankings: 'Zobacz globalne rankingi i statystyki',
    viewBets: 'Zobacz typy',
    monitorAllPredictions: 'Monitoruj wszystkie typy użytkowników',
    rootAdminPermissions: 'Uprawnienia Administratora Głównego',
    rootAdminPermissionsDesc: 'Jako Administrator Główny możesz zarządzać klientami, użytkownikami i meczami, ale nie możesz typować. Ta rola koncentruje się na obsłudze klienta i zarządzaniu systemem.',
    
    // Client Dashboard
    dashboard: 'Panel',
    yourPoints: 'Twoje punkty',
    youCanManageUsers: 'Możesz zarządzać użytkownikami swojej firmy',
    upcomingMatchesTitle: 'Nadchodzące mecze',
    noUpcomingMatches: 'Brak nadchodzących meczów',
    vs: 'vs',
    predict: 'Typuj',
    viewAllMatches: 'Zobacz wszystkie mecze',
    myRecentPredictions: 'Moje ostatnie typy',
    noPredictions: 'Brak typów',
    startPredicting: 'Zacznij typować, aby zdobyć punkty!',
    yourPrediction: 'Twój typ',
    points: 'punkty',
    pending: 'Oczekujące',
    viewAllPredictions: 'Zobacz wszystkie typy',
    topPlayers: 'Najlepsi gracze',
    noRankings: 'Brak rankingu',
    rank: 'Miejsce',
    player: 'Gracz',
    accuracy: 'Celność',
    viewFullLeaderboard: 'Zobacz pełną tabelę',
    
    // Common
    loading: 'Ładowanie...',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'pl' : 'en');
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
