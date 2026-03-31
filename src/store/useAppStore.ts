import { create } from 'zustand';
import { setItem, getItem, removeItem, clearAll, STORAGE_KEYS } from '../services/storage';
import type { Progress, LessonProgress, SurveyAggregates, SurveyLikertCounts, SavedChatMessage } from '../services/storage';
import { course, getUnitIndex, getLessonIndex } from '../data/sampleCourse';

// ─── User-scoped storage key helper ──────────────────────────────────────────
function progressKey(userId: string | null): string {
    return userId ? `${STORAGE_KEYS.PROGRESS}_${userId}` : STORAGE_KEYS.PROGRESS;
}

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
    progress: Progress;
    deviceId: string;
    surveyAggregates: SurveyAggregates;

    // Auth actions
    login: (username: string, password: string) => boolean;
    logout: () => void;

    // Settings actions
    toggleSound: () => void;
    markOnboardingSeen: () => void;

    // Progress actions
    markContentDone: (lessonId: string) => void;
    markQuizDone: (lessonId: string) => void;
    markActivityDone: (lessonId: string) => void;
    markVideoDone: (lessonId: string) => void;
    saveChatHistory: (lessonId: string, messages: SavedChatMessage[]) => void;

    // Unlock selectors
    isUnitUnlocked: (unitId: string) => boolean;
    isLessonUnlocked: (unitId: string, lessonId: string) => boolean;
    getLessonProgress: (lessonId: string) => LessonProgress;
    isAllCourseDone: () => boolean;

    // Survey actions
    submitSurveyResponse: (responses: Record<string, number>) => void;
    resetSurveyStats: () => void;

    // App reset
    resetAll: () => Promise<void>;

    // Bootstrap
    hydrate: (data: {
        activeUserId: UserId | null;
        settings: UserSettings;
        seenOnboarding: boolean;
        progress: Progress;
        deviceId: string;
        surveyAggregates: SurveyAggregates;
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

// ─── Default lesson progress ──────────────────────────────────────────────────

const DEFAULT_LESSON_PROGRESS: LessonProgress = {
    contentDone: false,
    quizDone: false,
    activityDone: false,
    videoDone: false,
};

// ─── Unlock logic helpers (pure, read from state snapshot) ───────────────────

function computeIsUnitUnlocked(unitId: string, progress: Progress): boolean {
    const idx = getUnitIndex(unitId);
    if (idx < 0) return false;
    if (idx === 0) return true;

    const prevUnit = course.units[idx - 1];
    return prevUnit.lessons.every(
        (l) => progress.completedLessons[l.id]?.activityDone === true
    );
}

function computeIsLessonUnlocked(
    unitId: string,
    lessonId: string,
    progress: Progress
): boolean {
    if (!computeIsUnitUnlocked(unitId, progress)) return false;

    const unit = course.units.find((u) => u.id === unitId);
    if (!unit) return false;

    const idx = getLessonIndex(unitId, lessonId);
    if (idx < 0) return false;
    if (idx === 0) return true;

    const prevLesson = unit.lessons[idx - 1];
    return progress.completedLessons[prevLesson.id]?.activityDone === true;
}

// ─── Helper to persist + update progress ─────────────────────────────────────

function patchLesson(
    get: () => AppState,
    set: (s: Partial<AppState>) => void,
    lessonId: string,
    patch: Partial<LessonProgress>
) {
    const current = get().progress;
    const existing = current.completedLessons[lessonId] ?? { ...DEFAULT_LESSON_PROGRESS };
    const updated = { ...existing, ...patch };

    if (updated.contentDone && updated.activityDone) {
        updated.completedAt = updated.completedAt ?? Date.now();
    }

    const next: Progress = {
        ...current,
        completedLessons: {
            ...current.completedLessons,
            [lessonId]: updated,
        },
    };
    set({ progress: next });
    // Save under the user-scoped key so each user has independent progress
    void setItem(progressKey(get().activeUserId), next);
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>((set, get) => ({
    activeUserId: null,
    theme: 'A',
    settings: { soundEnabled: true },
    seenOnboarding: false,
    progress: { completedLessons: {}, surveyFilled: false },
    deviceId: '',
    surveyAggregates: {},

    hydrate({ activeUserId, settings, seenOnboarding, progress, deviceId, surveyAggregates }) {
        // Defensive hydration for backward compatibility
        const safeProgress: Progress = {
            completedLessons: progress?.completedLessons ?? {},
            surveyFilled: progress?.surveyFilled ?? false,
            surveyResponses: progress?.surveyResponses,
        };

        set({
            activeUserId,
            theme: deriveTheme(activeUserId),
            settings: settings ?? { soundEnabled: true },
            seenOnboarding: !!seenOnboarding,
            progress: safeProgress,
            deviceId,
            surveyAggregates: surveyAggregates ?? {},
        });
        applyTheme(deriveTheme(activeUserId));
    },

    login(username, password) {
        const user = USERS[username];
        if (!user || user.password !== password) return false;

        const userId = username as UserId;
        const theme = user.theme;

        // Load this user's own progress from storage, then hydrate
        void getItem<Progress>(progressKey(userId)).then((savedProgress) => {
            const safeProgress: Progress = {
                completedLessons: savedProgress?.completedLessons ?? {},
                surveyFilled: savedProgress?.surveyFilled ?? false,
                surveyResponses: savedProgress?.surveyResponses,
            };
            set({ progress: safeProgress });
        });

        set({ activeUserId: userId, theme });
        applyTheme(theme);
        void setItem(STORAGE_KEYS.ACTIVE_USER_ID, userId);
        return true;
    },

    logout() {
        set({ activeUserId: null, theme: 'A', progress: { completedLessons: {}, surveyFilled: false } });
        applyTheme('A');
        void removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
    },

    toggleSound() {
        const next = !get().settings.soundEnabled;
        const settings = { ...get().settings, soundEnabled: next };
        set({ settings });
        void setItem(STORAGE_KEYS.SETTINGS, settings);
    },

    markOnboardingSeen() {
        set({ seenOnboarding: true });
        void setItem(STORAGE_KEYS.SEEN_ONBOARDING, true);
    },

    markContentDone(lessonId) {
        patchLesson(get, set, lessonId, { contentDone: true });
    },

    markQuizDone(lessonId) {
        patchLesson(get, set, lessonId, { quizDone: true });
    },

    markActivityDone(lessonId) {
        patchLesson(get, set, lessonId, { activityDone: true });
    },

    markVideoDone(lessonId) {
        patchLesson(get, set, lessonId, { videoDone: true });
    },

    saveChatHistory(lessonId, messages) {
        patchLesson(get, set, lessonId, { chatHistory: messages });
    },

    getLessonProgress(lessonId) {
        return get().progress.completedLessons[lessonId] ?? { ...DEFAULT_LESSON_PROGRESS };
    },

    isUnitUnlocked(unitId) {
        return computeIsUnitUnlocked(unitId, get().progress);
    },

    isLessonUnlocked(unitId, lessonId) {
        return computeIsLessonUnlocked(unitId, lessonId, get().progress);
    },

    isAllCourseDone() {
        const progress = get().progress;
        return course.units.every((unit) =>
            unit.lessons.every((l) => progress.completedLessons[l.id]?.activityDone === true)
        );
    },

    submitSurveyResponse(responses: Record<string, number>) {
        if (get().progress.surveyFilled) return; // Block duplicate submissions

        // 1. Update Global Aggregates
        const currentAgg = get().surveyAggregates;
        const nextAgg: SurveyAggregates = { ...currentAgg };

        for (const [qId, value] of Object.entries(responses)) {
            const existing: SurveyLikertCounts = nextAgg[qId] ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            nextAgg[qId] = { ...existing, [value]: (existing[value] ?? 0) + 1 };
        }

        // 2. Update User Progress (Mark as Filled + Save Responses)
        const currentProgress = get().progress;
        const nextProgress: Progress = {
            ...currentProgress,
            surveyFilled: true,
            surveyResponses: responses,
        };

        set({ 
            surveyAggregates: nextAgg,
            progress: nextProgress
        });

        void setItem(STORAGE_KEYS.SURVEY_AGGREGATES, nextAgg);
        void setItem(progressKey(get().activeUserId), nextProgress);
    },

    resetSurveyStats() {
        set({ surveyAggregates: {} });
        void setItem(STORAGE_KEYS.SURVEY_AGGREGATES, {});
    },

    async resetAll() {
        await clearAll();
        set({
            activeUserId: null,
            theme: 'A',
            settings: { soundEnabled: true },
            seenOnboarding: false,
            progress: { completedLessons: {}, surveyFilled: false, surveyResponses: undefined },
            surveyAggregates: {},
        });
        applyTheme('A');
    },
}));

// ─── DOM theme helper ─────────────────────────────────────────────────────────

function applyTheme(theme: ThemeId) {
    document.documentElement.setAttribute('data-theme', theme);
}
