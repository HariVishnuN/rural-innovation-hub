import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './app/AuthContext';
import { UltraLiteProvider } from './app/UltraLiteContext';
import { OfflineProvider } from './app/OfflineContext';
import { AppRoutes } from './app/routes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UltraLiteProvider>
          <OfflineProvider>
            <AppRoutes />
          </OfflineProvider>
        </UltraLiteProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
