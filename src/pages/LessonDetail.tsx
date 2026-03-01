import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Activity } from 'lucide-react';
import { getLesson, getUnit } from '../data/sampleCourse';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/Button';
import './LessonDetail.css';

type Tab = 'concept' | 'importance' | 'features';

const LessonDetail: React.FC = () => {
    const { unitId, lessonId } = useParams<{ unitId: string; lessonId: string }>();
    const navigate = useNavigate();

    const markContentDone = useAppStore((s) => s.markContentDone);
    const getLessonProgress = useAppStore((s) => s.getLessonProgress);

    const [tab, setTab] = useState<Tab | null>(null);

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

    const handleTabClick = (t: Tab) => {
        setTab(prev => prev === t ? null : t);
        if (!progress.contentDone) markContentDone(lesson.id);
    };

    // Extract importance points for mind map
    const importanceText = lesson.sections.importance;
    const importancePoints = importanceText
        .split(/[،,؛;.]/)
        .map(s => s.trim())
        .filter(s => s.length > 10)
        .slice(0, 5);

    // Get YouTube video ID – handles watch?v=, youtu.be/, and /embed/ URLs
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



            {/* ── 3 oval clickable bubbles ─────────────────────── */}
            <div className="lesson-bubbles-container">
                {/* مفهوم - right */}
                <button
                    className={`lesson-bubble lesson-bubble--mafhoom ${tab === 'concept' ? 'lesson-bubble--active' : ''}`}
                    onClick={() => handleTabClick('concept')}
                >
                    مفهوم
                </button>

                {/* أهمية - center top */}
                <button
                    className={`lesson-bubble lesson-bubble--ahamiyya ${tab === 'importance' ? 'lesson-bubble--active' : ''}`}
                    onClick={() => handleTabClick('importance')}
                >
                    أهمية
                </button>

                {/* خصائص - left */}
                <button
                    className={`lesson-bubble lesson-bubble--khassais ${tab === 'features' ? 'lesson-bubble--active' : ''}`}
                    onClick={() => handleTabClick('features')}
                >
                    خصائص
                </button>
            </div>

            {/* ── Section content ──────────────────────────────── */}
            {tab === 'concept' && (
                <div className="lesson-section-content lesson-section-content--concept">
                    <p className="lesson-section-text">{lesson.sections.concept}</p>
                </div>
            )}

            {tab === 'importance' && (
                <div className="lesson-section-content lesson-section-content--importance">
                    <div className="mindmap-container">
                        <MindMap title={lesson.title} points={importancePoints} />
                    </div>
                </div>
            )}

            {tab === 'features' && (
                <div className="lesson-section-content lesson-section-content--features">
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
                </div>
            )}

            {/* ── Footer navigation ────────────────────────────── */}
            <div className="lesson-footer">
                <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    icon={<MessageSquare size={18} />}
                    onClick={() => navigate(`/units/${unitId}/lessons/${lessonId}/chat`)}
                >
                    الانتقال للأسئلة
                </Button>
                <Button
                    variant="secondary"
                    size="md"
                    fullWidth
                    icon={<Activity size={18} />}
                    onClick={() => navigate(`/units/${unitId}/lessons/${lessonId}/activity`)}
                >
                    النشاط التطبيقي
                </Button>
            </div>
        </div>
    );
};

/* ── Mind Map Component ──────────────────────────────────────────────────── */

interface MindMapProps {
    title: string;
    points: string[];
}

const MindMap: React.FC<MindMapProps> = ({ points }) => {
    const centerX = 160;
    const centerY = 110;
    const branchColors = ['#6C8EBF', '#82B366', '#D79B00', '#9673A6', '#23445D'];

    // Spread branches from center downward/sideways
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
                الأهمية
            </text>

            {points.map((point, i) => {
                const angleDeg = angles[i] ?? (i * 35 - 60);
                const angleRad = (angleDeg * Math.PI) / 180;
                const x2 = centerX + branchLength * Math.sin(angleRad);
                const y2 = centerY + branchLength * Math.cos(angleRad);
                const color = branchColors[i % branchColors.length];

                // Word wrap: max ~20 chars per line
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
                        {/* Branch line */}
                        <line
                            x1={centerX}
                            y1={centerY}
                            x2={x2}
                            y2={y2}
                            stroke={color}
                            strokeWidth="1.5"
                            strokeDasharray="3 2"
                        />
                        {/* Leaf node */}
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
                        {/* Text */}
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
