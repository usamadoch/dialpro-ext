import React from 'react';

interface EmptyLeadsProps {
    onFetchLeads: () => void;
}

const EmptyLeads: React.FC<EmptyLeadsProps> = ({ onFetchLeads }) => (
    <div className="bg-white flex flex-col min-h-[400px]">
        <div className="p-4 border-b border-gray-100">
            <div className="flex justify-between items-center mb-3">
                <p className="text-[12px] font-bold tracking-widest uppercase text-gray-400">Upload Lead List</p>
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center mb-3 hover:border-primary transition-colors cursor-pointer">
                <p className="text-3xl mb-3">📋</p>
                <p className="text-[14px] text-gray-500 mb-1 font-semibold">No Leads Assigned Yet</p>
                <p className="text-[12px] text-gray-400">Contact your manager if you think this is a mistake.</p>
                <button
                    onClick={onFetchLeads}
                    className="bg-primary text-white text-[12px] font-bold px-4 py-2 rounded-lg mt-2"
                >
                    Refresh
                </button>
            </div>
        </div>
    </div>
);

export default EmptyLeads;
