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
}) => {
    const hasMcField = pinnedFields.some(f => f.key === 'mc') || extraFields.some(f => f.key === 'mc');
    const linkUrl = 
        pinnedFields.find(f => f.key === 'link')?.value || 
        extraFields.find(f => f.key === 'link')?.value || 
        currentLead?.extra_info?.link;

    const filteredPinnedFields = hasMcField ? pinnedFields.filter(f => f.key !== 'link') : pinnedFields;
    const filteredExtraFields = hasMcField ? extraFields.filter(f => f.key !== 'link') : extraFields;

    const formatUrl = (url: string) => {
        if (!url) return '';
        let clean = url.replace(/^\(|\)$/g, '').replace(/^(https?)\/\//, '$1://');
        if (!clean.match(/^https?:\/\//)) {
            clean = `https://${clean}`;
        }
        return clean;
    };

    const [expandedFields, setExpandedFields] = React.useState<Set<string>>(new Set());

    const toggleFieldExpansion = (key: string) => {
        setExpandedFields(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const renderField = (f: { key: string; value: string }) => {
        const isMc = f.key === 'mc';
        const showLinkIcon = isMc && linkUrl && typeof linkUrl === 'string';
        const isExpanded = expandedFields.has(f.key);
        
        return (
            <div key={f.key} className="flex gap-2 text-[13px] items-start">
                <span className="font-bold text-primary w-20 shrink-0 capitalize pt-0.5">{formatFieldKey(f.key)}</span>
                <div className="text-gray-600 flex items-start min-w-0 flex-1">
                    <span 
                        className={`${isExpanded ? 'whitespace-normal' : 'truncate'} cursor-pointer hover:text-gray-900 transition-colors pt-0.5`}
                        onClick={() => toggleFieldExpansion(f.key)}
                        title={isExpanded ? "Click to collapse" : "Click to expand"}
                    >
                        {f.value}
                    </span>
                    {showLinkIcon && (
                        <a 
                            href={formatUrl(linkUrl)} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            title="Open Link" 
                            className="flex items-center shrink-0 pt-0.5 ml-1.5" 
                            onClick={(e) => e.stopPropagation()}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 hover:text-blue-700 cursor-pointer">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                        </a>
                    )}
                </div>
            </div>
        );
    };

    return (
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
                    {filteredPinnedFields.map(renderField)}

                    {showMoreFields && filteredExtraFields.map(renderField)}

                    {filteredExtraFields.length > 0 && (
                        <button
                            onClick={() => setShowMoreFields(!showMoreFields)}
                            className="text-[10px] font-bold text-primary text-left mt-1 hover:underline flex items-center gap-1 uppercase tracking-wider"
                        >
                            {showMoreFields ? '▲ Show Less' : `▼ +${filteredExtraFields.length} more details`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeadContactCard;
