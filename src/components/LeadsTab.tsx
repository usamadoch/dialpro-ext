import React, { useState, useEffect, useMemo } from 'react';
import { getLeads, logCall, updatePosition } from '../services/api';
import {
    type FieldPref,
    getFieldPreferences, saveAvailableFields,
    extractFieldKeys, mergePrefsWithFields, formatFieldKey,
} from '../utils/fieldPreferences';

interface Lead {
    _id: string;
    phone: string;
    name: string;
    company: string;
    location: string;
    extra_info: Record<string, any>;
    position: number;
    status: string;
}

interface AssignmentInfo {
    id: string;
    list_id: string;
    current_position: number;
}

interface LeadsTabProps {
    onPhoneChange?: (phone: string) => void;
}

const LeadsTab: React.FC<LeadsTabProps> = ({ onPhoneChange }) => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [assignment, setAssignment] = useState<AssignmentInfo | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOutcome, setSelectedOutcome] = useState('');
    const [notes, setNotes] = useState('');
    const [callbackDate, setCallbackDate] = useState('');
    const [showDialer, setShowDialer] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [phoneInjected, setPhoneInjected] = useState(false);
    const [fieldPrefs, setFieldPrefs] = useState<FieldPref[]>([]);
    const [showMoreFields, setShowMoreFields] = useState(false);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const res = await getLeads();
            setLeads(res.data.leads);
            setAssignment(res.data.assignment);
            if (res.data.assignment) {
                const pos = res.data.assignment.current_position - 1;
                setCurrentIndex(Math.min(pos, Math.max(res.data.leads.length - 1, 0)));
            }
        } catch (err) {
            console.error('Failed to fetch leads:', err);
        } finally {
            setLoading(false);
        }
    };

    // Extract available fields from leads and load preferences
    useEffect(() => {
        if (leads.length > 0) {
            const fields = extractFieldKeys(leads);
            saveAvailableFields(fields);
            getFieldPreferences().then(saved => {
                setFieldPrefs(mergePrefsWithFields(saved, fields));
            });
        }
    }, [leads]);

    const currentLead = leads[currentIndex];

    // Compute ordered fields split into pinned and extra
    const { pinnedFields, extraFields } = useMemo(() => {
        if (!currentLead || fieldPrefs.length === 0) return { pinnedFields: [], extraFields: [] };

        const fieldMap: Record<string, string> = {};
        if (currentLead.company) fieldMap['company'] = currentLead.company;
        if (currentLead.location) fieldMap['location'] = currentLead.location;
        if (currentLead.extra_info) {
            Object.entries(currentLead.extra_info).forEach(([k, v]) => {
                fieldMap[k] = String(v);
            });
        }

        const prefsKeys = new Set(fieldPrefs.map(p => p.key));
        const ordered: { key: string; value: string; pinned: boolean }[] = fieldPrefs
            .filter(p => fieldMap[p.key])
            .map(p => ({ key: p.key, value: fieldMap[p.key], pinned: p.pinned }));

        Object.entries(fieldMap).forEach(([k, v]) => {
            if (!prefsKeys.has(k)) {
                ordered.push({ key: k, value: v, pinned: false });
            }
        });

        return {
            pinnedFields: ordered.filter(f => f.pinned),
            extraFields: ordered.filter(f => !f.pinned),
        };
    }, [currentLead, fieldPrefs]);

    // Inject phone into the site's input field whenever lead changes
    useEffect(() => {
        if (currentLead?.phone && showDialer && onPhoneChange) {
            onPhoneChange(currentLead.phone);
            setPhoneInjected(true);
        }
    }, [currentIndex, currentLead?.phone, showDialer, onPhoneChange]);

    const handleNext = async () => {
        if (!currentLead || !assignment) return;

        if (selectedOutcome) {
            setSaving(true);
            try {
                await logCall({
                    lead_id: currentLead._id,
                    list_id: assignment.list_id,
                    outcome: selectedOutcome,
                    notes,
                    callback_date: selectedOutcome === 'callback' ? callbackDate : undefined,
                });
            } catch (err) {
                console.error('Failed to log call:', err);
            }
            setSaving(false);
        }

        const nextIndex = Math.min(currentIndex + 1, leads.length - 1);
        setCurrentIndex(nextIndex);
        setSelectedOutcome('');
        setNotes('');
        setCallbackDate('');
        setPhoneInjected(false);
        setShowMoreFields(false);

        try {
            await updatePosition(assignment.id, nextIndex + 1);
        } catch (err) {
            console.error('Failed to update position:', err);
        }
    };

    const handlePrev = () => {
        setCurrentIndex(Math.max(currentIndex - 1, 0));
        setSelectedOutcome('');
        setNotes('');
        setCallbackDate('');
        setPhoneInjected(false);
        setShowMoreFields(false);
    };

    const handleSkip = () => {
        const nextIndex = Math.min(currentIndex + 1, leads.length - 1);
        setCurrentIndex(nextIndex);
        setSelectedOutcome('');
        setNotes('');
        setCallbackDate('');
        setPhoneInjected(false);
        setShowMoreFields(false);
    };

    if (loading) {
        return <div className="loading">LOADING LEADS...</div>;
    }

    if (leads.length === 0) {
        return (
            <div className="empty-state fade-in">
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>📋</div>
                <div>No leads assigned yet</div>
                <div style={{ fontSize: '10px', color: '#444', marginTop: '4px' }}>
                    Contact your admin to get started
                </div>
            </div>
        );
    }

    // Lead list view
    if (!showDialer) {
        return (
            <div className="fade-in">
                <div className="section">
                    <div className="section-tag">Your Leads ({leads.length})</div>
                    <button
                        className="dial-btn"
                        style={{ background: '#f0a500', fontSize: '11px', marginBottom: '10px' }}
                        onClick={() => setShowDialer(true)}
                    >
                        START SESSION →
                    </button>
                    <div className="leads-list">
                        {leads.map((lead, idx) => (
                            <div
                                className="lead-row"
                                key={lead._id}
                                onClick={() => { setCurrentIndex(idx); setShowDialer(true); }}
                                style={{ cursor: 'pointer' }}
                            >
                                <span className="lead-idx">{String(idx + 1).padStart(2, '0')}</span>
                                <div className="lead-info">
                                    <div className="lead-row-name">
                                        {lead.name ? `${lead.name}${lead.company ? ` — ${lead.company}` : ''}` : lead.phone}
                                    </div>
                                    <div className="lead-row-num">
                                        {lead.name ? lead.phone : '— no extra info —'}
                                    </div>
                                </div>
                                <span className={`lead-badge ${lead.status === 'pending' ? 'badge-pending' :
                                    lead.status === 'callback' ? 'badge-callback' : 'badge-done'
                                    }`}>
                                    {lead.status.toUpperCase().replace('_', ' ')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Active dialer view
    return (
        <div className="fade-in">
            {/* Current Lead */}
            <div className="section">
                <div className="section-tag">Current Lead</div>
                <span className="lead-counter">
                    Lead <strong>{String(currentIndex + 1).padStart(2, '0')}</strong> / {leads.length}
                </span>
                <div className="lead-card">
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <div className="lead-name" style={{ marginBottom: 0 }}>{currentLead?.name || currentLead?.phone || 'Unknown'}</div>
                        <span className={`inject-indicator ${phoneInjected ? 'done' : ''}`} style={{ display: 'flex', alignItems: 'center' }}>
                            {phoneInjected ? '✓' : ''}
                        </span>
                    </div>
                    {currentLead?.name && currentLead?.phone && (
                        <div className="lead-phone">{currentLead.phone}</div>
                    )}

                    {/* Pinned fields — always visible */}
                    {pinnedFields.length > 0 && (
                        <div className="lead-meta">
                            {pinnedFields.map(f => (
                                <React.Fragment key={f.key}>
                                    {formatFieldKey(f.key)}: <span>{f.value}</span><br />
                                </React.Fragment>
                            ))}
                        </div>
                    )}

                    {/* Extra fields — collapsible */}
                    {extraFields.length > 0 && (
                        <>
                            {showMoreFields && (
                                <div className="lead-meta lead-meta-extra">
                                    {extraFields.map(f => (
                                        <React.Fragment key={f.key}>
                                            {formatFieldKey(f.key)}: <span>{f.value}</span><br />
                                        </React.Fragment>
                                    ))}
                                </div>
                            )}
                            <button
                                className="see-more-btn"
                                style={{
                                    width: '100%',
                                    background: 'var(--bg-section)',
                                    border: '1px solid var(--border-strong)',
                                    borderRadius: '4px',
                                    padding: '8px 12px',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '11px',
                                    color: 'var(--text-dim)',
                                    cursor: 'pointer',
                                    marginTop: '8px',
                                    transition: 'all 0.15s'
                                }}
                                onClick={() => setShowMoreFields(!showMoreFields)}
                            >
                                {showMoreFields ? 'SEE LESS ▲' : `SEE MORE (${extraFields.length}) ▼`}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Outcome */}
            <div className="section">
                <div className="section-tag">Call Outcome</div>
                <div className="outcome-row">
                    {[
                        { key: 'answered', label: 'Answered', icon: '✓', cls: 'o-answered' },
                        { key: 'no_answer', label: 'No Answer', icon: '✕', cls: 'o-noanswer' },
                        { key: 'voicemail', label: 'Voicemail', icon: '📭', cls: 'o-voicemail' },
                        { key: 'callback', label: 'Callback', icon: '🔁', cls: 'o-callback' },
                        { key: 'not_interested', label: 'Not Int.', icon: '—', cls: 'o-notint' },
                    ].map((o) => (
                        <div
                            key={o.key}
                            className={`outcome-btn ${o.cls} ${selectedOutcome === o.key ? 'selected' : ''}`}
                            onClick={() => {
                                setSelectedOutcome(o.key);
                                if (o.key === 'callback' && !callbackDate) {
                                    setCallbackDate(new Date().toISOString().split('T')[0]);
                                }
                            }}
                        >
                            {o.icon}<br />{o.label}
                        </div>
                    ))}
                </div>

                {selectedOutcome === 'callback' && (
                    <div className="callback-row" style={{ marginBottom: '10px' }}>
                        <input
                            type="date"
                            className="callback-input"
                            value={callbackDate}
                            onChange={(e) => setCallbackDate(e.target.value)}
                        />
                    </div>
                )}

                <textarea
                    className="notes-area"
                    placeholder="Write a note about this call... (auto-saved)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
            </div>

            {/* Navigation */}
            <div className="section" style={{ borderBottom: 'none' }}>
                <div className="nav-row">
                    <button className="prev-btn" onClick={handlePrev} disabled={currentIndex === 0}>← PREV</button>
                    <button className="next-btn" onClick={handleNext} disabled={saving}>
                        {saving ? 'SAVING...' : 'NEXT LEAD →'}
                    </button>
                    <button className="skip-btn" onClick={handleSkip}>SKIP</button>
                </div>
            </div>

            {/* Back button */}
            <div style={{ padding: '8px 16px 12px' }}>
                <button className="prev-btn" style={{ width: '100%', textAlign: 'center' }} onClick={() => setShowDialer(false)}>
                    ← BACK TO LIST
                </button>
            </div>



            {/* AI Suggestions — positioned right after Call Outcome for contextual use */}
            <div className="ai-section">
                <div className="ai-tag">
                    <div className="ai-dot"></div>AI Live Suggestions
                </div>
                <div className="ai-suggestions">
                    <div className="ai-chip"><span className="ai-num">1</span>"That makes sense, let me ask you something quick about your current setup..."</div>
                    <div className="ai-chip"><span className="ai-num">2</span>"Totally understand, a lot of our clients said the same thing before trying us..."</div>
                    <div className="ai-chip"><span className="ai-num">3</span>"No problem at all, can I follow up with you next week instead?"</div>
                </div>
            </div>
        </div>
    );
};

export default LeadsTab;
