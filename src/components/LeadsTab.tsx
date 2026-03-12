import React, { useState, useEffect, useMemo } from 'react';
import { getLeads, logCall, updatePosition } from '../services/api';
import {
    getFieldPreferences, saveAvailableFields,
    extractFieldKeys, mergePrefsWithFields, formatFieldKey,
} from '../utils/fieldPreferences';

// Sub-components
import { Lead, AssignmentInfo, FieldPref } from './Leads/types';
import LoadingState from './Leads/LoadingState';
import EmptyLeads from './Leads/EmptyLeads';
import LeadsList from './Leads/LeadsList';
import DialerHeader from './Leads/DialerHeader';
import LeadContactCard from './Leads/LeadContactCard';
import OutcomeManager from './Leads/OutcomeManager';
import DialerNav from './Leads/DialerNav';
import AISuggestions from './Leads/AISuggestions';

interface LeadsTabProps {
    onPhoneChange?: (phone: string) => void;
}

const LeadsTab: React.FC<LeadsTabProps> = ({ onPhoneChange }) => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [assignment, setAssignment] = useState<AssignmentInfo | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOutcome, setSelectedOutcome] = useState('no_answer');
    const [notes, setNotes] = useState('');
    const [callbackDate, setCallbackDate] = useState('');
    const [showDialer, setShowDialer] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fieldPrefs, setFieldPrefs] = useState<FieldPref[]>([]);
    const [showMoreFields, setShowMoreFields] = useState(false);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const res = await getLeads();
            setLeads(res.data.leads || []);
            setAssignment(res.data.assignment);
            if (res.data.assignment) {
                const pos = res.data.assignment.current_position - 1;
                setCurrentIndex(Math.min(pos, Math.max((res.data.leads?.length || 0) - 1, 0)));
            }
        } catch (err) {
            console.error('Failed to fetch leads:', err);
        } finally {
            setLoading(false);
        }
    };

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

    const { pinnedFields, extraFields } = useMemo(() => {
        if (!currentLead || fieldPrefs.length === 0) return { pinnedFields: [], extraFields: [] };

        const fieldMap: Record<string, string> = { ...currentLead.extra_info };
        if (currentLead.company) fieldMap['company'] = currentLead.company;
        if (currentLead.location) fieldMap['location'] = currentLead.location;

        const prefsKeys = new Set(fieldPrefs.map(p => p.key));
        const ordered: { key: string; value: string; pinned: boolean }[] = fieldPrefs
            .filter(p => fieldMap[p.key])
            .map(p => ({ key: p.key, value: String(fieldMap[p.key]), pinned: p.pinned }));

        Object.entries(fieldMap).forEach(([k, v]) => {
            if (!prefsKeys.has(k)) {
                ordered.push({ key: k, value: String(v), pinned: false });
            }
        });

        return {
            pinnedFields: ordered.filter(f => f.pinned),
            extraFields: ordered.filter(f => !f.pinned),
        };
    }, [currentLead, fieldPrefs]);

    useEffect(() => {
        if (currentLead?.phone && showDialer && onPhoneChange) {
            onPhoneChange(currentLead.phone);
        }
    }, [currentIndex, currentLead?.phone, showDialer, onPhoneChange]);

    const handleNext = async () => {
        if (!currentLead || !assignment) return;

        if (selectedOutcome) {
            setSaving(true);
            try {
                await logCall({
                    lead_id: currentLead._id,
                    list_id: currentLead.list_id || assignment.list_id,
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
        resetCurrentFeedback();

        const nextLead = leads[nextIndex];

        try {
            if (nextLead) {
                await updatePosition(nextLead.assignment_id || assignment.id, nextLead.position);
            }
        } catch (err) {
            console.error('Failed to update position:', err);
        }
    };

    const resetCurrentFeedback = () => {
        setSelectedOutcome('no_answer');
        setNotes('');
        setCallbackDate('');
        setShowMoreFields(false);
    };

    const handlePrev = () => {
        setCurrentIndex(Math.max(currentIndex - 1, 0));
        resetCurrentFeedback();
    };

    const handleSkip = () => {
        const nextIndex = Math.min(currentIndex + 1, leads.length - 1);
        setCurrentIndex(nextIndex);
        resetCurrentFeedback();
    };

    if (loading) return <LoadingState message="Loading Leads..." />;


    if (leads.length === 0) return <EmptyLeads onFetchLeads={fetchLeads} />;

    if (!showDialer) {
        return (
            <LeadsList
                leads={leads}
                currentIndex={currentIndex}
                onSelectLead={setCurrentIndex}
                onStartDialing={() => setShowDialer(true)}
                onRefresh={fetchLeads}
            />
        );
    }

    return (
        <div className="bg-white flex flex-col">
            <DialerHeader currentIndex={currentIndex} totalLeads={leads.length} />

            <div className="flex-1 overflow-y-auto scrollbar-thin scroll-smooth">
                <LeadContactCard
                    currentLead={currentLead}
                    pinnedFields={pinnedFields}
                    extraFields={extraFields}
                    onDial={(phone) => onPhoneChange?.(phone)}
                    showMoreFields={showMoreFields}
                    setShowMoreFields={setShowMoreFields}
                />

                <OutcomeManager
                    selectedOutcome={selectedOutcome}
                    setSelectedOutcome={setSelectedOutcome}
                    notes={notes}
                    setNotes={setNotes}
                    callbackDate={callbackDate}
                    setCallbackDate={setCallbackDate}
                />

                <DialerNav
                    currentIndex={currentIndex}
                    onPrev={handlePrev}
                    onNext={handleNext}
                    onSkip={handleSkip}
                    onBackToList={() => setShowDialer(false)}
                    saving={saving}
                />
            </div>

            {/* <AISuggestions /> */}
        </div>
    );
};

export default LeadsTab;
