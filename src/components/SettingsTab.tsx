import React from 'react';
import { useAuth } from '../context/AuthContext';
import DialerHeader from './Leads/DialerHeader';

const SettingsTab: React.FC = () => {
    const { user, deviceId, logout } = useAuth();

    return (
        <DialerHeader
            title="Settings"
            rightContent={
                <span className="font-mono text-[12px] text-gray-400 bg-gray-800 px-3 py-1 rounded-full border border-white/5">
                    Account Control
                </span>
            }
        >

            <div className="p-4 border-b border-gray-100">
                <p className="text-[12px] font-black tracking-widest uppercase text-gray-400 mb-3 px-1">Account Info</p>
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                        <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider ml-1">Name</span>
                        <div className="text-[14px] text-gray-700 font-semibold px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl shadow-sm">
                            {user?.name || '—'}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider ml-1">Email</span>
                        <div className="text-[14px] text-gray-700 font-semibold px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl shadow-sm truncate">
                            {user?.email || '—'}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider ml-1">Device ID</span>
                        <div className="text-[12px] text-gray-500 font-mono px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl shadow-sm tracking-wider">
                            {deviceId || '—'}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider ml-1">Subscription Expires</span>
                        <div className="text-[14px] text-gray-700 font-semibold px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl shadow-sm">
                            {user?.license_expiry
                                ? new Date(user.license_expiry).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
                                : '—'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-gray-50/50 flex-1">
                <p className="text-[12px] font-black tracking-widest uppercase text-gray-400 mb-3 px-1">Session</p>
                <button
                    onClick={logout}
                    className="w-full bg-white hover:bg-red-50 text-red-500 border border-red-100 hover:border-red-200 rounded-2xl p-4 font-sans text-[12px] font-black tracking-widest uppercase shadow-sm transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 01-2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign Out Account
                </button>

                <div className="text-center font-mono text-[12px] text-gray-300 font-bold uppercase tracking-[2px] mt-6">
                    DialPro v1.0.4
                </div>
            </div>
        </DialerHeader>
    );
};

export default SettingsTab;
