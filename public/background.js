// DialPro Background Service Worker
// Handles extension lifecycle events

chrome.runtime.onInstalled.addListener(() => {
    console.log('DialPro extension installed');
});

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_DEVICE_ID') {
        // Generate a deterministic device fingerprint
        const generateDeviceId = async () => {
            const stored = await chrome.storage.local.get('device_id');
            if (stored.device_id) {
                sendResponse({ device_id: stored.device_id });
                return;
            }

            // Generate unique device ID and store it permanently
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let id = 'WIN-';
            for (let i = 0; i < 4; i++) {
                id += chars[Math.floor(Math.random() * chars.length)];
            }
            id += '-';
            for (let i = 0; i < 4; i++) {
                id += chars[Math.floor(Math.random() * chars.length)];
            }

            await chrome.storage.local.set({ device_id: id });
            sendResponse({ device_id: id });
        };

        generateDeviceId();
        return true; // keep channel open for async response
    }
});

// Toggle widget visibility when extension icon is clicked
chrome.action.onClicked.addListener(async (tab) => {
    if (tab.id) {
        try {
            await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_WIDGET' });
        } catch {
            // Content script not loaded on this page
            console.log('Content script not available on this tab');
        }
    }
});
