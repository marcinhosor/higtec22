import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // SW registration failed silently
    });
  });
}

// Prefetch pages after initial load
setTimeout(() => {
  import('@/pages/Dashboard');
  import('@/pages/Agenda');
  import('@/pages/Clientes');
  import('@/pages/Orcamentos');
}, 1500);

createRoot(document.getElementById("root")!).render(<App />);
