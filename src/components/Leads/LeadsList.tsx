import React from 'react';
import { Lead, BADGE_STYLES } from './types';

interface LeadsListProps {
    leads: Lead[];
    currentIndex: number;
    onSelectLead: (index: number) => void;
    onStartDialing: () => void;
    onRefresh: () => void;
}

const LeadsList: React.FC<LeadsListProps> = ({ leads, currentIndex, onSelectLead, onStartDialing, onRefresh }) => (
    <div className="bg-white flex flex-col">
        <div className="p-4 border-b border-gray-100">
            <div className="flex justify-between items-center mb-3">
                <p className="text-[12px] font-bold tracking-widest uppercase text-gray-400">Upload Lead List</p>
                <button
                    onClick={onRefresh}
                    className="text-[12px] font-bold text-primary hover:text-primary-dark transition-colors uppercase tracking-wider"
                >
                    Refresh List
                </button>
            </div>

            <button
                onClick={onStartDialing}
                className="w-full bg-primary text-white text-[14px] font-extrabold py-3.5 rounded-xl tracking-wide uppercase shadow-sm hover:bg-primary-dark transition-all transform active:scale-[0.98]"
            >
                ▶ Start Dialing Session
            </button>
        </div>

        <div className="p-4">
            <p className="text-[12px] font-bold tracking-widest uppercase text-gray-400 mb-3">Loaded — {leads.length} Leads</p>
            <div className="flex flex-col divide-y divide-gray-50 max-h-[300px] overflow-y-auto scrollbar-thin">
                {leads.map((lead, idx) => (
                    <div
                        key={lead._id}
                        onClick={() => { onSelectLead(idx); onStartDialing(); }}
                        className={`flex items-center gap-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors px-1 ${currentIndex === idx ? 'bg-orange-50/50' : ''
                            }`}
                    >
                        <span className={`font-mono text-[12px] w-5 ${currentIndex === idx ? 'text-primary' : 'text-gray-300'}`}>
                            {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-semibold text-gray-800 truncate">
                                {lead.name ? `${lead.name}${lead.company ? ` — ${lead.company}` : ''}` : lead.phone}
                            </p>
                            <p className="font-mono text-[12px] text-gray-400">
                                {lead.name ? lead.phone : 'no extra info'}
                            </p>
                        </div>
                        <span className={`text-[12px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${BADGE_STYLES[lead.status === 'pending' ? 'pending' : lead.status === 'callback' ? 'callback' : 'done']
                            }`}>
                            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1).replace('_', ' ')}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default LeadsList;
