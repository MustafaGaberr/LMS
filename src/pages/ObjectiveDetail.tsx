import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { course } from '../data/sampleCourse';
import './ObjectiveDetail.css';

type Tab = 'overview' | 'details';

const ObjectiveDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [tab, setTab] = useState<Tab>('overview');

    const obj = course.objectives.find((o) => o.id === id);
    const idx = course.objectives.findIndex((o) => o.id === id);

    if (!obj) {
        return (
            <div className="obj-detail-page">
                <p className="obj-detail-error">الهدف غير موجود.</p>
            </div>
        );
    }

    const hasPrev = idx > 0;
    const hasNext = idx < course.objectives.length - 1;

    const goTo = (i: number) => navigate(`/objectives/${course.objectives[i].id}`);

    return (
        <div className="obj-detail-page">
            {/* Objective badge */}
            <div className="obj-detail-badge">
                <span className="obj-detail-num">{idx + 1}</span>
                <span className="obj-detail-of">من {course.objectives.length} أهداف</span>
            </div>

            <h2 className="obj-detail-title">{obj.title}</h2>

            {/* Tab bar */}
            <div className="obj-detail-tabs">
                {([['overview', 'نظرة عامة'], ['details', 'التفاصيل']] as [Tab, string][]).map(([t, label]) => (
                    <button
                        key={t}
                        className={`obj-detail-tab ${tab === t ? 'obj-detail-tab--active' : ''}`}
                        onClick={() => setTab(t)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="obj-detail-content">
                {tab === 'overview' && (
                    <div className="obj-detail-overview">
                        <p>{obj.details.slice(0, Math.floor(obj.details.length / 2))}.</p>
                    </div>
                )}
                {tab === 'details' && (
                    <div className="obj-detail-details">
                        <p>{obj.details}</p>
                    </div>
                )}
            </div>

            {/* Prev / Next navigation */}
            <div className="obj-detail-nav">
                <button
                    className="obj-detail-nav__btn"
                    disabled={!hasNext}
                    onClick={() => hasNext && goTo(idx + 1)}
                >
                    الهدف التالي →
                </button>
                <button
                    className="obj-detail-nav__btn obj-detail-nav__btn--ghost"
                    disabled={!hasPrev}
                    onClick={() => hasPrev && goTo(idx - 1)}
                >
                    ← الهدف السابق
                </button>
            </div>
        </div>
    );
};

export default ObjectiveDetail;
