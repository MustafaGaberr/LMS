import localforage from 'localforage';

// Configure localforage
localforage.config({
    name: 'lms-app',
    storeName: 'app_store',
    description: 'LMS App Persistent State',
});

// Storage keys
export const STORAGE_KEYS = {
    ACTIVE_USER_ID: 'activeUserId',
    SETTINGS: 'settings',
    SEEN_ONBOARDING: 'seenOnboarding',
    PROGRESS: 'progress',
} as const;

// Generic get/set/remove helpers
export async function getItem<T>(key: string): Promise<T | null> {
    try {
        return await localforage.getItem<T>(key);
    } catch (err) {
        console.error(`[storage] getItem(${key})`, err);
        return null;
    }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
    try {
        await localforage.setItem<T>(key, value);
    } catch (err) {
        console.error(`[storage] setItem(${key})`, err);
    }
}

export async function removeItem(key: string): Promise<void> {
    try {
        await localforage.removeItem(key);
    } catch (err) {
        console.error(`[storage] removeItem(${key})`, err);
    }
}

export async function clearAll(): Promise<void> {
    try {
        await localforage.clear();
    } catch (err) {
        console.error('[storage] clearAll', err);
    }
}

// ─── Progress types ───────────────────────────────────────────────────────────

export interface LessonProgress {
    contentDone: boolean;
    quizDone: boolean;
    activityDone: boolean;
    completedAt?: number;
}

export interface Progress {
    completedLessons: Record<string, LessonProgress>;
}

// ─── Persisted state shape ────────────────────────────────────────────────────

export interface PersistedAppState {
    activeUserId: 'student1' | 'student2' | null;
    settings: { soundEnabled: boolean };
    seenOnboarding: boolean;
    progress: Progress;
}

// Load all persisted fields at boot
export async function initAppState(): Promise<PersistedAppState> {
    const [activeUserId, settings, seenOnboarding, progress] = await Promise.all([
        getItem<PersistedAppState['activeUserId']>(STORAGE_KEYS.ACTIVE_USER_ID),
        getItem<PersistedAppState['settings']>(STORAGE_KEYS.SETTINGS),
        getItem<boolean>(STORAGE_KEYS.SEEN_ONBOARDING),
        getItem<Progress>(STORAGE_KEYS.PROGRESS),
    ]);

    return {
        activeUserId: activeUserId ?? null,
        settings: settings ?? { soundEnabled: true },
        seenOnboarding: seenOnboarding ?? false,
        progress: progress ?? { completedLessons: {} },
    };
}
