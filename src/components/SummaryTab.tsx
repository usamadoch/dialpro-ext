import React, { useState, useEffect } from 'react';
import { getSummary, getLeads } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface SummaryData {
    date: string;
    total_dialed: number;
    answered: number;
    no_answer: number;
    voicemail: number;
    callbacks: number;
    not_interested: number;
    answer_rate: string;
}

interface Lead {
    _id: string;
    phone: string;
    name: string;
    company: string;
    location: string;
    status: string;
}

const SummaryTab: React.FC = () => {
    const { user, deviceId } = useAuth();
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        try {
            setLoading(true);
            const [summaryRes, leadsRes] = await Promise.all([getSummary(), getLeads()]);
            setSummary(summaryRes.data);
            setLeads(leadsRes.data.leads || []);
        } catch (err) {
            console.error('Failed to fetch summary:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (!summary) return;
        setExporting(true);

        try {
            const today = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
            let csv = `DialPro Session Report - ${today}\n`;
            csv += `Agent: ${user?.name || 'Unknown'}\n\n`;

            // Summary stats
            csv += `SUMMARY\n`;
            csv += `Metric,Value\n`;
            csv += `Total Dialed,${summary.total_dialed || 0}\n`;
            csv += `Answered,${summary.answered || 0}\n`;
            csv += `Callbacks,${summary.callbacks || 0}\n`;
            csv += `Not Interested,${summary.not_interested || 0}\n`;
            csv += `Answer Rate,${summary.answer_rate || '0.0'}%\n\n`;

            // Lead list with status
            csv += `LEAD LIST\n`;
            csv += `#,Phone,Name,Company,Location,Status\n`;
            leads
                .filter(lead => lead.status === 'callback' || lead.status === 'answered')
                .forEach((lead, idx) => {
                    const name = (lead.name || '').replace(/,/g, ';');
                    const company = (lead.company || '').replace(/,/g, ';');
                    const location = (lead.location || '').replace(/,/g, ';');
                    csv += `${idx + 1},${lead.phone || 'N/A'},${name},${company},${location},${(lead.status || 'pending').toUpperCase()}\n`;
                });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `dialpro_report_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export failed:', err);
        } finally {
            setExporting(false);
        }
    };

    if (loading) return <div className="loading">LOADING SUMMARY...</div>;

    const answerRate = parseFloat(summary?.answer_rate || '0');

    return (
        <div className="fade-in">
            <div className="section">
                <div className="section-tag">Today's Session</div>
                <div className="stat-grid">
                    <div className="stat-card">
                        <div className="stat-num">{summary?.total_dialed || 0}</div>
                        <div className="stat-label">Total Dialed</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-num green">{summary?.answered || 0}</div>
                        <div className="stat-label">Answered</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-num blue">{summary?.callbacks || 0}</div>
                        <div className="stat-label">Callbacks Set</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-num purple">{summary?.not_interested || 0}</div>
                        <div className="stat-label">Not Interested</div>
                    </div>
                </div>

                <div className="conversion-box">
                    <div className="conversion-label">CONVERSION RATE</div>
                    <div className="conversion-bar-bg">
                        <div className="conversion-bar-fill" style={{ width: `${Math.min(answerRate, 100)}%` }}></div>
                    </div>
                    <div className="conversion-value">{summary?.answer_rate || '0.0'}% answer rate</div>
                </div>

                {/* Export / Download Button */}
                <button
                    className="export-btn"
                    style={{
                        width: '100%',
                        marginTop: '12px',
                        background: 'rgba(240, 165, 0, 0.08)',
                        border: '1px dashed rgba(240, 165, 0, 0.35)',
                        borderRadius: '6px',
                        padding: '10px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        fontWeight: 600,
                        letterSpacing: '2px',
                        color: 'var(--accent-gold)',
                        cursor: exporting ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        textTransform: 'uppercase',
                        transition: 'all 0.2s',
                        opacity: exporting ? 0.5 : 1
                    }}
                    onClick={handleExport}
                    disabled={exporting}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {exporting ? 'EXPORTING...' : 'DOWNLOAD REPORT'}
                </button>
            </div>

            <div className="section" style={{ borderBottom: 'none' }}>
                <div className="section-tag">License</div>
                <div className="license-info">
                    <div>
                        <div className="license-details">Agent: {user?.name || 'Unknown'}</div>
                        <div className="license-device">Device: {deviceId || 'N/A'}</div>
                    </div>
                    <span className="lead-badge badge-active">ACTIVE</span>
                </div>
                <div className="license-expiry">
                    License expires: {user?.license_expiry
                        ? new Date(user.license_expiry).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                        : 'N/A'} · 1 seat · 1 device
                </div>
            </div>
        </div>
    );
};

export default SummaryTab;
