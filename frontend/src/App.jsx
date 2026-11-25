import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './app/AuthContext';
import { UltraLiteProvider } from './app/UltraLiteContext';
import { OfflineProvider } from './app/OfflineContext';
import { ToastProvider } from './components/Toast';
import { AppRoutes } from './app/routes';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <UltraLiteProvider>
            <OfflineProvider>
              <ToastProvider>
                <AppRoutes />
              </ToastProvider>
            </OfflineProvider>
          </UltraLiteProvider>
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
