import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import FloatingWidget from './components/FloatingWidget';
import tailwindStyles from './index.css?inline';

// Content script entry — injects DialPro widget into the page
function injectWidget() {
    // Don't inject twice
    if (document.getElementById('dialpro-root')) return;

    // Create host element
    const host = document.createElement('div');
    host.id = 'dialpro-root';
    host.style.cssText = 'all: initial; position: fixed; z-index: 2147483647; top: 0; left: 0; width: 0; height: 0;';
    document.body.appendChild(host);

    // Create shadow DOM for style isolation
    const shadow = host.attachShadow({ mode: 'open' });

    // Inject styles (Tailwind + Theme) into shadow root
    const styleEl = document.createElement('style');
    styleEl.textContent = tailwindStyles;
    shadow.appendChild(styleEl);

    // Add Google Fonts link
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap';
    shadow.appendChild(fontLink);

    // Create React mount point inside shadow DOM
    const mountPoint = document.createElement('div');
    mountPoint.id = 'dialpro-mount';
    shadow.appendChild(mountPoint);

    // Render React app
    const root = createRoot(mountPoint);
    root.render(
        <StrictMode>
            <AuthProvider>
                <FloatingWidget shadowRoot={shadow} />
            </AuthProvider>
        </StrictMode>
    );
}


// Wait for page to be ready, then inject
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(injectWidget, 500);
} else {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(injectWidget, 500);
    });
}
