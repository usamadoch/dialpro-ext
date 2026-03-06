import React from 'react';
import { useAuth } from '../context/AuthContext';

const SettingsTab: React.FC = () => {
    const { user, deviceId, logout } = useAuth();

    return (
        <div className="fade-in">
            <div className="section">
                <div className="section-tag">Account</div>
                <div className="settings-form">
                    <div className="settings-field">
                        <div className="settings-label">Name</div>
                        <div className="settings-value">{user?.name || '—'}</div>
                    </div>
                    <div className="settings-field">
                        <div className="settings-label">Email</div>
                        <div className="settings-value">{user?.email || '—'}</div>
                    </div>
                    <div className="settings-field">
                        <div className="settings-label">Device ID</div>
                        <div className="settings-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '1px' }}>
                            {deviceId || '—'}
                        </div>
                    </div>
                    <div className="settings-field">
                        <div className="settings-label">License Expires</div>
                        <div className="settings-value">
                            {user?.license_expiry
                                ? new Date(user.license_expiry).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
                                : '—'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="section" style={{ borderBottom: 'none' }}>
                <div className="section-tag">Actions</div>
                <button className="dial-btn" style={{ background: '#ff3b30' }} onClick={logout}>
                    SIGN OUT
                </button>
                <div style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#333', letterSpacing: '1px', marginTop: '12px' }}>
                    DialPro Extension v1.0
                </div>
            </div>
        </div>
    );
};

export default SettingsTab;
