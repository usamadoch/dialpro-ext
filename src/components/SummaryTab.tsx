import React, { useState, useEffect } from 'react';
import { getSummary, getLeads } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingState from './Leads/LoadingState';
import DialerHeader from './Leads/DialerHeader';

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

            csv += `SUMMARY\n`;
            csv += `Metric,Value\n`;
            csv += `Total Dialed,${summary.total_dialed || 0}\n`;
            csv += `Answered,${summary.answered || 0}\n`;
            csv += `Callbacks,${summary.callbacks || 0}\n`;
            csv += `Not Interested,${summary.not_interested || 0}\n`;
            csv += `Answer Rate,${summary.answer_rate || '0.0'}%\n\n`;

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

    if (loading) {
        return <LoadingState message="Loading Summary..." className="h-full" />;
    }


    const answerRate = parseFloat(summary?.answer_rate || '0');
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

    return (
        <DialerHeader
            title="Today's Stats"
            rightContent={
                <span className="font-mono text-[12px] text-gray-400 bg-gray-800 px-3 py-1 rounded-full border border-white/5">
                    {today}
                </span>
            }
        >
            <div className="p-4 border-b border-gray-100">
                {/* stats grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="border border-gray-100 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                        <p className="font-mono text-[12px] font-bold text-gray-900 mb-1">{summary?.total_dialed || 0}</p>
                        <p className="text-[12px] font-black text-gray-400 tracking-widest uppercase">Total Dialed</p>
                    </div>
                    <div className="border border-gray-100 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                        <p className="font-mono text-[12px] font-bold text-green-500 mb-1">{summary?.answered || 0}</p>
                        <p className="text-[12px] font-black text-gray-400 tracking-widest uppercase">Answered</p>
                    </div>
                    <div className="border border-gray-100 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                        <p className="font-mono text-[12px] font-bold text-primary mb-1">{summary?.callbacks || 0}</p>
                        <p className="text-[12px] font-black text-gray-400 tracking-widest uppercase">Callbacks</p>
                    </div>
                    <div className="border border-gray-100 rounded-2xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                        <p className="font-mono text-[12px] font-bold text-indigo-500 mb-1">{summary?.not_interested || 0}</p>
                        <p className="text-[12px] font-black text-gray-400 tracking-widest uppercase">Interested</p>
                    </div>
                </div>

                {/* answer rate bar */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-4">
                    <div className="flex justify-between items-center mb-2.5 px-1">
                        <span className="text-[12px] font-black text-gray-500 uppercase tracking-widest">Answer Rate</span>
                        <span className="font-mono text-[14px] font-bold text-gray-900">{summary?.answer_rate || '0.0'}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                        <div
                            className="h-full bg-primary rounded-full transition-[width] duration-1000 ease-out"
                            style={{ width: `${Math.min(answerRate, 100)}%` }}
                        ></div>
                    </div>
                </div>

                <button
                    className="w-full bg-primary/10 hover:bg-primary/20 text-primary text-[12px] font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all uppercase tracking-widest border border-dashed border-primary/30 active:scale-[0.98]"
                    onClick={handleExport}
                    disabled={exporting}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {exporting ? 'EXPORTING...' : 'Download Report'}
                </button>
            </div>

            {/* license section */}
            <div className="p-4 bg-gray-50/50">
                <p className="text-[12px] font-black tracking-widest uppercase text-gray-400 mb-3 px-1">Active License</p>
                <div className="bg-white border border-gray-100 rounded-2xl px-4 py-4 flex items-center justify-between mb-3 shadow-sm">
                    <div className="min-w-0">
                        <p className="text-[14px] font-bold text-gray-900 truncate">{user?.name || 'Unknown Agent'}</p>
                        <p className="font-mono text-[12px] text-gray-400 mt-1 truncate">Device: {deviceId || 'N/A'}</p>
                    </div>
                    <span className="text-[12px] font-black px-3 py-1.5 rounded-full bg-green-50 text-green-600 border border-green-100 shadow-sm shrink-0">
                        ✓ ACTIVE
                    </span>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-center">
                    <p className="font-mono text-[9px] text-gray-400 tracking-wider uppercase">
                        Expires: {user?.license_expiry
                            ? new Date(user.license_expiry).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                            : 'N/A'} · 1 seat · 1 device
                    </p>
                </div>
            </div>
        </DialerHeader>
    );
};

export default SummaryTab;
