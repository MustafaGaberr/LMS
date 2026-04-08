import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Lock, CheckCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { course } from '../data/sampleCourse';
import './Objectives.css';

const ORDINAL = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع'];

const Objectives: React.FC = () => {
    const navigate = useNavigate();
    // null  → phase A (grid)
    // 0-4   → phase B (detail, selected index)
    const [selected, setSelected] = useState<number | null>(null);

    // Sequential unlock: only objectives ≤ maxUnlocked are accessible
    const [maxUnlocked, setMaxUnlocked] = useState(0);

    // When user selects/views an objective, unlock the next one
    useEffect(() => {
        if (selected !== null && selected >= maxUnlocked) {
            setMaxUnlocked(selected + 1);
        }
    }, [selected, maxUnlocked]);

    const totalObjectives = course.objectives.length;
    const isPhaseB = selected !== null;
    const isLast = isPhaseB && selected === totalObjectives - 1;
    // Can only go to units after viewing the last objective
    const allViewed = maxUnlocked >= totalObjectives;

    /* ─── Select handler with lock check ─── */
    const handleSelect = (i: number) => {
        if (i <= maxUnlocked) {
            setSelected(i);
        }
    };

    /* ─── Footer handlers ─── */
    const handleBack = () => {
        if (!isPhaseB) {
            navigate(-1);                           // Phase A → leave page
        } else if ((selected as number) > 0) {
            setSelected((s) => (s as number) - 1); // Phase B → previous objective
        } else {
            setSelected(null);                      // first objective → back to grid
        }
    };

    const handleForward = () => {
        if (!isPhaseB) {
            setSelected(0);       // enter first objective
        } else if (isLast) {
            navigate('/units');   // finish — only reachable after viewing last
        } else {
            setSelected((s) => (s as number) + 1);
        }
    };

    /* ─── Shared wrapper with one footer ─── */
    return (
        <div className="obj-shell">

            {/* ── Animated content area ── */}
            <div className="obj-content">
                <AnimatePresence mode="wait">
                    {!isPhaseB ? (
                        /* Phase A: grid */
                        <motion.div
                            key="phase-a"
                            className="obj-page"
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 40 }}
                            transition={{ duration: 0.22, ease: 'easeInOut' }}
                        >
                            {/* Title card */}
                            <div className="obj-title-card">
                                <span>الأهداف العامة</span>
                            </div>

                            {/* Card list */}
                            <div className="obj-list">
                                {course.objectives.map((obj, i) => {
                                    const unlocked = i <= maxUnlocked;
                                    const visited = i < maxUnlocked;

                                    return unlocked ? (
                                        <button
                                            key={obj.id}
                                            className={`obj-list-card ${visited ? 'obj-list-card--visited' : ''}`}
                                            onClick={() => handleSelect(i)}
                                        >
                                            <span className="obj-list-card__num">
                                                {visited ? <CheckCircle size={18} /> : i + 1}
                                            </span>
                                            <span className="obj-list-card__label">الهدف {ORDINAL[i]}</span>
                                            <span className="obj-list-card__arrow">›</span>
                                        </button>
                                    ) : (
                                        <div
                                            key={obj.id}
                                            className="obj-list-card obj-list-card--locked"
                                        >
                                            <span className="obj-list-card__num obj-list-card__num--locked">
                                                <Lock size={16} />
                                            </span>
                                            <span className="obj-list-card__label">الهدف {ORDINAL[i]}</span>
                                            <span className="obj-list-card__lock-badge">مقفل</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ) : (
                        /* Phase B: detail */
                        <motion.div
                            key="phase-b"
                            className="obj-detail-page"
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.22, ease: 'easeInOut' }}
                        >
                            {/* Title banner */}
                            <div className="obj-detail-banner">
                                <span>{course.objectives[selected].title}</span>
                            </div>

                            {/* Two-column body */}
                            <div className="obj-detail-body">
                                {/* RIGHT: objective label buttons */}
                                <div className="obj-label-col">
                                    {course.objectives.map((obj, i) => {
                                        const unlocked = i <= maxUnlocked;

                                        return (
                                            <button
                                                key={obj.id}
                                                className={`obj-label-btn ${
                                                    i === selected
                                                        ? 'obj-label-btn--active'
                                                        : unlocked
                                                        ? 'obj-label-btn--inactive'
                                                        : 'obj-label-btn--locked'
                                                }`}
                                                onClick={() => unlocked && handleSelect(i)}
                                                disabled={!unlocked}
                                            >
                                                {!unlocked && <Lock size={12} className="obj-label-btn__lock" />}
                                                الهدف {ORDINAL[i]}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* LEFT: sub-objectives in unified container */}
                                <div className="obj-sub-col">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={selected}
                                            className="obj-sub-container"
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -12 }}
                                            transition={{ duration: 0.22, ease: 'easeInOut' }}
                                        >
                                            {/* Container header */}
                                            <div className="obj-sub-header">
                                                <span className="obj-sub-header__icon">{selected + 1}</span>
                                                <span>الأهداف الفرعية — الهدف {ORDINAL[selected]}</span>
                                            </div>

                                            {/* Scrollable list */}
                                            <div className="obj-sub-col-inner">
                                                {course.objectives[selected].subObjectives.map((sub, i) => (
                                                    <div key={i} className="obj-sub-card">
                                                        <span className="obj-sub-card__num">{i + 1}</span>
                                                        <p>{sub}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Single shared footer — always same position ── */}
            <div className="obj-shared-footer">
                <button className="obj-back-btn" onClick={handleBack} aria-label="رجوع">
                    <ArrowRight size={26} />
                </button>

                {/* Forward: disabled until all objectives viewed (when on last) */}
                <button
                    className={`obj-back-btn obj-back-btn--forward ${isPhaseB && isLast ? 'obj-back-btn--primary' : ''}`}
                    onClick={handleForward}
                    disabled={isPhaseB && isLast && !allViewed}
                    aria-label="التالي"
                >
                    <ArrowLeft size={26} />
                </button>
            </div>

        </div>
    );
};

export default Objectives;