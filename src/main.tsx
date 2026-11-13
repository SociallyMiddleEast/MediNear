import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './styles.css';
import { enableDragScroll } from './services/dragScroll';

enableDragScroll();

// HashRouter: works on GitHub Pages (no server rewrites) and inside the
// Capacitor iOS/Android shells without any extra configuration.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>,
);
