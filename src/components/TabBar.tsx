import React from 'react';

interface TabBarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
    const tabs = ['Leads', 'Callbacks', 'Summary', 'Settings'];

    return (
        <div className="tab-bar">
            {tabs.map((tab) => (
                <div
                    key={tab}
                    className={`tab ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => onTabChange(tab)}
                >
                    {tab}
                </div>
            ))}
        </div>
    );
};

export default TabBar;
