import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, ChevronLeft, CheckCircle } from 'lucide-react';
import { getUnit } from '../data/sampleCourse';
import { useAppStore } from '../store/useAppStore';
import './LessonsList.css';

const LessonsList: React.FC = () => {
    const { unitId } = useParams<{ unitId: string }>();
    const navigate = useNavigate();
    const isLessonUnlocked = useAppStore((s) => s.isLessonUnlocked);
    const getLessonProgress = useAppStore((s) => s.getLessonProgress);
    const isUnitUnlocked = useAppStore((s) => s.isUnitUnlocked);

    const unit = getUnit(unitId ?? '');

    if (!unit || !isUnitUnlocked(unit.id)) {
        return (
            <div className="lessons-page">
                <p className="lessons-error">هذه الوحدة غير متاحة بعد.</p>
            </div>
        );
    }

    return (
        <div className="lessons-page">
            {/* Unit header */}
            <div className="lessons-unit-header">
                <span className="lessons-unit-emoji">{unit.icon}</span>
                <div>
                    <h2 className="lessons-unit-title">{unit.title}</h2>
                    <p className="lessons-unit-desc">{unit.description}</p>
                </div>
            </div>

            {/* Lessons list */}
            <div className="lessons-list">
                {unit.lessons.map((lesson, idx) => {
                    const unlocked = isLessonUnlocked(unit.id, lesson.id);
                    const prog = getLessonProgress(lesson.id);
                    const isDone = prog.activityDone;
                    const isContentDone = prog.contentDone;

                    return (
                        <button
                            key={lesson.id}
                            className={`lesson-card ${!unlocked ? 'lesson-card--locked' : ''} ${isDone ? 'lesson-card--done' : ''}`}
                            disabled={!unlocked}
                            onClick={() =>
                                unlocked &&
                                navigate(`/units/${unit.id}/lessons/${lesson.id}`)
                            }
                        >
                            {/* Number bubble → progress icon */}
                            <div className="lesson-card__num">
                                {isDone ? (
                                    <CheckCircle size={18} className="lesson-card__done-icon" />
                                ) : !unlocked ? (
                                    <Lock size={15} />
                                ) : (
                                    <span>{idx + 1}</span>
                                )}
                            </div>

                            <div className="lesson-card__body">
                                <p className="lesson-card__title">{lesson.title}</p>
                                <div className="lesson-card__chips">
                                    <span className={`chip ${isContentDone ? 'chip--done' : 'chip--pending'}`}>
                                        {isContentDone ? '✓' : '○'} المحتوى
                                    </span>
                                    <span className={`chip ${prog.activityDone ? 'chip--done' : 'chip--pending'}`}>
                                        {prog.activityDone ? '✓' : '○'} النشاط
                                    </span>
                                    {!unlocked && (
                                        <span className="chip chip--locked">مقفل</span>
                                    )}
                                </div>
                            </div>

                            {unlocked && (
                                <ChevronLeft
                                    size={16}
                                    className="lesson-card__arrow"
                                    style={{ transform: 'rotate(180deg)' }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default LessonsList;
