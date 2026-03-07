import React from 'react';

const AISuggestions: React.FC = () => {
    const suggestions = [
        { id: 1, text: '"That makes sense — let me ask you one quick thing about your setup..."' },
        { id: 2, text: '"Most of our clients said the same before they tried us..."' },
        { id: 3, text: '"No problem at all — can I follow up with you next week?"' }
    ];

    return (
        <div className="p-4 bg-indigo-50/50 border-t border-indigo-100">
            <div className="items-center gap-2 mb-3 flex">
                <span className="w-2 h-2 rounded-full bg-indigo-500 ai-pulse"></span>
                <p className="text-[10px] font-black tracking-widest uppercase text-indigo-500">AI Live Script Suggestions</p>
            </div>
            <div className="flex flex-col gap-2">
                {suggestions.map(s => (
                    <button
                        key={s.id}
                        className="flex items-start gap-2.5 bg-white border border-indigo-100 rounded-xl px-3 py-3 text-left hover:bg-indigo-50 transition-all shadow-sm shadow-indigo-900/5 group"
                    >
                        <span className="font-mono text-[10px] font-bold text-indigo-400 bg-indigo-50 rounded px-1.5 py-0.5 shrink-0 mt-0.5 group-hover:bg-indigo-100 transition-colors">
                            {s.id}
                        </span>
                        <p className="text-[12px] text-gray-600 leading-relaxed font-medium italic">{s.text}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AISuggestions;
