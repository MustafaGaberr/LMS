import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getLesson, getUnit } from '../data/sampleCourse';
import { useAppStore } from '../store/useAppStore';
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

    // Extract importance points for mind map
    const importanceText = lesson.sections.importance;
    const importancePoints = importanceText
        .split(/[،,؛;.]/)
        .map(s => s.trim())
        .filter(s => s.length > 10)
        .slice(0, 5);

    // Get YouTube video ID
    const getYouTubeId = (url: string) => {
        const match = url.match(/(?:v=|\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{11})/);
        return match ? match[1] : '';
    };
    const videoId = getYouTubeId(lesson.video.url);

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

                        {currentTab === 'importance' && (
                            <div className="mindmap-container">
                                <MindMap title={lesson.title} points={importancePoints} centerLabel={lesson.sectionLabels?.importance || DEFAULT_TAB_LABELS.importance} />
                            </div>
                        )}

                        {currentTab === 'features' && (
                            <>
                                {videoId ? (
                                    <div className="lesson-yt-wrap">
                                        <iframe
                                            src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
                                            title={lesson.title}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            referrerPolicy="strict-origin-when-cross-origin"
                                            allowFullScreen
                                            className="lesson-yt-iframe"
                                        />
                                    </div>
                                ) : (
                                    <p className="lesson-section-text">{lesson.sections.features}</p>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>

            {/* ── Next arrow footer (centered) ────────────────── */}
            <div className="lesson-nav-arrows">
                <button
                    className={`lesson-nav-arrow lesson-nav-arrow--next ${
                        (step === availableTabs.length - 1 && (!lesson.subSections?.[availableTabs[step]] || subStep === (lesson.subSections?.[availableTabs[step]]?.length ?? 0) - 1)) 
                        ? 'lesson-nav-arrow--primary' : ''
                    }`}
                    onClick={handleNext}
                    aria-label="التالي"
                >
                    <ArrowLeft size={26} />
                </button>
            </div>
        </div>
    );
};

/* ── Mind Map Component ──────────────────────────────────────────────────── */

interface MindMapProps {
    title: string;
    points: string[];
    centerLabel?: string;
}

const MindMap: React.FC<MindMapProps> = ({ points, centerLabel = 'الأهمية' }) => {
    const centerX = 160;
    const centerY = 110;
    const branchColors = ['#6C8EBF', '#82B366', '#D79B00', '#9673A6', '#23445D'];

    const angles = [-60, -20, 20, 60, 90];
    const branchLength = 90;

    return (
        <svg
            viewBox="0 0 320 280"
            className="mindmap-svg"
        >
            {/* Central node */}
            <ellipse cx={centerX} cy={centerY} rx={52} ry={28} fill="#23445D" />
            <text
                x={centerX}
                y={centerY + 5}
                textAnchor="middle"
                fill="white"
                fontSize="11"
                fontFamily="Cairo, sans-serif"
                fontWeight="bold"
            >
                {centerLabel}
            </text>

            {points.map((point, i) => {
                const angleDeg = angles[i] ?? (i * 35 - 60);
                const angleRad = (angleDeg * Math.PI) / 180;
                const x2 = centerX + branchLength * Math.sin(angleRad);
                const y2 = centerY + branchLength * Math.cos(angleRad);
                const color = branchColors[i % branchColors.length];

                const words = point.split(' ');
                const lines: string[] = [];
                let current = '';
                for (const w of words) {
                    if ((current + ' ' + w).trim().length > 18) {
                        if (current) lines.push(current.trim());
                        current = w;
                    } else {
                        current = (current + ' ' + w).trim();
                    }
                }
                if (current) lines.push(current.trim());
                const maxLines = lines.slice(0, 3);

                return (
                    <g key={i}>
                        <line
                            x1={centerX}
                            y1={centerY}
                            x2={x2}
                            y2={y2}
                            stroke={color}
                            strokeWidth="1.5"
                            strokeDasharray="3 2"
                        />
                        <ellipse
                            cx={x2}
                            cy={y2}
                            rx={48}
                            ry={18}
                            fill={color}
                            fillOpacity={0.15}
                            stroke={color}
                            strokeWidth="1.2"
                        />
                        {maxLines.map((line, li) => (
                            <text
                                key={li}
                                x={x2}
                                y={y2 - (maxLines.length - 1) * 5.5 + li * 11}
                                textAnchor="middle"
                                fill={color}
                                fontSize="8"
                                fontFamily="Cairo, sans-serif"
                                fontWeight="600"
                            >
                                {line}
                            </text>
                        ))}
                    </g>
                );
            })}
        </svg>
    );
};

export default LessonDetail;
