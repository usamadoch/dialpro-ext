import React from 'react';

interface TabBarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
    const tabs = ['Leads', 'Callbacks', 'Summary', 'Settings'];
    const activeIndex = Math.max(tabs.indexOf(activeTab), 0);

    return (
        <div className="flex border-b border-solid border-gray-100 shrink-0 relative">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    className={`flex-1 py-3 text-[12px] font-medium transition-colors duration-200 tracking-wide select-none bg-transparent cursor-pointer ${activeTab === tab
                        ? 'text-primary relative z-10'
                        : 'text-gray-400 hover:text-gray-500'
                        }`}
                    onClick={() => onTabChange(tab)}
                >
                    {tab}
                </button>
            ))}

            {/* Sliding Indicator */}
            <div
                className="absolute -bottom-px left-0 h-[2px] bg-primary transition-transform duration-300 ease-in-out z-10"
                style={{
                    width: `${100 / tabs.length}%`,
                    transform: `translateX(${activeIndex * 100}%)`
                }}
            />
        </div>
    );
};

export default TabBar;
