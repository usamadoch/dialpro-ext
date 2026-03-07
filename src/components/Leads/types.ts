export interface Lead {
    _id: string;
    phone: string;
    name: string;
    company: string;
    location: string;
    extra_info: Record<string, any>;
    position: number;
    status: string;
}

export interface AssignmentInfo {
    id: string;
    list_id: string;
    current_position: number;
}

export interface FieldPref {
    key: string;
    pinned: boolean;
}

export const OUTCOME_STYLES: Record<string, string> = {
    'o-answered': 'bg-accent-green/[0.09] border-accent-green/[0.33] text-accent-green',
    'o-noanswer': 'bg-white/[0.04] border-white/[0.13] text-text-muted',
    'o-voicemail': 'bg-white/[0.04] border-white/[0.13] text-text-muted',
    'o-callback': 'bg-accent-gold/[0.09] border-accent-gold/[0.33] text-accent-gold',
    'o-notint': 'bg-accent-red/[0.09] border-accent-red/[0.33] text-accent-red',
};

export const BADGE_STYLES: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-400',
    callback: 'bg-primary-light text-primary-dark',
    done: 'bg-green-50 text-green-600',
};
