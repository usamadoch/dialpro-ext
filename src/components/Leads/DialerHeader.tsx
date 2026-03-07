import React from 'react';

interface DialerHeaderProps {
    title?: React.ReactNode;
    rightContent?: React.ReactNode;
    currentIndex?: number;
    totalLeads?: number;
    children?: React.ReactNode;
}

const DialerHeader: React.FC<DialerHeaderProps> = ({
    title,
    rightContent,
    currentIndex,
    totalLeads,
    children
}) => {
    const renderTitle = () => {
        if (title) {
            if (typeof title === 'string') {
                return <span className="text-[14px] font-extrabold text-white">{title}</span>;
            }
            return title;
        }
        return (
            <span className="text-[14px] font-extrabold text-white tracking-wide flex items-center gap-2">
                <span className="text-primary text-xl">PRO</span> Dialing
            </span>
        );
    };

    const renderRightContent = () => {
        if (rightContent) {
            return rightContent;
        }
        if (totalLeads !== undefined) {
            return (
                <span className="font-mono text-[12px] text-gray-400 bg-gray-800 px-3 py-1.5 rounded-full border border-white/5">
                    Lead <span className="text-white font-semibold">{String((currentIndex || 0) + 1).padStart(2, '0')}</span> / {totalLeads}
                </span>
            );
        }
        return null;
    };

    const header = (
        <div className="bg-gray-900 h-14 px-3 flex items-center justify-between shrink-0">
            {renderTitle()}
            {renderRightContent()}
        </div>
    );

    if (children) {
        return (
            <div className="bg-white flex flex-col h-full">
                {header}
                {children}
            </div>
        );
    }

    return header;
};

export default DialerHeader;

