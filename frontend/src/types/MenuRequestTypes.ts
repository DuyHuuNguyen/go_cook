export interface MenuRequestDraft {
    dishes: string[];
    servingStyle: 'gia-dinh' | 'tiec' | 'eat-clean' | 'mon-chay';
    preferences: string[];
    adults: number;
    children: number;
    notes: string;
    mealDate: string;
    mealTime: string;
    address: string;
    locationNotes: string;
    equipment: string[];
    minBudget: number;
    maxBudget: number;
    referenceFile: File | null;
}
