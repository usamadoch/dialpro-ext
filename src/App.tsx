import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LicenseScreen from './components/LicenseScreen';
import TabBar from './components/TabBar';
import LeadsTab from './components/LeadsTab';
import CallbacksTab from './components/CallbacksTab';
import SummaryTab from './components/SummaryTab';
import SettingsTab from './components/SettingsTab';

function ExtensionApp() {
    const { isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState('Leads');

    if (!isAuthenticated) {
        return <LicenseScreen />;
    }

    return (
        <div className="w-[380px] min-h-[600px] max-h-[700px] flex flex-col bg-bg-primary border border-solid border-gray-200">
            <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
                <div style={{ display: activeTab === 'Leads' ? 'block' : 'none', height: '100%' }}>
                    <LeadsTab />
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
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <ExtensionApp />
        </AuthProvider>
    );
}

export default App;
