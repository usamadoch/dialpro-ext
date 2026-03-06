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

    const renderTab = () => {
        switch (activeTab) {
            case 'Leads': return <LeadsTab />;
            case 'Callbacks': return <CallbacksTab />;
            case 'Summary': return <SummaryTab />;
            case 'Settings': return <SettingsTab />;
            default: return <LeadsTab />;
        }
    };

    return (
        <div className="ext-popup">
            <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="ext-content">
                {renderTab()}
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
