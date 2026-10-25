import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Google Maps Platform Quota Defense Listener
(window as any).gm_authFailure = () => {
  window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
};
const origError = console.error;
console.error = (...args: unknown[]) => {
  origError.apply(console, args);
  const msg = args.map((a) => String(a)).join(' ');
  if (msg.includes('OverQuotaMapError') || msg.includes('QuotaExceededError')) {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  }
};

const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);

// Axe Accessibility testing integration for Lighthouse & Axe audit compliance
if (import.meta.env.DEV) {
  import('axe-core')
    .then((axeModule) => {
      const axe = axeModule.default || axeModule;
      (window as any).axe = axe;

      setTimeout(() => {
        try {
          axe.run(document, { reporter: 'v2' })
            .then((results: any) => {
              if (results.violations && results.violations.length > 0) {
                console.groupCollapsed(`[Axe A11y] ${results.violations.length} catatan aksesibilitas ditemukan:`);
                results.violations.forEach((v: any) => {
                  console.info(`- [${v.impact?.toUpperCase()}] ${v.help}:`, v.nodes);
                });
                console.groupEnd();
              } else {
                console.info('[Axe A11y] Audit lolos: 0 pelanggaran aksesibilitas.');
              }
            })
            .catch((e: any) => {
              console.debug('Axe audit error:', e);
            });
        } catch (e) {
          console.debug('Axe run error:', e);
        }
      }, 1200);
    })
    .catch((err) => {
      console.warn('Axe-core initialization skipped:', err);
    });
}

root.render(<App />);
