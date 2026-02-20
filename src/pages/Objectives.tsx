import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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
                    <span>الأهداف العامه</span>
                </div>

                {/* 2×2 + 1 grid */}
                <div className="obj-grid-wrap">
                    <div className="obj-grid">
                        {course.objectives.map((obj, i) => (
                            <button
                                key={obj.id}
                                className={`obj-grid-btn ${i % 2 === 0 ? 'obj-grid-btn--green' : ''}`}
                                onClick={() => setSelected(i)}
                            >
                                الهدف {ORDINAL[i]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Back arrow */}
                <button className="obj-back-btn" onClick={() => navigate(-1)} aria-label="رجوع">
                    <ArrowRight size={22} />
                </button>
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
                    {activeObj.subObjectives.map((sub, i) => (
                        <div key={i} className="obj-sub-card">
                            <p>{sub}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer: back arrow + skip */}
            <div className="obj-detail-footer">
                <button className="obj-back-btn" onClick={() => setSelected(null)} aria-label="رجوع">
                    <ArrowRight size={22} />
                </button>
                <button className="obj-skip-btn" onClick={() => navigate('/units')}>
                    تخطي
                </button>
            </div>
        </div>
    );
};

export default Objectives;
