import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { course } from '../data/sampleCourse';
import { useAppStore } from '../store/useAppStore';
import './Units.css';

const ORDINAL = ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة'];

const Units: React.FC = () => {
    const navigate = useNavigate();
    const isUnitUnlocked = useAppStore((s) => s.isUnitUnlocked);
    const isAllCourseDone = useAppStore((s) => s.isAllCourseDone);
    const progress = useAppStore((s) => s.progress);
    const courseDone = isAllCourseDone();

    return (
        <div className="units-page">
            {/* Course name card — top, like wireframe */}
            <div className="units-course-card">
                <p className="units-course-card__text">{course.title}</p>
            </div>

            {/* Staggered unit buttons — alternating right / left alignment */}
            <div className="units-grid">
                {course.units.map((unit, i) => {
                    const unlocked = isUnitUnlocked(unit.id);
                    const completedCount = unit.lessons.filter(
                        (l) => progress.completedLessons[l.id]?.activityDone
                    ).length;
                    const allDone = completedCount === unit.lessons.length;
                    const isRight = i % 2 === 0; // alternate alignment

                    return (
                        <div
                            key={unit.id}
                            className={`units-grid__row ${isRight ? 'units-grid__row--right' : 'units-grid__row--left'}`}
                        >
                            <button
                                className={`unit-btn ${!unlocked ? 'unit-btn--locked' : ''} ${allDone ? 'unit-btn--done' : ''}`}
                                disabled={!unlocked}
                                onClick={() => unlocked && navigate(`/units/${unit.id}/lessons`)}
                            >
                                {!unlocked && <Lock size={13} className="unit-btn__lock" />}
                                <span className="unit-btn__label">
                                    الوحدة {ORDINAL[i] ?? i + 1}
                                </span>
                                {unlocked && (
                                    <span className="unit-btn__progress">
                                        {completedCount}/{unit.lessons.length}
                                    </span>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Survey CTA when course is fully done */}
            {courseDone && (
                <div className="units-survey-cta">
                    <p className="units-survey-cta__title">🎉 أتممت الدورة بالكامل!</p>
                    <button className="units-survey-cta__btn" onClick={() => navigate('/survey')}>
                        ابدأ الاستبيان
                    </button>
                </div>
            )}

            {/* Back */}
            <button className="units-back-btn" onClick={() => navigate(-1)} aria-label="رجوع">
                <ArrowRight size={22} />
            </button>
        </div>
    );
};

export default Units;
