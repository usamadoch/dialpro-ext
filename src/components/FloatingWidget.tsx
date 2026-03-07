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
const PHONE_INPUT_SELECTOR = 'input#il2, input.input[placeholder="Enter a name or number"], [id-test="webphone-dialpad-screen-input"]';
const DIALPAD_BUTTON_SELECTOR = '[id-test="webphone-dialpad-dialpad-button"]';

/**
 * Inject the phone number into the site's phone input field and dispatch
 * input events so Angular picks up the change.
 */
async function injectPhoneIntoSite(phone: string) {
    let input = document.querySelector(PHONE_INPUT_SELECTOR) as HTMLInputElement | null;

    if (!input) {
        const dialpadBtn = document.querySelector(DIALPAD_BUTTON_SELECTOR) as HTMLButtonElement | null;
        if (dialpadBtn) {
            dialpadBtn.click();
            // Wait a brief moment for the dial pad to render/open
            await new Promise(resolve => setTimeout(resolve, 500));
            input = document.querySelector(PHONE_INPUT_SELECTOR) as HTMLInputElement | null;
        }
    }

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
    const [isDragging, setIsDragging] = useState(false);
    const [panelHeight, setPanelHeight] = useState(560);

    // Pill position (draggable)
    const [pillPos, setPillPos] = useState({ x: 20, y: 20 });
    // Panel position (draggable)
    const [panelPos, setPanelPos] = useState({ x: 20, y: 70 });

    const dragging = useRef(false);
    const resizing = useRef(false);
    const dragTarget = useRef<'pill' | 'panel'>('pill');
    const dragOffset = useRef({ x: 0, y: 0 });
    const hasMoved = useRef(false);

    // Restore visibility and state from chrome storage
    useEffect(() => {
        try {
            chrome.storage.local.get([
                'dialpro_widget_visible',
                'dialpro_panel_height',
                'dialpro_pill_pos',
                'dialpro_panel_pos'
            ], (result: any) => {
                if (result.dialpro_widget_visible === false) {
                    setIsVisible(false);
                }
                if (result.dialpro_panel_height) {
                    setPanelHeight(result.dialpro_panel_height);
                }
                if (result.dialpro_pill_pos) {
                    setPillPos(result.dialpro_pill_pos);
                }
                if (result.dialpro_panel_pos) {
                    setPanelPos(result.dialpro_panel_pos);
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

    // Global drag / resize handlers
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (resizing.current) {
            const newHeight = Math.max(300, Math.min(900, e.clientY - panelPos.y));
            setPanelHeight(newHeight);
            return;
        }
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
    }, [pillPos, panelPos]);

    const handleMouseUp = useCallback(() => {
        dragging.current = false;
        resizing.current = false;
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        // Save positions and height
        try {
            chrome.storage.local.set({
                dialpro_pill_pos: pillPos,
                dialpro_panel_pos: panelPos,
                dialpro_panel_height: panelHeight,
            });
        } catch { }
    }, [handleMouseMove, pillPos, panelPos, panelHeight]);

    const startDrag = (e: React.MouseEvent, target: 'pill' | 'panel') => {
        e.preventDefault();
        dragging.current = true;
        setIsDragging(true);
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

    const startResize = (e: React.MouseEvent) => {
        e.preventDefault();
        resizing.current = true;
        setIsDragging(true);
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
                className={`fixed flex items-center gap-2.5 bg-white border border-gray-100 rounded-full py-2 px-3.5 cursor-grab active:cursor-grabbing select-none shadow-md ${isDragging ? '' : 'transition-all duration-300'} z-2147483647 hover:border-primary/40 hover:shadow-lg group`}
                style={{ left: pillPos.x, top: pillPos.y }}
                onMouseDown={(e) => startDrag(e, 'pill')}
                onMouseUp={handlePillClick}
            >
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-sm font-black text-white font-mono shrink-0 shadow-sm">D</div>
                <span className="font-sans text-xs font-bold tracking-widest uppercase text-gray-500 whitespace-nowrap">DialPro</span>
                <div className="w-2 h-2 rounded-full bg-green-500 ai-pulse shrink-0" />
                <div className="flex items-center gap-1.5 ml-1 opacity-0 max-w-0 overflow-hidden transition-all duration-300 group-hover:opacity-100 group-hover:max-w-[100px]">
                    <button
                        className="bg-primary hover:bg-primary-dark text-white rounded-lg px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap shadow-sm transition-all"
                        onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
                    >
                        OPEN
                    </button>
                    <button
                        className="text-gray-400 hover:text-red-500 cursor-pointer p-1 transition-colors"
                        onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                    >
                        ✕
                    </button>
                </div>
            </div>
        );
    }

    // ─── Expanded Panel ───
    const tabs = ['Leads', 'Callbacks', 'Summary', 'Settings'];

    return (
        <div
            className={`fixed ext z-2147483647 animate-in fade-in zoom-in-95 ${isDragging ? 'transition-none!' : 'transition-[height,opacity,transform] duration-300'}`}
            style={{
                left: panelPos.x,
                top: panelPos.y,
                height: panelHeight,
                width: 380 // Standard width for the panel
            }}
        >
            <div className="flex flex-col h-full bg-white rounded-2xl border border-solid border-gray-200 overflow-hidden shadow-2xl">
                {/* Draggable Chrome Header */}
                <div
                    className="bg-gray-100 px-4 py-3 flex items-center justify-between border-b border-gray-200 cursor-grab active:cursor-grabbing select-none shrink-0"
                    onMouseDown={(e) => startDrag(e, 'panel')}
                >
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-red-400 shadow-inner"></span>
                        <span className="w-3 h-3 rounded-full bg-yellow-400 shadow-inner"></span>
                        <span className="w-3 h-3 rounded-full bg-green-400 shadow-inner"></span>
                        <span className="ml-2 text-xs font-mono text-gray-400 tracking-wide font-medium">DialPro</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
                            onClick={() => setIsExpanded(false)}
                        >
                            ─
                        </button>
                        <button
                            className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                            onClick={handleRemove}
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                {!isAuthenticated ? (
                    <div className="flex-1 overflow-y-auto scrollbar-thin bg-white">
                        <LicenseScreen />
                    </div>
                ) : (
                    <>
                        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
                        <div className="flex-1 overflow-y-auto scrollbar-thin bg-white">
                            <div style={{ display: activeTab === 'Leads' ? 'block' : 'none', height: '100%' }}>
                                <LeadsTab onPhoneChange={handlePhoneChange} />
                            </div>
                            <div style={{ display: activeTab === 'Callbacks' ? 'block' : 'none', height: '100%' }}>
                                <CallbacksTab />
                            </div>
                            <div style={{ display: activeTab === 'Summary' ? 'block' : 'none', height: '100%' }}>
                                <SummaryTab />
                            </div>
                            <div style={{ display: activeTab === 'Settings' ? 'block' : 'none', height: '100%' }}>
                                <SettingsTab />
                            </div>
                        </div>
                    </>
                )}

                {/* Resize Handle */}
                <div
                    className="h-2 cursor-ns-resize hover:bg-primary/10 transition-colors shrink-0 flex items-center justify-center group"
                    onMouseDown={startResize}
                >
                    <div className="w-8 h-1 bg-gray-200 rounded-full group-hover:bg-primary/40 transition-colors"></div>
                </div>
            </div>
        </div>
    );
};

export default FloatingWidget;
