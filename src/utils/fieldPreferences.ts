export interface FieldPref {
    key: string;
    pinned: boolean;
}

const PREFS_KEY = 'dialpro_field_prefs';
const FIELDS_KEY = 'dialpro_available_fields';

async function storageGet(key: string): Promise<any> {
    try {
        const result = await chrome.storage.local.get(key) as Record<string, any>;
        return result[key] ?? null;
    } catch {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : null;
    }
}

async function storageSet(key: string, value: any): Promise<void> {
    try {
        await chrome.storage.local.set({ [key]: value });
    } catch {
        localStorage.setItem(key, JSON.stringify(value));
    }
}

export async function getFieldPreferences(): Promise<FieldPref[]> {
    return (await storageGet(PREFS_KEY)) || [];
}

export async function saveFieldPreferences(prefs: FieldPref[]): Promise<void> {
    await storageSet(PREFS_KEY, prefs);
}

export async function getAvailableFields(): Promise<string[]> {
    return (await storageGet(FIELDS_KEY)) || ['company', 'location'];
}

export async function saveAvailableFields(fields: string[]): Promise<void> {
    await storageSet(FIELDS_KEY, fields);
}

/** Extract all unique field keys from leads, ensuring company & location come first */
export function extractFieldKeys(leads: { company?: string; location?: string; extra_info?: Record<string, any> }[]): string[] {
    const keys = new Set<string>();
    leads.forEach(lead => {
        if (lead.company) keys.add('company');
        if (lead.location) keys.add('location');
        if (lead.extra_info) {
            Object.keys(lead.extra_info).forEach(k => keys.add(k));
        }
    });
    const result = ['company', 'location'];
    keys.forEach(k => {
        if (k !== 'company' && k !== 'location') result.push(k);
    });
    return result;
}

/** Merge saved preferences with newly discovered fields */
export function mergePrefsWithFields(saved: FieldPref[], available: string[]): FieldPref[] {
    if (saved.length === 0) {
        return available.map((key, i) => ({ key, pinned: i < 2 }));
    }
    const savedKeys = new Set(saved.map(p => p.key));
    return [
        ...saved.filter(p => available.includes(p.key)),
        ...available.filter(k => !savedKeys.has(k)).map(k => ({ key: k, pinned: false })),
    ];
}

/** Format field key for display: "extra_info_key" → "Extra Info Key" */
export function formatFieldKey(key: string): string {
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
