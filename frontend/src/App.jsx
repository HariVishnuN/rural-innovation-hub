import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './app/AuthContext';
import { UltraLiteProvider } from './app/UltraLiteContext';
import { OfflineProvider } from './app/OfflineContext';
import { ToastProvider } from './components/Toast';
import { AppRoutes } from './app/routes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UltraLiteProvider>
          <OfflineProvider>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </OfflineProvider>
        </UltraLiteProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
