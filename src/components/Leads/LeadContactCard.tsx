import React from 'react';
import { Lead } from './types';
import { formatFieldKey } from '../../utils/fieldPreferences';

interface LeadContactCardProps {
    currentLead: Lead;
    pinnedFields: Array<{ key: string; value: string; pinned: boolean }>;
    extraFields: Array<{ key: string; value: string; pinned: boolean }>;
    onDial: (phone: string) => void;
    showMoreFields: boolean;
    setShowMoreFields: (show: boolean) => void;
}

const LeadContactCard: React.FC<LeadContactCardProps> = ({
    currentLead,
    pinnedFields,
    extraFields,
    onDial,
    showMoreFields,
    setShowMoreFields
}) => (
    <div className="p-4 border-b border-gray-100">
        <div className="bg-primary-light border border-orange-100 rounded-2xl p-4 shadow-sm shadow-orange-900/5">
            <p className="flex items-center gap-2 text-lg font-extrabold text-gray-900 mb-2 truncate leading-tight">
                {currentLead?.phone || 'Unknown Contact'}

                <button
                    onClick={() => navigator.clipboard.writeText(currentLead?.phone || '')}
                    className="text-[8px] font-bold text-gray-400 bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700 hover:bg-gray-700 hover:text-white transition-all uppercase"
                >
                    Copy
                </button>
            </p>

            <div className="flex flex-col gap-1.5">
                {pinnedFields.map(f => (
                    <div key={f.key} className="flex gap-2 text-[13px]">
                        <span className="font-bold text-primary w-20 shrink-0 capitalize">{formatFieldKey(f.key)}</span>
                        <span className="text-gray-600 truncate">{f.value}</span>
                    </div>
                ))}

                {showMoreFields && extraFields.map(f => (
                    <div key={f.key} className="flex gap-2 text-[13px]">
                        <span className="font-bold text-primary w-20 shrink-0 capitalize">{formatFieldKey(f.key)}</span>
                        <span className="text-gray-600 truncate">{f.value}</span>
                    </div>
                ))}

                {extraFields.length > 0 && (
                    <button
                        onClick={() => setShowMoreFields(!showMoreFields)}
                        className="text-[10px] font-bold text-primary text-left mt-1 hover:underline flex items-center gap-1 uppercase tracking-wider"
                    >
                        {showMoreFields ? '▲ Show Less' : `▼ +${extraFields.length} more details`}
                    </button>
                )}
            </div>
        </div>

    </div>
);

export default LeadContactCard;
