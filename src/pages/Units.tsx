import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ChevronLeft, CheckCircle } from 'lucide-react';
import { course } from '../data/sampleCourse';
import { useAppStore } from '../store/useAppStore';
import './Units.css';

const Units: React.FC = () => {
    const navigate = useNavigate();
    const isUnitUnlocked = useAppStore((s) => s.isUnitUnlocked);
    const isLessonUnlocked = useAppStore((s) => s.isLessonUnlocked);
    const progress = useAppStore((s) => s.progress);

    return (
        <div className="units-page">
            <div className="units-header">
                <h2 className="units-header__title">وحدات الدورة</h2>
                <p className="units-header__sub">{course.title}</p>
            </div>

            <div className="units-list">
                {course.units.map((unit) => {
                    const unlocked = isUnitUnlocked(unit.id);
                    const completedCount = unit.lessons.filter(
                        (l) => progress.completedLessons[l.id]?.activityDone
                    ).length;
                    const allDone = completedCount === unit.lessons.length;
                    const firstUnlockedLesson = unit.lessons.find(
                        (l) => isLessonUnlocked(unit.id, l.id)
                    );

                    return (
                        <button
                            key={unit.id}
                            className={`unit-card ${!unlocked ? 'unit-card--locked' : ''} ${allDone ? 'unit-card--done' : ''}`}
                            disabled={!unlocked}
                            onClick={() => unlocked && navigate(`/units/${unit.id}/lessons`)}
                        >
                            <div className="unit-card__icon-wrap">
                                <span className="unit-card__emoji">{unit.icon}</span>
                                {!unlocked && <Lock size={14} className="unit-card__lock" />}
                                {allDone && <CheckCircle size={14} className="unit-card__done-icon" />}
                            </div>

                            <div className="unit-card__body">
                                <p className="unit-card__title">{unit.title}</p>
                                <p className="unit-card__desc">{unit.description}</p>

                                {unlocked && (
                                    <div className="unit-card__progress-row">
                                        <div className="unit-card__progress-bar">
                                            <div
                                                className="unit-card__progress-fill"
                                                style={{ width: `${(completedCount / unit.lessons.length) * 100}%` }}
                                            />
                                        </div>
                                        <span className="unit-card__progress-label">
                                            {completedCount}/{unit.lessons.length}
                                        </span>
                                    </div>
                                )}

                                {!unlocked && (
                                    <p className="unit-card__lock-hint">
                                        أكمل الوحدة السابقة للفتح
                                    </p>
                                )}
                            </div>

                            {unlocked && (
                                <div className="unit-card__chevron">
                                    <ChevronLeft size={18} style={{ transform: 'rotate(180deg)' }} />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Units;
