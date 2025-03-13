import { writable } from 'svelte/store';

// Check for browser environment before accessing localStorage
const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') || '' : '';

export const authStore = writable({ token: storedToken });

authStore.subscribe((value) => {
    if (typeof window !== 'undefined') {
        if (value.token) {
            localStorage.setItem('authToken', value.token);
        } else {
            localStorage.removeItem('authToken');
        }
    }
});
