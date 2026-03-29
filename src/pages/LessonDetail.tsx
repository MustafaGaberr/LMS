import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getLesson, getUnit } from '../data/sampleCourse';
import { useAppStore } from '../store/useAppStore';
import LessonMindMap, { type MindMapNodeData } from '../components/LessonMindMap';
import LessonVideoPlayer from '../components/LessonVideoPlayer';
import './LessonDetail.css';

type Tab = 'concept' | 'importance' | 'features';

const TABS: Tab[] = ['concept', 'importance', 'features'];
const DEFAULT_TAB_LABELS: Record<Tab, string> = {
    concept: 'مفهوم',
    importance: 'أهمية',
    features: 'خصائص',
};
const TAB_CSS: Record<Tab, string> = {
    concept: 'mafhoom',
    importance: 'ahamiyya',
    features: 'khassais',
};

const LessonDetail: React.FC = () => {
    const { unitId, lessonId } = useParams<{ unitId: string; lessonId: string }>();
    const navigate = useNavigate();

    const markContentDone = useAppStore((s) => s.markContentDone);

    const [step, setStep] = useState(0); 
    const [subStep, setSubStep] = useState(0); // For sub-sections within a tab
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const unit = getUnit(unitId ?? '');
    const lesson = getLesson(unitId ?? '', lessonId ?? '');

    // Reset sub-step when changing main tabs
    React.useEffect(() => {
        setSubStep(0);
    }, [step]);

    if (!unit || !lesson) {
        return (
            <div className="lesson-detail-page">
                <p className="lesson-detail-error">الدرس غير موجود.</p>
            </div>
        );
    }

    const availableTabs = TABS.filter(tab => {
        if (lesson.sectionLabels && lesson.sectionLabels[tab] === '') return false;
        return true;
    });

    const currentTab = availableTabs[step] || availableTabs[0];

    const handleBubbleClick = (idx: number) => {
        setStep(idx);
        setIsDropdownOpen(false);
    };

    const handleNext = () => {
        const currentSubSections = lesson.subSections?.[availableTabs[step]];
        
        // 1. If we have sub-sections and we're not at the last one, go to next sub-section
        if (currentSubSections && subStep < currentSubSections.length - 1) {
            setSubStep(subStep + 1);
        }
        // 2. Otherwise, if we're not at the last main tab, go to next main tab
        else if (step < availableTabs.length - 1) {
            const nextStep = step + 1;
            setStep(nextStep);
            setSubStep(0); // Reset for the new tab
            
            // Mark content done when reaching the last available main tab
            if (nextStep === availableTabs.length - 1) {
                markContentDone(lesson.id);
            }
        } 
        // 3. Otherwise, go to quiz
        else {
            navigate(`/units/${unitId}/lessons/${lessonId}/quiz-intro`);
        }
    };

    // Build mind-map node data from importance section text
    const mindMapNodes: MindMapNodeData[] = useMemo(() => {
        // Use pre-structured data if available
        if (lesson.mindMapData && lesson.mindMapData.length > 0) {
            return lesson.mindMapData;
        }

        const text = lesson.sections.importance;
        if (!text) return [];
        const COLORS = ['#4A90D9', '#34A853', '#9B59B6', '#E67E22', '#E74C3C', '#1ABC9C'];
        return text
            .split(/[،,؛;.]/)
            .map(s => s.trim())
            .filter(s => s.length > 10)
            .slice(0, 6)
            .map((point, i) => ({
                id: `imp-${i}`,
                title: point,
                color: COLORS[i % COLORS.length],
                details: [point],
            }));
    }, [lesson.mindMapData, lesson.sections.importance]);

    // ── Video completion state (reactive from store) ───────────────────────
    const videoDone = useAppStore(
        (s) => s.progress.completedLessons[lessonId ?? '']?.videoDone ?? false
    );
    const hasVideo = !!(lesson?.video?.url);

    // ── Video progress for external status display ─────────────────────────
    const [videoProgress, setVideoProgress] = useState(videoDone ? 100 : 0);
    const handleVideoProgress = useCallback((pct: number, completed: boolean) => {
        setVideoProgress(completed ? 100 : pct);
    }, []);

    return (
        <div className="lesson-detail-page">
            {/* ── Lesson title ─────────────────────────────────── */}
            <div className="lesson-title-box">
                <span className="lesson-title-text">{lesson.title}</span>
            </div>

            {/* ── Selection Dropdown ─────────────────────────── */}
            <div className="lesson-dropdown-container">
                <div 
                    className={`lesson-custom-select lesson-custom-select--${TAB_CSS[currentTab]} ${isDropdownOpen ? 'lesson-custom-select--open' : ''}`}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                    <span className="lesson-custom-select__label">
                        {lesson.sectionLabels ? lesson.sectionLabels[currentTab] : DEFAULT_TAB_LABELS[currentTab]}
                    </span>
                    <div className="lesson-dropdown-icon">▼</div>
                </div>

                {isDropdownOpen && (
                    <>
                        <div className="lesson-dropdown-overlay" onClick={() => setIsDropdownOpen(false)} />
                        <div className="lesson-dropdown-menu">
                            {availableTabs.map((tab, idx) => (
                                <div 
                                    key={tab} 
                                    className={`lesson-dropdown-item ${idx === step ? 'lesson-dropdown-item--active' : ''}`}
                                    onClick={() => handleBubbleClick(idx)}
                                >
                                    {lesson.sectionLabels ? lesson.sectionLabels[tab] : DEFAULT_TAB_LABELS[tab]}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* ── Sub-navigation (if applicable) ────────────────── */}
            {lesson.subSections?.[currentTab] && (
                <div className="lesson-sub-nav">
                    {lesson.subSections[currentTab].map((sub, idx) => (
                        <button 
                            key={sub.id}
                            className={`lesson-sub-button ${idx === subStep ? 'lesson-sub-button--active' : ''}`}
                            onClick={() => setSubStep(idx)}
                        >
                            {sub.label}
                        </button>
                    ))}
                </div>
            )}

            {/* ── Section content ──────────────────────────────── */}
            <div className={`lesson-section-content lesson-section-content--${currentTab}`}>
                {lesson.subSections?.[currentTab] ? (
                    <div className="lesson-sub-text-wrap">
                        <p className="lesson-section-text">
                            {lesson.subSections[currentTab][subStep].content}
                        </p>
                    </div>
                ) : (
                    <>
                        {currentTab === 'concept' && <p className="lesson-section-text">{lesson.sections.concept}</p>}

                        {currentTab === 'importance' && mindMapNodes.length > 0 && (
                            <div className="mindmap-container">
                                <LessonMindMap
                                    centerLabel={lesson.sectionLabels?.importance || DEFAULT_TAB_LABELS.importance}
                                    nodes={mindMapNodes}
                                />
                            </div>
                        )}

                        {currentTab === 'features' && (
                            <>
                                {hasVideo ? (
                                    <LessonVideoPlayer
                                        videoUrl={lesson.video.url}
                                        lessonId={lesson.id}
                                        onProgressChange={handleVideoProgress}
                                    />
                                ) : (
                                    <p className="lesson-section-text">{lesson.sections.features}</p>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>

            {/* ── Video progress status (outside content container) ── */}
            {currentTab === 'features' && hasVideo && (
                <div className="lesson-video-status">
                    {videoDone ? (
                        <div className="lesson-video-player__completed">
                            <span className="lesson-video-player__check">✅</span>
                            <span>تم إكمال مشاهدة الفيديو</span>
                        </div>
                    ) : (
                        <div className="lesson-video-player__progress">
                            <div className="lesson-video-player__bar-bg">
                                <div
                                    className="lesson-video-player__bar-fill"
                                    style={{ width: `${videoProgress}%` }}
                                />
                            </div>
                            <span className="lesson-video-player__pct">
                                تم مشاهدة {videoProgress}% من الفيديو
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* ── Next arrow footer (centered) ────────────────── */}
            {(() => {
                const isAtFinalStep =
                    step === availableTabs.length - 1 &&
                    (!lesson.subSections?.[availableTabs[step]] ||
                        subStep === (lesson.subSections?.[availableTabs[step]]?.length ?? 0) - 1);
                const isNextDisabled = isAtFinalStep && hasVideo && !videoDone;

                return (
                    <div className="lesson-nav-arrows">
                        <button
                            className={`lesson-nav-arrow lesson-nav-arrow--next ${
                                isAtFinalStep ? 'lesson-nav-arrow--primary' : ''
                            } ${isNextDisabled ? 'lesson-nav-arrow--disabled' : ''}`}
                            onClick={handleNext}
                            disabled={isNextDisabled}
                            aria-label="التالي"
                        >
                            <ArrowLeft size={26} />
                        </button>
                    </div>
                );
            })()}
        </div>
    );
};

export default LessonDetail;
