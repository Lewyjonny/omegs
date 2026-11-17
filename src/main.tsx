import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App as NativeApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import App from './App';
import { AuthProvider } from './hooks/useAuth';
import { SiteContentProvider } from './hooks/useSiteContent';
import './index.css';

if (import.meta.env.MODE === 'pages' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => undefined);
  });
}

if (Capacitor.isNativePlatform()) {
  NativeApp.addListener('backButton', ({ canGoBack }) => (canGoBack ? window.history.back() : NativeApp.exitApp()));
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <SiteContentProvider>
          <App />
        </SiteContentProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
