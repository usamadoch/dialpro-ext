import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import LicenseScreen from './LicenseScreen';
import TabBar from './TabBar';
import LeadsTab from './LeadsTab';
import CallbacksTab from './CallbacksTab';
import SummaryTab from './SummaryTab';
import SettingsTab from './SettingsTab';

interface FloatingWidgetProps {
    shadowRoot: ShadowRoot;
}

// Selectors for the target site's phone input
const PHONE_INPUT_SELECTOR = 'input#il2, input.input[placeholder="Enter a name or number"]';

/**
 * Inject the phone number into the site's phone input field and dispatch
 * input events so Angular picks up the change.
 */
function injectPhoneIntoSite(phone: string) {
    const input = document.querySelector(PHONE_INPUT_SELECTOR) as HTMLInputElement | null;
    if (!input) return false;

    // Focus the input
    input.focus();

    // Clear existing value
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    // Set new value
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
    )?.set;

    if (nativeInputValueSetter) {
        nativeInputValueSetter.call(input, phone);
    } else {
        input.value = phone;
    }

    // Dispatch events so Angular/React picks up the change
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));

    return true;
}

const FloatingWidget: React.FC<FloatingWidgetProps> = ({ shadowRoot }) => {
    const { isAuthenticated } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [activeTab, setActiveTab] = useState('Leads');

    // Pill position (draggable)
    const [pillPos, setPillPos] = useState({ x: 20, y: 20 });
    // Panel position (draggable)
    const [panelPos, setPanelPos] = useState({ x: 20, y: 70 });

    const dragging = useRef(false);
    const dragTarget = useRef<'pill' | 'panel'>('pill');
    const dragOffset = useRef({ x: 0, y: 0 });
    const hasMoved = useRef(false);

    // Restore visibility from chrome storage
    useEffect(() => {
        try {
            chrome.storage.local.get('dialpro_widget_visible', (result: { dialpro_widget_visible?: boolean }) => {
                if (result.dialpro_widget_visible === false) {
                    setIsVisible(false);
                }
            });
        } catch {
            // dev fallback
        }

        // Listen for toggle from popup/background
        const handleMessage = (message: { type: string }) => {
            if (message.type === 'TOGGLE_WIDGET') {
                setIsVisible(v => {
                    const newVal = !v;
                    try { chrome.storage.local.set({ dialpro_widget_visible: newVal }); } catch { }
                    return newVal;
                });
            }
        };

        try {
            chrome.runtime.onMessage.addListener(handleMessage);
            return () => chrome.runtime.onMessage.removeListener(handleMessage);
        } catch {
            return;
        }
    }, []);

    // Global drag handlers
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!dragging.current) return;
        e.preventDefault();

        const dx = Math.abs(e.clientX - (dragOffset.current.x + (dragTarget.current === 'pill' ? pillPos.x : panelPos.x)));
        const dy = Math.abs(e.clientY - (dragOffset.current.y + (dragTarget.current === 'pill' ? pillPos.y : panelPos.y)));
        if (dx > 3 || dy > 3) hasMoved.current = true;

        const newX = e.clientX - dragOffset.current.x;
        const newY = e.clientY - dragOffset.current.y;

        if (dragTarget.current === 'pill') {
            setPillPos({ x: newX, y: newY });
        } else {
            setPanelPos({ x: newX, y: newY });
        }
    }, []);

    const handleMouseUp = useCallback(() => {
        dragging.current = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove]);

    const startDrag = (e: React.MouseEvent, target: 'pill' | 'panel') => {
        e.preventDefault();
        dragging.current = true;
        dragTarget.current = target;
        hasMoved.current = false;

        const currentPos = target === 'pill' ? pillPos : panelPos;
        dragOffset.current = {
            x: e.clientX - currentPos.x,
            y: e.clientY - currentPos.y,
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handlePillClick = () => {
        if (!hasMoved.current) {
            setIsExpanded(true);
        }
    };

    const handleRemove = () => {
        setIsVisible(false);
        try { chrome.storage.local.set({ dialpro_widget_visible: false }); } catch { }
    };

    // Callback for phone injection from LeadsTab
    const handlePhoneChange = useCallback((phone: string) => {
        injectPhoneIntoSite(phone);
    }, []);

    if (!isVisible) return null;

    // ─── Minimized Pill ───
    if (!isExpanded) {
        return (
            <div
                className="dp-pill"
                style={{ left: pillPos.x, top: pillPos.y }}
                onMouseDown={(e) => startDrag(e, 'pill')}
                onMouseUp={handlePillClick}
            >
                <div className="dp-pill-logo">D</div>
                <span className="dp-pill-text">DialPro</span>
                <div className="dp-pill-status" />
                <div className="dp-pill-actions">
                    <button
                        className="dp-expand-btn"
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
                    >
                        OPEN
                    </button>
                    <button
                        className="dp-close-pill-btn"
                        onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                    >
                        ✕
                    </button>
                </div>
            </div>
        );
    }

    // ─── Expanded Panel ───
    const renderTab = () => {
        switch (activeTab) {
            case 'Leads': return <LeadsTab onPhoneChange={handlePhoneChange} />;
            case 'Callbacks': return <CallbacksTab />;
            case 'Summary': return <SummaryTab />;
            case 'Settings': return <SettingsTab />;
            default: return <LeadsTab onPhoneChange={handlePhoneChange} />;
        }
    };

    return (
        <div
            className="dp-panel"
            style={{ left: panelPos.x, top: panelPos.y }}
        >
            {/* Draggable Header */}
            <div
                className="dp-panel-header"
                onMouseDown={(e) => startDrag(e, 'panel')}
            >
                <div className="dp-panel-title">
                    <div className="dp-panel-logo">D</div>
                    <span className="dp-panel-label">DialPro</span>
                </div>
                <div className="dp-panel-controls">
                    <button className="dp-ctrl-btn" onClick={() => setIsExpanded(false)} title="Minimize">
                        ─
                    </button>
                    <button className="dp-ctrl-btn close" onClick={handleRemove} title="Close">
                        ✕
                    </button>
                </div>
            </div>

            {/* Show license screen if not auth */}
            {!isAuthenticated ? (
                <div className="dp-panel-content">
                    <LicenseScreen />
                </div>
            ) : (
                <>
                    <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
                    <div className="dp-panel-content">
                        {renderTab()}
                    </div>
                </>
            )}
        </div>
    );
};

export default FloatingWidget;
