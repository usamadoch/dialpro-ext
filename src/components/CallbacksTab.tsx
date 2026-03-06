import React, { useState, useEffect } from 'react';
import { getCallbacks } from '../services/api';

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

    if (loading) return <div className="loading">LOADING CALLBACKS...</div>;

    return (
        <div className="fade-in">
            <div className="section">
                <div className="section-tag">Due Today</div>
                {dueToday.length === 0 ? (
                    <div className="empty-state">No callbacks due today</div>
                ) : (
                    dueToday.map((cb) => (
                        <div className="lead-row" key={cb._id} style={{ padding: '10px 0', borderBottom: '1px solid #1e1e1e' }}>
                            <div className="callback-dot today"></div>
                            <div className="lead-info" style={{ marginLeft: '8px' }}>
                                <div className="lead-row-name" style={{ color: '#fff' }}>
                                    {cb.lead_id?.name
                                        ? `${cb.lead_id.name}${cb.lead_id.company ? ` — ${cb.lead_id.company}` : ''}`
                                        : cb.lead_id?.phone || 'Unknown'}
                                </div>
                                <div className="lead-row-num">{cb.lead_id?.phone || 'N/A'} · Due: Today</div>
                                {cb.notes && <div className="callback-note">"{cb.notes}"</div>}
                            </div>
                            <button className="dial-btn" style={{ width: 'auto', padding: '6px 10px', fontSize: '9px', borderRadius: '4px' }}>DIAL</button>
                        </div>
                    ))
                )}
            </div>

            <div className="section">
                <div className="section-tag">Upcoming</div>
                {upcoming.length === 0 ? (
                    <div className="empty-state">No upcoming callbacks</div>
                ) : (
                    upcoming.map((cb) => (
                        <div className="lead-row" key={cb._id} style={{ padding: '10px 0', borderBottom: '1px solid #1e1e1e' }}>
                            <div className="callback-dot upcoming"></div>
                            <div className="lead-info" style={{ marginLeft: '8px' }}>
                                <div className="lead-row-name">
                                    {cb.lead_id?.name
                                        ? `${cb.lead_id.name}${cb.lead_id.company ? ` — ${cb.lead_id.company}` : ''}`
                                        : cb.lead_id?.phone || 'Unknown'}
                                </div>
                                <div className="lead-row-num">
                                    {cb.lead_id?.phone || 'N/A'} · {new Date(cb.callback_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                            </div>
                            <span className="lead-badge badge-callback">
                                {new Date(cb.callback_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }).toUpperCase()}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CallbacksTab;
