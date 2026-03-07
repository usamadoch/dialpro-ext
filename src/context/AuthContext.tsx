import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import LoadingState from '../components/Leads/LoadingState';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'agent';
    device_id?: string;
    license_expiry?: string;
    is_active: boolean;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    deviceId: string;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    deviceId: '',
    login: () => { },
    logout: () => { },
    isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [deviceId, setDeviceId] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get device ID from background script
        try {
            chrome.runtime.sendMessage({ type: 'GET_DEVICE_ID' }, (response: { device_id?: string }) => {
                if (response?.device_id) {
                    setDeviceId(response.device_id);
                }
            });
        } catch {
            // Fallback for dev mode
            setDeviceId('DEV-LOCAL-0001');
        }

        // Restore session from chrome.storage
        const restoreSession = async () => {
            try {
                const result = await chrome.storage.local.get(['dialpro_token', 'dialpro_user']) as { dialpro_token?: string; dialpro_user?: User };
                if (result.dialpro_token && result.dialpro_user) {
                    setToken(result.dialpro_token);
                    setUser(result.dialpro_user);
                }
            } catch {
                // Fallback to localStorage for dev
                const savedToken = localStorage.getItem('dialpro_token');
                const savedUser = localStorage.getItem('dialpro_user');
                if (savedToken && savedUser) {
                    setToken(savedToken);
                    setUser(JSON.parse(savedUser));
                }
            }
            setLoading(false);
        };

        restoreSession();

        // Listen for internal app event
        const handleAuthExpired = () => {
            setToken(null);
            setUser(null);
        };
        window.addEventListener('dialpro_auth_expired', handleAuthExpired);

        // Listen for storage changes from background or other tabs
        const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
            if (areaName === 'local' && changes.dialpro_token && !changes.dialpro_token.newValue) {
                setToken(null);
                setUser(null);
            }
        };

        try {
            chrome.storage.onChanged.addListener(handleStorageChange);
        } catch { }

        return () => {
            window.removeEventListener('dialpro_auth_expired', handleAuthExpired);
            try {
                chrome.storage.onChanged.removeListener(handleStorageChange);
            } catch { }
        };
    }, []);

    const login = async (newToken: string, newUser: User) => {
        try {
            await chrome.storage.local.set({
                dialpro_token: newToken,
                dialpro_user: newUser,
            });
        } catch {
            localStorage.setItem('dialpro_token', newToken);
            localStorage.setItem('dialpro_user', JSON.stringify(newUser));
        }
        setToken(newToken);
        setUser(newUser);
    };

    const logout = async () => {
        try {
            await chrome.storage.local.remove(['dialpro_token', 'dialpro_user']);
        } catch {
            localStorage.removeItem('dialpro_token');
            localStorage.removeItem('dialpro_user');
        }
        setToken(null);
        setUser(null);
    };

    if (loading) {
        return <LoadingState message="Initializing App..." className="h-screen w-[380px]" />;
    }


    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                deviceId,
                login,
                logout,
                isAuthenticated: !!token,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
