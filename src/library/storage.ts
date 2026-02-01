import { useState, useEffect } from 'react';
import { BUILTIN_LIBRARY } from './builtin';
import type { LibraryItem } from './types';

const STORAGE_KEY = 'moji_library_user_items';

export function getUserItems(): LibraryItem[] {
    try {
        const json = localStorage.getItem(STORAGE_KEY);
        if (!json) return [];
        return JSON.parse(json);
    } catch (e) {
        console.error("Failed to load user library", e);
        return [];
    }
}

export function saveUserItem(item: LibraryItem) {
    const items = getUserItems();
    items.push(item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    // Dispatch event to sync hooks
    window.dispatchEvent(new Event('moji_library_update'));
}

export function deleteUserItem(id: string) {
    let items = getUserItems();
    items = items.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('moji_library_update'));
}

export function useLibrary() {
    const [items, setItems] = useState<LibraryItem[]>([...BUILTIN_LIBRARY, ...getUserItems()]);

    useEffect(() => {
        const handler = () => {
            setItems([...BUILTIN_LIBRARY, ...getUserItems()]);
        };
        window.addEventListener('moji_library_update', handler);
        return () => window.removeEventListener('moji_library_update', handler);
    }, []);

    return items;
}

export function getLibraryItem(id: string): LibraryItem | undefined {
    // Check built-in first
    const builtin = BUILTIN_LIBRARY.find(i => i.id === id);
    if (builtin) return builtin;

    // Check user
    const userItems = getUserItems();
    return userItems.find(i => i.id === id);
}
