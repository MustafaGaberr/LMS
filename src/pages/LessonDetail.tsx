import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { MessageSquare, Activity, CheckCircle, BookOpen, Play } from 'lucide-react';
import { getLesson, getUnit } from '../data/sampleCourse';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/Button';
import './LessonDetail.css';

type Tab = 'concept' | 'importance' | 'features';

const TAB_LABELS: { id: Tab; label: string }[] = [
    { id: 'concept', label: 'مفهوم' },
    { id: 'importance', label: 'أهمية' },
    { id: 'features', label: 'خصائص' },
];

const LessonDetail: React.FC = () => {
    const { unitId, lessonId } = useParams<{ unitId: string; lessonId: string }>();
    const navigate = useNavigate();

    const markContentDone = useAppStore((s) => s.markContentDone);
    const getLessonProgress = useAppStore((s) => s.getLessonProgress);

    const [tab, setTab] = useState<Tab>('concept');
    const [videoReady, setVideoReady] = useState(false);

    const unit = getUnit(unitId ?? '');
    const lesson = getLesson(unitId ?? '', lessonId ?? '');

    if (!unit || !lesson) {
        return (
            <div className="lesson-detail-page">
                <p className="lesson-detail-error">الدرس غير موجود.</p>
            </div>
        );
    }

    const progress = getLessonProgress(lesson.id);

    const handleMarkDone = () => {
        if (!progress.contentDone) markContentDone(lesson.id);
    };

    return (
        <div className="lesson-detail-page">
            {/* ── 3-tab segmented control ─────────────────────────── */}
            <div className="lesson-tabs">
                {TAB_LABELS.map(({ id, label }) => (
                    <button
                        key={id}
                        className={`lesson-tab ${tab === id ? 'lesson-tab--active' : ''}`}
                        onClick={() => setTab(id)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* ── Tab content ─────────────────────────────────────── */}
            <div className="lesson-content-area">
                <BookOpen size={18} className="lesson-content-icon" />
                <p className="lesson-content-text">{lesson.sections[tab]}</p>
            </div>

            {/* ── contentDone button ──────────────────────────────── */}
            <button
                className={`lesson-read-btn ${progress.contentDone ? 'lesson-read-btn--done' : ''}`}
                onClick={handleMarkDone}
                disabled={progress.contentDone}
            >
                <CheckCircle size={18} />
                {progress.contentDone ? 'تمت قراءة المحتوى ✓' : 'تمت قراءة هذا القسم'}
            </button>

            {/* ── Divider ─────────────────────────────────────────── */}
            <div className="lesson-divider">
                <Play size={14} />
                <span>الفيديو التعليمي</span>
            </div>

            {/* ── react-player (embedded, never opens externally) ─── */}
            <div className="lesson-player-wrap">
                {!videoReady && (
                    <div className="lesson-player-skeleton">
                        <Play size={32} className="lesson-player-skeleton__icon" />
                        <span>جارٍ تحميل الفيديو…</span>
                    </div>
                )}
                <div className={`lesson-player-inner ${!videoReady ? 'lesson-player-inner--hidden' : ''}`}>
                    <ReactPlayer
                        url={lesson.video.url}
                        width="100%"
                        height="100%"
                        controls
                        onReady={() => setVideoReady(true)}
                        config={{
                            youtube: {
                                playerVars: {
                                    modestbranding: 1,
                                    rel: 0,
                                    fs: 1,
                                },
                            },
                        }}
                    />
                </div>
            </div>

            {/* ── Navigation footer ───────────────────────────────── */}
            <div className="lesson-footer">
                <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    icon={<MessageSquare size={18} />}
                    onClick={() =>
                        navigate(`/units/${unitId}/lessons/${lessonId}/chat`)
                    }
                >
                    الانتقال للأسئلة
                </Button>
                <Button
                    variant="secondary"
                    size="md"
                    fullWidth
                    icon={<Activity size={18} />}
                    onClick={() =>
                        navigate(`/units/${unitId}/lessons/${lessonId}/activity`)
                    }
                >
                    النشاط التطبيقي
                </Button>
            </div>
        </div>
    );
};

export default LessonDetail;
