import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { course } from '../data/sampleCourse';
import './Objectives.css';

const ORDINAL = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع'];

const Objectives: React.FC = () => {
    const navigate = useNavigate();
    // null  → phase A (grid)
    // 0-4   → phase B (detail, selected index)
    const [selected, setSelected] = useState<number | null>(null);

    /* ─── Phase A: Grid of 5 objective buttons ─── */
    if (selected === null) {
        return (
            <div className="obj-page">
                {/* Title card */}
                <div className="obj-title-card">
                    <span>الأهداف العامة</span>
                </div>

                {/* Horizontal card list */}
                <div className="obj-list">
                    {course.objectives.map((obj, i) => (
                        <button
                            key={obj.id}
                            className="obj-list-card"
                            onClick={() => setSelected(i)}
                        >
                            <span className="obj-list-card__num">{i + 1}</span>
                            <span className="obj-list-card__label">الهدف {ORDINAL[i]}</span>
                            <span className="obj-list-card__arrow">›</span>
                        </button>
                    ))}
                </div>

                {/* Footer: back arrow */}
                <div className="obj-footer">
                    <button className="obj-back-btn" onClick={() => navigate(-1)} aria-label="رجوع">
                        <ArrowRight size={26} />
                    </button>
                </div>
            </div>
        );
    }

    /* ─── Phase B: 2-column interactive detail ─── */
    const activeObj = course.objectives[selected];

    return (
        <div className="obj-detail-page">
            {/* Black title banner */}
            <div className="obj-detail-banner">
                <span>{course.title}</span>
            </div>

            {/* Two-column layout */}
            <div className="obj-detail-body">
                {/* RIGHT (first in RTL): all 5 objective buttons */}
                <div className="obj-label-col">
                    {course.objectives.map((obj, i) => (
                        <button
                            key={obj.id}
                            className={`obj-label-btn ${i === selected ? 'obj-label-btn--active' : 'obj-label-btn--inactive'}`}
                            onClick={() => setSelected(i)}
                        >
                            الهدف {ORDINAL[i]}
                        </button>
                    ))}
                </div>

                {/* LEFT: sub-objectives for selected objective */}
                <div className="obj-sub-col">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selected}
                            className="obj-sub-col-inner"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.22, ease: 'easeInOut' }}
                        >
                            {activeObj.subObjectives.map((sub, i) => (
                                <div key={i} className="obj-sub-card">
                                    <p>{sub}</p>
                                </div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Back button centered */}
            <div className="obj-footer">
                <button className="obj-back-btn" onClick={() => setSelected(null)} aria-label="رجوع">
                    <ArrowRight size={26} />
                </button>
            </div>
        </div>
    );
};

export default Objectives;
