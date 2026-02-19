import { create } from 'zustand';
import {
    setItem,
    removeItem,
    clearAll,
    STORAGE_KEYS,
} from '../services/storage';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserId = 'student1' | 'student2';
export type ThemeId = 'A' | 'B';

export interface UserSettings {
    soundEnabled: boolean;
}

interface AppState {
    // Data
    activeUserId: UserId | null;
    theme: ThemeId;
    settings: UserSettings;
    seenOnboarding: boolean;

    // Actions
    login: (username: string, password: string) => boolean;
    logout: () => void;
    toggleSound: () => void;
    markOnboardingSeen: () => void;
    resetAll: () => Promise<void>;

    // Bootstrap (called once on mount)
    hydrate: (data: {
        activeUserId: UserId | null;
        settings: UserSettings;
        seenOnboarding: boolean;
    }) => void;
}

// ─── Fixed credentials ────────────────────────────────────────────────────────

const USERS: Record<string, { password: string; theme: ThemeId }> = {
    student1: { password: '1234', theme: 'A' },
    student2: { password: '1234', theme: 'B' },
};

function deriveTheme(userId: UserId | null): ThemeId {
    if (!userId) return 'A';
    return USERS[userId]?.theme ?? 'A';
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>((set, get) => ({
    activeUserId: null,
    theme: 'A',
    settings: { soundEnabled: true },
    seenOnboarding: false,

    hydrate({ activeUserId, settings, seenOnboarding }) {
        set({
            activeUserId,
            theme: deriveTheme(activeUserId),
            settings,
            seenOnboarding,
        });
        // Apply theme to DOM
        applyTheme(deriveTheme(activeUserId));
    },

    login(username, password) {
        const user = USERS[username];
        if (!user || user.password !== password) return false;

        const userId = username as UserId;
        const theme = user.theme;

        set({ activeUserId: userId, theme });
        applyTheme(theme);

        // Persist
        void setItem(STORAGE_KEYS.ACTIVE_USER_ID, userId);

        return true;
    },

    logout() {
        set({ activeUserId: null, theme: 'A' });
        applyTheme('A');
        void removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
    },

    toggleSound() {
        const next = !get().settings.soundEnabled;
        set({ settings: { ...get().settings, soundEnabled: next } });
        void setItem(STORAGE_KEYS.SETTINGS, { ...get().settings, soundEnabled: next });
    },

    markOnboardingSeen() {
        set({ seenOnboarding: true });
        void setItem(STORAGE_KEYS.SEEN_ONBOARDING, true);
    },

    async resetAll() {
        await clearAll();
        set({
            activeUserId: null,
            theme: 'A',
            settings: { soundEnabled: true },
            seenOnboarding: false,
        });
        applyTheme('A');
    },
}));

// ─── DOM theme helper ─────────────────────────────────────────────────────────

function applyTheme(theme: ThemeId) {
    document.documentElement.setAttribute('data-theme', theme);
}
