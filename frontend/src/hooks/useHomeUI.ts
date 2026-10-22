import { useEffect, useState, type SyntheticEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import type { HomeChef } from '../types/HomeTypes';
import type { CatalogMenu } from '../components/home/catalogData';

// Chỉ quản lý tương tác giao diện
export function useHomeUI() {
    const navigate = useNavigate();
    const location = useLocation();
    const [keyword, setKeyword] = useState('');
    const [area, setArea] = useState('TP. Hồ Chí Minh');
    const [guests, setGuests] = useState(4);
    const [selectedMenu, setSelectedMenu] = useState<CatalogMenu | null>(null);
    const [selectedChef, setSelectedChef] = useState<HomeChef | null>(null);

    useEffect(() => {
        if (!location.hash) {
            return;
        }

        const section = document.getElementById(location.hash.slice(1));
        section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [location.hash]);

    function submitSearch(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();

        const params = new URLSearchParams();
        if (keyword.trim()) {
            params.set('q', keyword.trim());
        }
        params.set('guests', String(guests));
        navigate(`/menus?${params.toString()}`);
    }

    return {
        keyword,
        setKeyword,
        area,
        setArea,
        guests,
        setGuests,
        selectedMenu,
        setSelectedMenu,
        selectedChef,
        setSelectedChef,
        submitSearch,
    };
}
