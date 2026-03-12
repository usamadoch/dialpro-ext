import React, { useState, useEffect } from 'react';
import { Lead, BADGE_STYLES } from './types';

interface LeadsListProps {
    leads: Lead[];
    currentIndex: number;
    onSelectLead: (index: number) => void;
    onStartDialing: () => void;
    onRefresh: () => void;
}

const LeadsList: React.FC<LeadsListProps> = ({ leads, currentIndex, onSelectLead, onStartDialing, onRefresh }) => {
    const [openLists, setOpenLists] = useState<Record<string, boolean>>({});

    const grouped = leads.reduce((acc, lead, idx) => {
        const name = lead.list_name || 'Assigned List';
        let group = acc.find(g => g.name === name);
        if (!group) {
            group = { name, items: [] };
            acc.push(group);
        }
        group.items.push({ lead, idx });
        return acc;
    }, [] as Array<{ name: string, items: { lead: Lead, idx: number }[] }>);

    useEffect(() => {
        if (grouped.length > 0 && Object.keys(openLists).length === 0) {
            setOpenLists({ [grouped[0].name]: true });
        }
    }, [grouped.length]);

    const toggleList = (listName: string) => {
        setOpenLists(prev => ({ ...prev, [listName]: !prev[listName] }));
    };

    return (
        <div className="bg-white flex flex-col h-full">
            <div className="shrink-0">
                <div className="bg-white p-4">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-[12px] font-bold tracking-widest uppercase text-gray-400 border-b border-gray-100/0">Assigned Lead Lists</p>
                        <button
                            onClick={onRefresh}
                            className="text-[12px] font-bold text-primary hover:text-primary-dark transition-colors uppercase tracking-wider cursor-pointer"
                        >
                            Refresh
                        </button>
                    </div>

                    <button
                        onClick={onStartDialing}
                        className="w-full bg-primary text-white text-[14px] cursor-pointer font-extrabold py-3.5 rounded-xl tracking-wide uppercase shadow-sm hover:bg-primary-dark transition-all transform active:scale-[0.98]"
                    >
                        ▶ Start Dialing Session
                    </button>
                </div>
                
                <div className="px-4 py-3 bg-gray-50/50 border-y border-gray-100 flex items-center justify-between">
                    <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400">
                        Total — {leads.length} Leads
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-gray-100">
                {grouped.map(group => (
                    <div key={group.name} className="flex flex-col bg-white">
                        <div 
                            className="px-4 py-3.5 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors group"
                            onClick={() => toggleList(group.name)}
                        >
                            <span className="text-[13px] font-bold text-gray-800 uppercase tracking-wide">
                                {group.name} <span className="text-gray-400 font-normal normal-case ml-1 tracking-normal">({group.items.length} items)</span>
                            </span>
                            <span className={`text-gray-300 text-[10px] transform transition-transform duration-200 ${openLists[group.name] ? 'rotate-180' : ''}`}>
                                ▼
                            </span>
                        </div>
                        
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openLists[group.name] ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="flex flex-col divide-y divide-gray-50 bg-gray-50/30">
                                {group.items.map(({ lead, idx }) => (
                                    <div
                                        key={lead._id}
                                        onClick={() => { onSelectLead(idx); onStartDialing(); }}
                                        className={`flex items-center gap-3 py-3 px-4 cursor-pointer hover:bg-white transition-colors border-l-2 ${currentIndex === idx ? 'bg-orange-50/50 border-primary' : 'border-transparent'}`}
                                    >
                                        <span className={`font-mono text-[11px] font-bold w-5 ${currentIndex === idx ? 'text-primary' : 'text-gray-300'}`}>
                                            {String(idx + 1).padStart(2, '0')}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[14px] font-semibold text-gray-800 truncate">
                                                {lead.name ? `${lead.name}${lead.company ? ` — ${lead.company}` : ''}` : lead.phone}
                                            </p>
                                            <p className="font-mono text-[11px] text-gray-400 mt-0.5">
                                                {lead.name ? lead.phone : 'no extra info'}
                                            </p>
                                        </div>
                                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${BADGE_STYLES[lead.status === 'pending' ? 'pending' : lead.status === 'callback' ? 'callback' : 'done']}`}>
                                            {lead.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LeadsList;
