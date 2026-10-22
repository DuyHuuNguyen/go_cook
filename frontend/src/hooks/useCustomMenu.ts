import { useState } from 'react';
import type { MenuRequestDraft } from '../types/MenuRequestTypes';

const initialDraft: MenuRequestDraft = {
    dishes: [],
    servingStyle: 'gia-dinh',
    preferences: [],
    adults: 2,
    children: 2,
    notes: '',
    mealDate: '',
    mealTime: '18:30',
    address: '',
    locationNotes: '',
    equipment: [],
    minBudget: 600000,
    maxBudget: 900000,
    referenceFile: null,
};

export function useCustomMenu() {
    const [draft, setDraft] = useState<MenuRequestDraft>(initialDraft);
    const [newDish, setNewDish] = useState('');
    const [message, setMessage] = useState('');
    const [previewOpen, setPreviewOpen] = useState(false);

    function update<K extends keyof MenuRequestDraft>(key: K, value: MenuRequestDraft[K]) {
        setDraft((current) => ({ ...current, [key]: value }));
        setMessage('');
    }

    function addDish() {
        const name = newDish.trim().replace(/\s+/g, ' ');
        if (!name) return;
        if (draft.dishes.some((dish) => dish.toLocaleLowerCase('vi-VN') === name.toLocaleLowerCase('vi-VN'))) {
            setMessage('Món ăn này đã có trong danh sách.');
            return;
        }
        update('dishes', [...draft.dishes, name]);
        setNewDish('');
    }

    function removeDish(name: string) {
        update('dishes', draft.dishes.filter((dish) => dish !== name));
    }

    function toggleList(key: 'preferences' | 'equipment', value: string) {
        const current = draft[key];
        update(key, current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
    }

    function changeGuests(key: 'adults' | 'children', amount: number) {
        update(key, Math.max(0, Math.min(100, draft[key] + amount)));
    }

    function openPreview() {
        if (!draft.dishes.length) {
            setMessage('Bạn cần thêm ít nhất một món ăn.');
            document.getElementById('tao-mon')?.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        if (draft.adults + draft.children < 1) {
            setMessage('Số khách phải lớn hơn 0.');
            document.getElementById('so-khach')?.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        if (!draft.mealDate || !draft.address.trim()) {
            setMessage('Vui lòng nhập ngày dùng bữa và địa chỉ.');
            document.getElementById('thoi-gian')?.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        if (draft.minBudget <= 0 || draft.maxBudget < draft.minBudget) {
            setMessage('Ngân sách tối đa phải lớn hơn hoặc bằng ngân sách tối thiểu.');
            document.getElementById('ngan-sach')?.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        setMessage('');
        setPreviewOpen(true);
    }

    return {
        draft,
        newDish,
        setNewDish,
        message,
        previewOpen,
        setPreviewOpen,
        update,
        addDish,
        removeDish,
        toggleList,
        changeGuests,
        openPreview,
    };
}
