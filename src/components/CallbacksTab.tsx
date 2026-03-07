import React, { useState, useEffect } from 'react';
import { getCallbacks } from '../services/api';
import LoadingState from './Leads/LoadingState';
import DialerHeader from './Leads/DialerHeader';

interface CallbackLead {
    _id: string;
    lead_id: {
        _id: string;
        phone: string;
        name: string;
        company: string;
    } | null;
    notes: string;
    callback_date: string;
}

const CallbacksTab: React.FC = () => {
    const [dueToday, setDueToday] = useState<CallbackLead[]>([]);
    const [upcoming, setUpcoming] = useState<CallbackLead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCallbacks();
    }, []);

    const fetchCallbacks = async () => {
        try {
            setLoading(true);
            const res = await getCallbacks();
            setDueToday(res.data.dueToday);
            setUpcoming(res.data.upcoming);
        } catch (err) {
            console.error('Failed to fetch callbacks:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingState message="Loading Callbacks..." className="h-full" />;
    }

    return (
        <DialerHeader
            title="Callbacks"
            rightContent={
                <span className="font-mono text-[12px] bg-primary text-white px-3 py-1 rounded-full font-bold shadow-orange-900/20">
                    {dueToday.length} due today
                </span>
            }
        >

            {/* due today section */}
            <div className="p-4 border-b border-gray-100">
                <p className="text-[12px] font-black tracking-widest uppercase text-gray-400 mb-3 px-1">Due Today</p>

                {dueToday.length === 0 ? (
                    <div className="text-center py-8 text-gray-300 italic text-[12px]">No callbacks due at the moment</div>
                ) : (
                    <div className="flex flex-col gap-2.5">
                        {dueToday.map((cb) => (
                            <div key={cb._id} className="bg-primary-light border border-orange-100 rounded-2xl p-4 flex items-start gap-3   shadow-orange-900/5 hover:shadow-md transition-shadow">
                                <span className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 shrink-0  "></span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[14px] font-bold text-gray-900 truncate">
                                        {cb.lead_id?.name
                                            ? `${cb.lead_id.name}${cb.lead_id.company ? ` — ${cb.lead_id.company}` : ''}`
                                            : cb.lead_id?.phone || 'Unknown Contact'}
                                    </p>
                                    <p className="font-mono text-[12px] text-primary-dark font-semibold mt-1">
                                        {cb.lead_id?.phone || 'N/A'} · Due Today
                                    </p>
                                    {cb.notes && (
                                        <p className="text-[11px] text-gray-500 mt-2 font-medium italic border-l-2 border-primary/20 pl-2">
                                            "{cb.notes}"
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => {/* assuming global dialer triggers on phone match */ }}
                                    className="bg-green-500 text-white text-[10px] font-black px-3.5 py-2 rounded-xl shrink-0 hover:bg-green-600 transition-all   active:scale-95 uppercase tracking-wider"
                                >
                                    Dial
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* upcoming section */}
            <div className="p-4 bg-gray-50/50 flex-1">
                <p className="text-[12px] font-black tracking-widest uppercase text-gray-400 mb-3 px-1">Upcoming</p>

                {upcoming.length === 0 ? (
                    <div className="text-center py-4 text-gray-300 text-[12px] uppercase tracking-widest font-bold">No upcoming schedule</div>
                ) : (
                    <div className="flex flex-col divide-y divide-gray-100 bg-white rounded-2xl border border-gray-100   overflow-hidden">
                        {upcoming.map((cb) => (
                            <div key={cb._id} className="flex items-center gap-3 p-3.5 hover:bg-gray-50 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-gray-200 shrink-0"></span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[14px] font-bold text-gray-800 truncate">
                                        {cb.lead_id?.name
                                            ? `${cb.lead_id.name}${cb.lead_id.company ? ` — ${cb.lead_id.company}` : ''}`
                                            : cb.lead_id?.phone || 'Unknown Contact'}
                                    </p>
                                    <p className="font-mono text-[12px] text-gray-400 mt-0.5">
                                        {cb.lead_id?.phone || 'N/A'}
                                    </p>
                                </div>
                                <span className="text-[12px] font-black px-3 py-1.5 rounded-full bg-primary-light text-primary-dark border border-orange-100   shrink-0 uppercase tracking-tighter flex items-center gap-1">
                                    <span>{new Date(cb.callback_date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                    <span>{new Date(cb.callback_date).getDate()}</span>
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DialerHeader>
    );
};

export default CallbacksTab;
