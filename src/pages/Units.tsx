import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, BookOpen, Play, ArrowRight } from 'lucide-react';
import { course } from '../data/sampleCourse';
import { useAppStore } from '../store/useAppStore';
import './Units.css';

const ORDINAL = ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة'];
const ORDINAL_NUM = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];

const Units: React.FC = () => {
    const navigate = useNavigate();
    const isUnitUnlocked = useAppStore((s) => s.isUnitUnlocked);
    const isAllCourseDone = useAppStore((s) => s.isAllCourseDone);
    const progress = useAppStore((s) => s.progress);
    const courseDone = isAllCourseDone();

    // Overall progress across all lessons
    const totalLessons = course.units.reduce((acc, u) => acc + u.lessons.length, 0);
    const completedTotal = course.units.reduce((acc, u) => {
        return acc + u.lessons.filter((l) => progress.completedLessons[l.id]?.activityDone).length;
    }, 0);
    const overallPct = totalLessons > 0 ? Math.round((completedTotal / totalLessons) * 100) : 0;

    return (
        <div className="units-shell">

            {/* ── Scrollable content ── */}
            <div className="units-content">

                {/* Course header card — gradient with book icon */}
                <div className="units-header-card">
                    <div className="units-header-card__icon">
                        <BookOpen size={28} strokeWidth={2} />
                    </div>
                    <div className="units-header-card__text">
                        <p className="units-header-card__title">{course.title}</p>
                        <p className="units-header-card__meta">
                            🎓 {course.units.length} وحدات تعليمية
                        </p>
                    </div>
                </div>

                {/* Unit list */}
                <div className="units-list">
                    {course.units.map((unit, i) => {
                        const unlocked = isUnitUnlocked(unit.id);
                        const completedCount = unit.lessons.filter(
                            (l) => progress.completedLessons[l.id]?.activityDone
                        ).length;
                        const unitPct = Math.round((completedCount / unit.lessons.length) * 100);

                        return unlocked ? (
                            /* ── Unlocked unit card ── */
                            <button
                                key={unit.id}
                                className="unit-card unit-card--unlocked"
                                onClick={() => navigate(`/units/${unit.id}/lessons`)}
                            >
                                {/* Number badge */}
                                <span className="unit-card__badge">{i + 1}</span>

                                {/* Info */}
                                <div className="unit-card__info">
                                    <span className="unit-card__name">
                                        الوحدة {ORDINAL[i] ?? i + 1}
                                    </span>
                                    <span className="unit-card__cta">
                                        <Play size={12} fill="currentColor" />
                                        ابدأ الآن
                                    </span>
                                </div>

                                {/* Progress label (bottom-left) */}
                                <div className="unit-card__right">
                                    <span className="unit-card__progress-label">
                                        {completedCount}/{unit.lessons.length}
                                    </span>
                                    <span className="unit-card__progress-sub">التقدم</span>
                                </div>
                            </button>
                        ) : (
                            /* ── Locked unit card ── */
                            <div key={unit.id} className="unit-card unit-card--locked">
                                <div className="unit-card__info">
                                    <span className="unit-card__name">
                                        الوحدة {ORDINAL[i] ?? i + 1}
                                    </span>
                                    <span className="unit-card__locked-label">مقفلة</span>
                                </div>
                                <Lock size={22} className="unit-card__lock" />
                            </div>
                        );
                    })}
                </div>

                {/* Survey CTA when course done */}
                {courseDone && (
                    <div className="units-survey-cta">
                        <p className="units-survey-cta__title">🎉 أتممت الدورة بالكامل!</p>
                        <button className="units-survey-cta__btn" onClick={() => navigate('/survey')}>
                            ابدأ الاستبيان
                        </button>
                    </div>
                )}
            </div>

            {/* ── Fixed bottom progress bar ── */}
            <div className="units-footer">
                <div className="units-footer__bar-row">
                    <span className="units-footer__label">التقدم العام</span>
                    <span className="units-footer__pct">{overallPct}%</span>
                </div>
                <div className="units-footer__track">
                    <div
                        className="units-footer__fill"
                        style={{ width: `${overallPct}%` }}
                    />
                </div>
            </div>

        </div>
    );
};

export default Units;
