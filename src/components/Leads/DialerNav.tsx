import React from 'react';

interface DialerNavProps {
    currentIndex: number;
    onPrev: () => void;
    onNext: () => void;
    onSkip: () => void;
    onBackToList: () => void;
    saving: boolean;
}

const DialerNav: React.FC<DialerNavProps> = ({ currentIndex, onPrev, onNext, onSkip, onBackToList, saving }) => (
    <div className="p-4">
        <div className="flex gap-2">
            <button
                onClick={onPrev}
                disabled={currentIndex === 0}
                className="bg-gray-100 cursor-pointer hover:bg-gray-200 text-gray-500  text-[12px] font-black uppercase tracking-wider px-5 py-3.5 rounded-xl transition-all disabled:opacity-30 disabled:scale-95 transform active:scale-95"
            >
                ← Prev
            </button>
            <button
                onClick={onNext}
                disabled={saving}
                className="flex-1 bg-primary cursor-pointer hover:bg-primary-dark text-white text-[12px] font-black py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-orange-900/10 transition-all uppercase tracking-[1px] transform active:scale-[0.98] disabled:opacity-50"
            >
                {saving ? 'Saving...' : 'Next Lead →'}
            </button>
            <button
                onClick={onSkip}
                className="bg-gray-100 cursor-pointer hover:bg-gray-200 text-gray-500 text-[12px] font-black uppercase tracking-wider px-5 py-3.5 rounded-xl transition-all transform active:scale-95"
            >
                Skip
            </button>
        </div>

        <button
            onClick={onBackToList}
            className="w-full cursor-pointer text-center text-[10px] font-black text-gray-300 hover:text-gray-500 uppercase tracking-[2px] py-4 transition-all"
        >
            ← Back to List
        </button>
    </div>
);

export default DialerNav;
