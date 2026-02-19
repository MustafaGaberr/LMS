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
    DEVICE_ID: 'deviceId',
    SURVEY_AGGREGATES: 'surveyAggregates',
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

// ─── Survey types ─────────────────────────────────────────────────────────────

/** Aggregated counts: { [questionId]: { 1: count, 2: count, ..., 5: count } } */
export type SurveyLikertCounts = Record<number, number>;
export type SurveyAggregates = Record<string, SurveyLikertCounts>;

// ─── Persisted state shape ────────────────────────────────────────────────────

export interface PersistedAppState {
    activeUserId: 'student1' | 'student2' | null;
    settings: { soundEnabled: boolean };
    seenOnboarding: boolean;
    progress: Progress;
    deviceId: string;
    surveyAggregates: SurveyAggregates;
}

// ─── Device ID helper ─────────────────────────────────────────────────────────

export async function getOrCreateDeviceId(): Promise<string> {
    const existing = await getItem<string>(STORAGE_KEYS.DEVICE_ID);
    if (existing) return existing;
    const newId = `dev-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    await setItem(STORAGE_KEYS.DEVICE_ID, newId);
    return newId;
}

// ─── Load all persisted fields at boot ───────────────────────────────────────

export async function initAppState(): Promise<PersistedAppState> {
    const [activeUserId, settings, seenOnboarding, progress, deviceId, surveyAggregates] =
        await Promise.all([
            getItem<PersistedAppState['activeUserId']>(STORAGE_KEYS.ACTIVE_USER_ID),
            getItem<PersistedAppState['settings']>(STORAGE_KEYS.SETTINGS),
            getItem<boolean>(STORAGE_KEYS.SEEN_ONBOARDING),
            getItem<Progress>(STORAGE_KEYS.PROGRESS),
            getItem<string>(STORAGE_KEYS.DEVICE_ID),
            getItem<SurveyAggregates>(STORAGE_KEYS.SURVEY_AGGREGATES),
        ]);

    // Create device ID if not yet set
    const resolvedDeviceId =
        deviceId ??
        (() => {
            const id = `dev-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
            setItem(STORAGE_KEYS.DEVICE_ID, id);
            return id;
        })();

    return {
        activeUserId: activeUserId ?? null,
        settings: settings ?? { soundEnabled: true },
        seenOnboarding: seenOnboarding ?? false,
        progress: progress ?? { completedLessons: {} },
        deviceId: resolvedDeviceId,
        surveyAggregates: surveyAggregates ?? {},
    };
}
