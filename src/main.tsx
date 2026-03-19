import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import App from './App.tsx';
import { useAppStore } from './store/useAppStore';
import { initAppState } from './services/storage';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker for auto-updates
registerSW({ immediate: true });

// Bootstrap: load persisted state then render
async function bootstrap() {
  const persisted = await initAppState();
  useAppStore.getState().hydrate(persisted);

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

bootstrap().catch(console.error);
