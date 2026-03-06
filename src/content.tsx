import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import FloatingWidget from './components/FloatingWidget';
// import FloatingWidget from './components/FloatingWidget';

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

    // Inject styles into shadow root
    const styleEl = document.createElement('style');
    styleEl.textContent = getWidgetStyles();
    shadow.appendChild(styleEl);

    // Add Google Fonts link
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap';
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

function getWidgetStyles() {
    return `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');

:host {
    all: initial;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* ─── CSS Variables ─── */
#dialpro-mount {
    --bg-body: #0e0e0e;
    --bg-primary: #141414;
    --bg-card: #1a1a1a;
    --bg-input: #0a0a0a;
    --bg-section: #1e1e1e;
    --border-primary: #2a2a2a;
    --border-subtle: #222;
    --border-muted: #1e1e1e;
    --border-strong: #333;
    --text-white: #fff;
    --text-primary: #e8e8e8;
    --text-secondary: #aaa;
    --text-muted: #888;
    --text-dim: #666;
    --text-faint: #555;
    --text-ghost: #444;
    --text-invisible: #333;
    --accent-gold: #f0a500;
    --accent-green: #00c853;
    --accent-red: #ff3b30;
    --accent-blue: #64b5f6;
    --accent-purple: #ce93d8;
    --accent-ai: #4caf50;
    --font-sans: 'IBM Plex Sans', sans-serif;
    --font-mono: 'IBM Plex Mono', monospace;
    font-family: var(--font-sans);
    color: var(--text-primary);
}

/* ─── Floating Pill ─── */
.dp-pill {
    position: fixed;
    display: flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #1a1a1a 0%, #0e0e0e 100%);
    border: 1px solid #2a2a2a;
    border-radius: 28px;
    padding: 8px 14px 8px 10px;
    cursor: grab;
    user-select: none;
    box-shadow: 0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(240,165,0,0.1);
    transition: box-shadow 0.3s, border-color 0.3s;
    z-index: 2147483647;
}

.dp-pill:hover {
    border-color: rgba(240,165,0,0.4);
    box-shadow: 0 4px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(240,165,0,0.3), 0 0 20px rgba(240,165,0,0.08);
}

.dp-pill:active {
    cursor: grabbing;
}

.dp-pill-logo {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f0a500, #e09000);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    color: #000;
    font-family: var(--font-mono);
    flex-shrink: 0;
}

.dp-pill-text {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #aaa;
    white-space: nowrap;
}

.dp-pill-status {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #00c853;
    animation: dp-pulse 1.5s infinite;
    flex-shrink: 0;
}

@keyframes dp-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
}

/* ─── Hover Actions (expand button) ─── */
.dp-pill-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-left: 4px;
    opacity: 0;
    max-width: 0;
    overflow: hidden;
    transition: opacity 0.2s, max-width 0.3s;
}

.dp-pill:hover .dp-pill-actions {
    opacity: 1;
    max-width: 80px;
}

.dp-expand-btn {
    background: rgba(240,165,0,0.15);
    border: 1px solid rgba(240,165,0,0.3);
    border-radius: 4px;
    padding: 4px 8px;
    font-family: var(--font-mono);
    font-size: 8px;
    letter-spacing: 1px;
    color: #f0a500;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s;
}

.dp-expand-btn:hover {
    background: rgba(240,165,0,0.25);
    border-color: rgba(240,165,0,0.5);
}

.dp-close-pill-btn {
    background: rgba(255,59,48,0.12);
    border: 1px solid rgba(255,59,48,0.3);
    border-radius: 4px;
    padding: 4px 6px;
    font-size: 10px;
    color: #ff3b30;
    cursor: pointer;
    line-height: 1;
    transition: all 0.15s;
}

.dp-close-pill-btn:hover {
    background: rgba(255,59,48,0.25);
}

/* ─── Expanded Panel ─── */
.dp-panel {
    position: fixed;
    width: 380px;
    max-height: 520px;
    background: var(--bg-primary);
    border: 1px solid #2a2a2a;
    border-radius: 12px;
    box-shadow: 0 8px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(240,165,0,0.08);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 2147483647;
    animation: dp-slideIn 0.25s ease-out;
}

@keyframes dp-slideIn {
    from {
        opacity: 0;
        transform: translateY(10px) scale(0.97);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* Panel Header / Drag Bar */
.dp-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: #111;
    border-bottom: 1px solid var(--border-subtle);
    cursor: grab;
    user-select: none;
    flex-shrink: 0;
}

.dp-panel-header:active {
    cursor: grabbing;
}

.dp-panel-title {
    display: flex;
    align-items: center;
    gap: 8px;
}

.dp-panel-logo {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f0a500, #e09000);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: #000;
    font-family: var(--font-mono);
}

.dp-panel-label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--text-secondary);
}

.dp-panel-controls {
    display: flex;
    gap: 6px;
}

.dp-ctrl-btn {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    border: 1px solid var(--border-strong);
    background: var(--bg-section);
    color: var(--text-dim);
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
}

.dp-ctrl-btn:hover {
    background: var(--border-strong);
    color: var(--text-white);
}

.dp-ctrl-btn.close:hover {
    background: rgba(255,59,48,0.2);
    border-color: rgba(255,59,48,0.4);
    color: #ff3b30;
}

/* ─── Tab Bar ─── */
.tab-bar {
    display: flex;
    background: #111;
    border-bottom: 1px solid var(--border-subtle);
    flex-shrink: 0;
}

.tab {
    flex: 1;
    padding: 10px 6px;
    text-align: center;
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--text-ghost);
    cursor: pointer;
    border: none;
    background: none;
    border-bottom: 2px solid transparent;
    transition: all 0.2s ease;
    user-select: none;
}

.tab:hover {
    color: var(--text-muted);
}

.tab.active {
    color: var(--accent-gold);
    border-bottom-color: var(--accent-gold);
}

/* ─── Content Area  ─── */
.dp-panel-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
}

.dp-panel-content::-webkit-scrollbar {
    width: 4px;
}

.dp-panel-content::-webkit-scrollbar-track {
    background: transparent;
}

.dp-panel-content::-webkit-scrollbar-thumb {
    background: var(--border-strong);
    border-radius: 2px;
}

/* ─── Sections ─── */
.section {
    border-bottom: 1px solid var(--border-subtle);
    padding: 12px 14px;
    position: relative;
}

.section-tag {
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--accent-gold);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.section-tag::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(240, 165, 0, 0.13);
}

/* ─── Lead Card ─── */
.lead-card {
    background: var(--bg-section);
    border: 1px solid var(--border-primary);
    border-radius: 6px;
    padding: 10px;
    margin-bottom: 8px;
}

.lead-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-white);
    margin-bottom: 3px;
}

.lead-meta {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-dim);
    line-height: 1.8;
}

.lead-meta span {
    color: var(--text-secondary);
}

.lead-counter {
    position: absolute;
    top: 12px;
    right: 14px;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-ghost);
}

.lead-counter strong {
    color: var(--accent-gold);
}

/* ─── Injected Phone Info Bar ─── */
.phone-injected-bar {
    background: rgba(0,200,83,0.06);
    border: 1px solid rgba(0,200,83,0.15);
    border-radius: 6px;
    padding: 8px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 0;
}

.phone-injected-label {
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 1px;
    color: rgba(0,200,83,0.6);
    text-transform: uppercase;
}

.phone-injected-number {
    font-family: var(--font-mono);
    font-size: 12px;
    color: #00c853;
    letter-spacing: 1px;
}

.phone-injected-status {
    font-family: var(--font-mono);
    font-size: 8px;
    letter-spacing: 1px;
    color: rgba(0,200,83,0.4);
    text-transform: uppercase;
}

/* ─── Outcome Buttons ─── */
.outcome-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    gap: 5px;
    margin-bottom: 8px;
}

.outcome-btn {
    border-radius: 4px;
    padding: 6px 3px;
    font-family: var(--font-mono);
    font-size: 8px;
    letter-spacing: 0.5px;
    text-align: center;
    cursor: pointer;
    border: 1px solid;
    background: none;
    line-height: 1.3;
    transition: all 0.15s;
    user-select: none;
}

.outcome-btn:hover {
    filter: brightness(1.3);
    transform: translateY(-1px);
}

.outcome-btn.selected {
    filter: brightness(1.5);
    transform: scale(1.05);
    box-shadow: 0 0 10px rgba(255,255,255,0.1);
}

.o-answered { background: rgba(0,200,83,0.09); border-color: rgba(0,200,83,0.33); color: var(--accent-green); }
.o-noanswer { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.13); color: var(--text-muted); }
.o-voicemail { background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.13); color: var(--text-muted); }
.o-callback { background: rgba(240,165,0,0.09); border-color: rgba(240,165,0,0.33); color: var(--accent-gold); }
.o-notint { background: rgba(255,59,48,0.09); border-color: rgba(255,59,48,0.33); color: var(--accent-red); }

/* ─── Notes ─── */
.notes-area {
    background: var(--bg-input);
    border: 1px solid var(--border-primary);
    border-radius: 6px;
    padding: 8px 10px;
    width: 100%;
    min-height: 50px;
    font-family: var(--font-sans);
    font-size: 11px;
    color: var(--text-secondary);
    resize: none;
    outline: none;
    line-height: 1.5;
    transition: border-color 0.2s;
}

.notes-area:focus {
    border-color: var(--accent-gold);
}

.notes-area::placeholder {
    color: var(--text-invisible);
    font-style: italic;
}

/* ─── Callback Date ─── */
.callback-row {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-top: 6px;
}

.callback-input {
    flex: 1;
    background: var(--bg-input);
    border: 1px dashed rgba(240,165,0,0.27);
    border-radius: 4px;
    padding: 6px 8px;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--accent-gold);
    letter-spacing: 1px;
    outline: none;
}

/* ─── Navigation ─── */
.nav-row {
    display: flex;
    gap: 6px;
    align-items: center;
}

.prev-btn,
.skip-btn {
    background: var(--bg-section);
    border: 1px solid var(--border-strong);
    border-radius: 4px;
    padding: 8px 12px;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-dim);
    cursor: pointer;
    transition: all 0.15s;
}

.prev-btn:hover,
.skip-btn:hover {
    background: var(--border-strong);
    color: var(--text-white);
}

.prev-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.next-btn {
    flex: 1;
    background: var(--text-white);
    border: none;
    border-radius: 4px;
    padding: 8px;
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 600;
    color: #000;
    cursor: pointer;
    letter-spacing: 2px;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    transition: all 0.15s;
}

.next-btn:hover {
    background: #eee;
}

.next-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* ─── AI Suggestions ─── */
.ai-section {
    background: #0d1a0d;
    border-top: 1px solid #1a2e1a;
    padding: 10px 14px;
}

.ai-tag {
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--accent-ai);
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.ai-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent-ai);
    animation: dp-pulse 1.5s infinite;
}

.ai-suggestions {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.ai-chip {
    background: #162216;
    border: 1px solid #2a3e2a;
    border-radius: 4px;
    padding: 6px 8px;
    font-size: 10px;
    color: #8bc34a;
    cursor: pointer;
    line-height: 1.4;
    display: flex;
    align-items: flex-start;
    gap: 5px;
    transition: all 0.15s;
}

.ai-chip:hover {
    background: #1e2e1e;
    border-color: #3a5e3a;
}

.ai-num {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--accent-ai);
    min-width: 12px;
    margin-top: 1px;
}

/* ─── Lead List ─── */
.leads-list {
    max-height: 240px;
    overflow-y: auto;
}

.leads-list::-webkit-scrollbar {
    width: 4px;
}

.leads-list::-webkit-scrollbar-track {
    background: transparent;
}

.leads-list::-webkit-scrollbar-thumb {
    background: var(--border-strong);
    border-radius: 2px;
}

.lead-row {
    display: flex;
    align-items: center;
    padding: 6px 0;
    border-bottom: 1px solid var(--border-muted);
    gap: 8px;
}

.lead-row:last-child {
    border-bottom: none;
}

.lead-idx {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--text-ghost);
    min-width: 18px;
}

.lead-info {
    flex: 1;
}

.lead-row-name {
    font-size: 11px;
    color: #ccc;
    margin-bottom: 1px;
}

.lead-row-num {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-faint);
}

.lead-badge {
    font-family: var(--font-mono);
    font-size: 8px;
    padding: 2px 5px;
    border-radius: 3px;
    letter-spacing: 1px;
    white-space: nowrap;
}

.badge-pending { background: var(--bg-section); color: var(--text-faint); border: 1px solid var(--border-strong); }
.badge-done { background: rgba(0,200,83,0.09); color: var(--accent-green); border: 1px solid rgba(0,200,83,0.2); }
.badge-callback { background: rgba(240,165,0,0.09); color: var(--accent-gold); border: 1px solid rgba(240,165,0,0.2); }

/* ─── Dial Button ─── */
.dial-btn {
    width: 100%;
    background: var(--accent-green);
    border: none;
    border-radius: 6px;
    padding: 10px;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 2px;
    color: #000;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    text-transform: uppercase;
    transition: all 0.15s;
}

.dial-btn:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
}

.dial-btn:active {
    transform: translateY(0);
}

/* ─── Stat Grid ─── */
.stat-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    margin-bottom: 4px;
}

.stat-card {
    background: var(--bg-card);
    border: 1px solid var(--border-primary);
    border-radius: 6px;
    padding: 10px;
    text-align: center;
}

.stat-num {
    font-family: var(--font-mono);
    font-size: 22px;
    font-weight: 600;
    color: var(--accent-gold);
    line-height: 1;
    margin-bottom: 3px;
}

.stat-num.green { color: var(--accent-green); }
.stat-num.blue { color: var(--accent-blue); }
.stat-num.purple { color: var(--accent-purple); }

.stat-label {
    font-size: 9px;
    color: var(--text-faint);
    letter-spacing: 0.5px;
}

/* ─── Conversion Box ─── */
.conversion-box {
    margin-top: 8px;
    background: var(--bg-input);
    border: 1px solid var(--border-muted);
    border-radius: 6px;
    padding: 10px;
}

.conversion-label {
    font-size: 10px;
    color: var(--text-ghost);
    font-family: var(--font-mono);
    letter-spacing: 1px;
    margin-bottom: 5px;
}

.conversion-bar-bg {
    height: 6px;
    background: var(--bg-section);
    border-radius: 3px;
    overflow: hidden;
}

.conversion-bar-fill {
    height: 100%;
    background: var(--accent-gold);
    border-radius: 3px;
    transition: width 0.5s ease;
}

.conversion-value {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--accent-gold);
    margin-top: 5px;
}

/* ─── License ─── */
.lock-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px 20px;
    min-height: 300px;
    text-align: center;
    gap: 12px;
    background: var(--bg-primary);
}

.lock-icon { font-size: 32px; color: var(--border-strong); }
.lock-title {
    font-family: var(--font-mono);
    font-size: 13px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: var(--text-dim);
}

.lock-text {
    font-size: 11px;
    color: var(--text-faint);
    line-height: 1.6;
}

.license-input {
    width: 100%;
    max-width: 260px;
    background: var(--bg-input);
    border: 1px solid var(--border-strong);
    border-radius: 4px;
    padding: 9px 10px;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-secondary);
    text-align: center;
    letter-spacing: 2px;
    outline: none;
    transition: border-color 0.2s;
}

.license-input:focus {
    border-color: var(--accent-gold);
}

.activate-btn {
    width: 100%;
    max-width: 260px;
    background: var(--accent-gold);
    border: none;
    border-radius: 4px;
    padding: 9px;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    color: #000;
    cursor: pointer;
    letter-spacing: 2px;
    text-transform: uppercase;
    transition: all 0.15s;
}

.activate-btn:hover { filter: brightness(1.1); }
.activate-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.license-sub {
    font-size: 9px;
    color: var(--text-invisible);
    font-family: var(--font-mono);
    letter-spacing: 1px;
}

.license-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
}

.license-details {
    font-size: 11px;
    color: var(--text-muted);
}

.license-device {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--text-ghost);
    margin-top: 2px;
}

.license-expiry {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--text-ghost);
    letter-spacing: 1px;
    text-align: center;
    padding: 6px;
    border: 1px dashed var(--border-subtle);
    border-radius: 4px;
}

/* ─── Error / Success ─── */
.error-msg { font-family: var(--font-mono); font-size: 10px; color: var(--accent-red); text-align: center; }
.success-msg { font-family: var(--font-mono); font-size: 10px; color: var(--accent-green); text-align: center; }

/* ─── Settings ─── */
.settings-form {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.settings-form label {
    font-family: var(--font-mono);
    font-size: 9px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--text-dim);
}

.settings-form input,
.settings-form select {
    background: var(--bg-input);
    border: 1px solid var(--border-primary);
    border-radius: 4px;
    padding: 7px 8px;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-secondary);
    outline: none;
}

.settings-form input:focus,
.settings-form select:focus {
    border-color: var(--accent-gold);
}

/* ─── Callbacks list ─── */
.callback-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.callback-card {
    background: var(--bg-section);
    border: 1px solid var(--border-primary);
    border-radius: 6px;
    padding: 10px;
}

.callback-card-name {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-white);
    margin-bottom: 2px;
}

.callback-card-phone {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-muted);
}

.callback-card-date {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--accent-gold);
    margin-top: 4px;
}

.badge-active {
    background: rgba(0,200,83,0.09);
    color: var(--accent-green);
    border: 1px solid rgba(0,200,83,0.2);
    padding: 3px 6px;
}

/* ─── Utility ─── */
.loading {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-ghost);
    text-align: center;
    padding: 40px;
    letter-spacing: 2px;
    text-transform: uppercase;
}

.empty-state {
    text-align: center;
    padding: 30px 20px;
    color: var(--text-dim);
    font-size: 11px;
}

.fade-in {
    animation: dp-fadeIn 0.2s ease-out;
}

@keyframes dp-fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

/* ─── Logout button in settings ─── */
.logout-btn {
    background: rgba(255,59,48,0.1);
    border: 1px solid rgba(255,59,48,0.25);
    border-radius: 4px;
    padding: 8px;
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--accent-red);
    cursor: pointer;
    letter-spacing: 1px;
    text-transform: uppercase;
    transition: all 0.15s;
}

.logout-btn:hover {
    background: rgba(255,59,48,0.2);
    border-color: rgba(255,59,48,0.4);
}
`;
}

// Wait for page to be ready, then inject
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(injectWidget, 500);
} else {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(injectWidget, 500);
    });
}
