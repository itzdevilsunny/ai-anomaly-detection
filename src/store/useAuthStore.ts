import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

export type Role = 'Admin' | 'Operator' | 'Viewer';

interface User {
    id: string;
    email: string;
    role: Role;
}

interface AuthState {
    user: User | null;
    token: string | null;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
}

// Persist stores the JWT in localStorage so the user stays logged in
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            setAuth: (user, token) => set({ user, token }),
            logout: () => set({ user: null, token: null }),
        }),
        { name: 'vision-auth-storage' }
    )
);

// ─── Axios Interceptor Setup ────────────────────────────────
// Called once in main.tsx / App.tsx to inject JWT into every request
export const setupAxiosInterceptors = () => {
    axios.interceptors.request.use((config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            // Auto-logout if JWT is expired or invalid
            if (error.response?.status === 401) {
                useAuthStore.getState().logout();
            }
            return Promise.reject(error);
        }
    );
};
