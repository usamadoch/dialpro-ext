import React, { useState } from 'react';
import { verifyLicense } from '../services/api';
import { useAuth } from '../context/AuthContext';

const LicenseScreen: React.FC = () => {
    const { login, deviceId } = useAuth();
    const [licenseKey, setLicenseKey] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleActivate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await verifyLicense(licenseKey.trim(), deviceId);
            login(res.data.token, res.data.user);
        } catch (err: any) {
            const msg = err.response?.data?.error || 'Activation failed';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center px-8 py-12 min-h-[500px] text-center bg-white">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 shadow-sm shadow-orange-900/5 rotate-3 hover:rotate-0 transition-transform duration-500">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
            </div>

            <h1 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tighter italic">DialPro</h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[2px] mb-8 px-4 leading-relaxed">
                Activate License Key
            </p>

            <form onSubmit={handleActivate} className="w-full max-w-[280px] flex flex-col gap-4">
                <div className="flex flex-col gap-1.5 text-left">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">License Key</span>
                    <input
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-4 font-mono text-xs text-gray-700 text-center tracking-[2px] outline-none shadow-inner transition-all focus:border-primary/50 focus:bg-white focus:ring-4 focus:ring-primary/5 placeholder:text-gray-300"
                        type="text"
                        placeholder="DP-XXXX-XXXX-XXXX"
                        value={licenseKey}
                        onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                        required
                    />
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-[10px] text-red-500 font-bold px-4 py-3 rounded-xl animate-shake">
                        ⚠ {error}
                    </div>
                )}

                <button
                    className="w-full bg-primary hover:bg-primary-dark text-white rounded-2xl py-4 font-sans text-xs font-black tracking-[3px] uppercase shadow-lg shadow-orange-900/10 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'VERIFYING...' : 'ACTIVATE'}
                </button>
            </form>

            <div className="mt-12 flex flex-col gap-2 opacity-40 hover:opacity-100 transition-opacity">
                <div className="text-[10px] text-gray-400 font-bold font-mono tracking-widest uppercase">
                    Device: {deviceId || 'Detecting...'}
                </div>
                <div className="text-[10px] text-gray-400 font-bold font-mono tracking-widest uppercase">
                    Contact admin for access
                </div>
            </div>
        </div>
    );
};

export default LicenseScreen;
