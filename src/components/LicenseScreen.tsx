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
        <div className="lock-screen">
            <div className="lock-icon">🔒</div>
            <div className="lock-title">DialPro</div>
            <div className="lock-text">
                Enter your license key to activate this extension on this device.
            </div>

            <form onSubmit={handleActivate} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <input
                    className="license-input"
                    type="text"
                    placeholder="DP-XXXX-XXXX-XXXX-XXXX"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                    required
                />
                {error && <div className="error-msg">{error}</div>}
                <button className="activate-btn" type="submit" disabled={loading}>
                    {loading ? 'VERIFYING...' : 'ACTIVATE'}
                </button>
            </form>

            <div className="license-sub">
                Device: {deviceId || 'Detecting...'}
            </div>
            <div className="license-sub">
                Contact admin for your license key
            </div>
        </div>
    );
};

export default LicenseScreen;
