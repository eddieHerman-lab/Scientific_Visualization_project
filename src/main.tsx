import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept third-party browser extension noise (e.g., MetaMask, web3 injectors)
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason?.message?.includes?.('MetaMask') ||
      event.reason?.message?.includes?.('ethereum') ||
      event.reason?.message?.includes?.('Failed to connect to MetaMask') ||
      event.reason?.toString?.().includes?.('MetaMask')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener('error', (event) => {
    if (
      event.message?.includes?.('MetaMask') ||
      event.message?.includes?.('ethereum') ||
      event.message?.includes?.('Failed to connect to MetaMask')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
