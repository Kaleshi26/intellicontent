// frontend/src/App.js
// Main application component
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';

// Theme and animations
import { lightTheme, darkTheme } from './themes/theme';
import { pageVariants, pageTransition } from './animations/animations';

// Context providers
import { ThemeContext } from './contexts/ThemeContext';
import { AuthContext } from './contexts/AuthContext';
import { NotificationContext } from './contexts/NotificationContext';

// Components
import Layout from './components/Layout';
import ErrorFallback from './components/ErrorFallback';
import LoadingScreen from './components/LoadingScreen';
import CommandPalette from './components/CommandPalette';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Generate from './pages/Generate';
import History from './pages/History';
import Templates from './pages/Templates';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Admin from './pages/Admin';
import SharedContent from './pages/SharedContent';
import NotFound from './pages/NotFound';

// Services
import { authService } from './services/api';

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Private route component
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = React.useContext(AuthContext);
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public route component (redirects to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = React.useContext(AuthContext);
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};

// Error fallback component
function ErrorFallbackComponent({ error, resetErrorBoundary }) {
  return <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />;
}

function App() {
  const [theme, setTheme] = useState(lightTheme);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDarkMode(shouldUseDark);
    setTheme(shouldUseDark ? darkTheme : lightTheme);
  }, []);

  // Theme toggle function
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    setTheme(newTheme ? darkTheme : lightTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  // Auth context value
  const authContextValue = {
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
    isLoading,
    login: async (username, password) => {
      try {
        const response = await authService.login(username, password);
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
        return response;
      } catch (error) {
        throw error;
      }
    },
    logout: async () => {
      try {
        await authService.logout();
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        setUser(null);
        setIsAuthenticated(false);
      }
    },
    updateUser: (userData) => {
      setUser(userData);
    },
  };

  // Theme context value
  const themeContextValue = {
    isDarkMode,
    toggleTheme,
    theme,
  };

  // Notification context value
  const notificationContextValue = {
    notifications,
    setNotifications,
    addNotification: (notification) => {
      setNotifications(prev => [...prev, notification]);
    },
    removeNotification: (id) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    },
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallbackComponent}>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeContext.Provider value={themeContextValue}>
            <AuthContext.Provider value={authContextValue}>
              <NotificationContext.Provider value={notificationContextValue}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
                <Layout>
                      <AnimatePresence mode="wait">
          <Routes>
                          {/* Public routes */}
                          <Route path="/" element={<LandingPage />} />
                          <Route
                            path="/login"
                            element={
                              <PublicRoute>
                                <motion.div
                                  initial="initial"
                                  animate="in"
                                  exit="out"
                                  variants={pageVariants}
                                  transition={pageTransition}
                                >
                                  <Login />
                                </motion.div>
                              </PublicRoute>
                            }
                          />
                          <Route
                            path="/register"
                            element={
                              <PublicRoute>
                                <motion.div
                                  initial="initial"
                                  animate="in"
                                  exit="out"
                                  variants={pageVariants}
                                  transition={pageTransition}
                                >
                                  <Register />
                                </motion.div>
                              </PublicRoute>
                            }
                          />
                          <Route
                            path="/verify-email"
                            element={
                              <PublicRoute>
                                <motion.div
                                  initial="initial"
                                  animate="in"
                                  exit="out"
                                  variants={pageVariants}
                                  transition={pageTransition}
                                >
                                  <VerifyEmail />
                                </motion.div>
                              </PublicRoute>
                            }
                          />
                          <Route
                            path="/forgot-password"
                            element={
                              <PublicRoute>
                                <motion.div
                                  initial="initial"
                                  animate="in"
                                  exit="out"
                                  variants={pageVariants}
                                  transition={pageTransition}
                                >
                                  <ForgotPassword />
                                </motion.div>
                              </PublicRoute>
                            }
                          />
                          <Route
                            path="/reset-password"
                            element={
                              <PublicRoute>
                                <motion.div
                                  initial="initial"
                                  animate="in"
                                  exit="out"
                                  variants={pageVariants}
                                  transition={pageTransition}
                                >
                                  <ResetPassword />
                                </motion.div>
                              </PublicRoute>
                            }
                          />
                          <Route
                            path="/shared/:shareToken"
                            element={
                              <motion.div
                                initial="initial"
                                animate="in"
                                exit="out"
                                variants={pageVariants}
                                transition={pageTransition}
                              >
                                <SharedContent />
                              </motion.div>
                            }
                          />

                          {/* Private routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                                <motion.div
                                  initial="initial"
                                  animate="in"
                                  exit="out"
                                  variants={pageVariants}
                                  transition={pageTransition}
                                >
                  <Dashboard />
                                </motion.div>
                </PrivateRoute>
              }
            />
            <Route
              path="/generate"
              element={
                <PrivateRoute>
                                <motion.div
                                  initial="initial"
                                  animate="in"
                                  exit="out"
                                  variants={pageVariants}
                                  transition={pageTransition}
                                >
                  <Generate />
                                </motion.div>
                </PrivateRoute>
              }
            />
            <Route
              path="/history"
              element={
                <PrivateRoute>
                                <motion.div
                                  initial="initial"
                                  animate="in"
                                  exit="out"
                                  variants={pageVariants}
                                  transition={pageTransition}
                                >
                  <History />
                                </motion.div>
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/templates"
                            element={
                              <PrivateRoute>
                                <motion.div
                                  initial="initial"
                                  animate="in"
                                  exit="out"
                                  variants={pageVariants}
                                  transition={pageTransition}
                                >
                                  <Templates />
                                </motion.div>
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/profile"
                            element={
                              <PrivateRoute>
                                <motion.div
                                  initial="initial"
                                  animate="in"
                                  exit="out"
                                  variants={pageVariants}
                                  transition={pageTransition}
                                >
                                  <Profile />
                                </motion.div>
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/settings"
                            element={
                              <PrivateRoute>
                                <motion.div
                                  initial="initial"
                                  animate="in"
                                  exit="out"
                                  variants={pageVariants}
                                  transition={pageTransition}
                                >
                                  <Settings />
                                </motion.div>
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/analytics"
                            element={
                              <PrivateRoute>
                                <motion.div
                                  initial="initial"
                                  animate="in"
                                  exit="out"
                                  variants={pageVariants}
                                  transition={pageTransition}
                                >
                                  <Analytics />
                                </motion.div>
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/admin"
                            element={
                              <PrivateRoute>
                                <motion.div
                                  initial="initial"
                                  animate="in"
                                  exit="out"
                                  variants={pageVariants}
                                  transition={pageTransition}
                                >
                                  <Admin />
                                </motion.div>
                </PrivateRoute>
              }
            />

                          {/* 404 route */}
                          <Route
                            path="*"
                            element={
                              <motion.div
                                initial="initial"
                                animate="in"
                                exit="out"
                                variants={pageVariants}
                                transition={pageTransition}
                              >
                                <NotFound />
                              </motion.div>
                            }
                          />
          </Routes>
                      </AnimatePresence>
        </Layout>
                    
                    {/* Command Palette */}
                    <CommandPalette />
      </Router>
                  
                  {/* Toast notifications */}
                  <Toaster
                    position="bottom-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: isDarkMode ? '#1a1a1a' : '#ffffff',
                        color: isDarkMode ? '#ffffff' : '#000000',
                        border: `1px solid ${isDarkMode ? '#333333' : '#e0e0e0'}`,
                        borderRadius: '12px',
                        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
                      },
                    }}
                  />
    </ThemeProvider>
              </NotificationContext.Provider>
            </AuthContext.Provider>
          </ThemeContext.Provider>
          {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;