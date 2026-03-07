import React from 'react';

interface OutcomeManagerProps {
    selectedOutcome: string;
    setSelectedOutcome: (outcome: string) => void;
    notes: string;
    setNotes: (notes: string) => void;
    callbackDate: string;
    setCallbackDate: (date: string) => void;
}

const OutcomeManager: React.FC<OutcomeManagerProps> = ({
    selectedOutcome,
    setSelectedOutcome,
    notes,
    setNotes,
    callbackDate,
    setCallbackDate
}) => {
    const outcomes = [
        { key: 'answered', label: 'Answered', icon: '✓', color: 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' },
        { key: 'no_answer', label: 'No Ans.', icon: '✕', color: 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50' },
        { key: 'voicemail', label: 'Voicemail', icon: '📭', color: 'bg-orange-50 text-orange-500 border-orange-200 hover:bg-orange-100' },
        { key: 'callback', label: 'Callback', icon: '🔁', color: 'bg-primary-light text-primary-dark border-orange-200 hover:bg-orange-100' },
        { key: 'not_interested', label: 'Not Int.', icon: '—', color: 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100' },
    ];

    return (
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <p className="text-[12px] font-black tracking-widest uppercase text-gray-400 mb-3">Log Call Outcome</p>
            <div className="grid grid-cols-5 gap-1.5 mb-3">
                {outcomes.map((o) => (
                    <button
                        key={o.key}
                        onClick={() => {
                            setSelectedOutcome(o.key);
                            if (o.key === 'callback' && !callbackDate) {
                                setCallbackDate(new Date().toISOString().split('T')[0]);
                            }
                        }}
                        className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-[9px] font-black border transition-all duration-150 uppercase tracking-tight ${o.color} ${selectedOutcome === o.key ? 'ring-2 ring-primary ring-offset-2 scale-105 z-10 shadow-lg' : ''
                            }`}
                    >
                        <span className="text-base">{o.icon}</span>{o.label}
                    </button>
                ))}
            </div>

            {selectedOutcome === 'callback' && (
                <div className="mb-3 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-3">
                        <span className="text-primary-dark font-bold text-[14px] whitespace-nowrap">📅 Callback:</span>
                        <input
                            type="date"
                            className="w-full bg-primary-light border border-orange-200 rounded-xl px-4 py-3 font-mono text-[14px] font-bold text-primary-dark outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden block appearance-none"
                            value={callbackDate}
                            onChange={(e) => setCallbackDate(e.target.value)}
                        />
                    </div>
                </div>
            )}

            <textarea
                className="w-full bg-white border border-gray-100 rounded-xl px-3.5 py-3  text-[14px] text-gray-700 placeholder-gray-300 resize-none outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all min-h-[70px] font-sans italic shadow-sm"
                placeholder="Type a note about this call..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
            />
        </div>
    );
};

export default OutcomeManager;
