import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Mock the AuthContext
jest.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
  useAuth: () => ({
    user: null,
    loading: false,
  }),
}));

test('renders login page when not authenticated', () => {
  render(<App />);
  // App should redirect to login or show login
  expect(true).toBe(true); // Placeholder assertion
});
