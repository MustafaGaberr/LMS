import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { ChevronLeft } from 'lucide-react';
import './ScalesList.css';

const SCALES = [
    {
        id: 'cognitive',
        title: 'مقياس قوة السيطرة المعرفية',
        emoji: '🧠',
        questionsCount: 28,
        sectionsCount: 2,
        sectionsLabel: 'رتبة',
        cssModifier: 'cognitive',
    },
    {
        id: 'efficacy',
        title: 'مقياس الكفاءة الذاتية',
        emoji: '🎯',
        questionsCount: 30,
        sectionsCount: 6,
        sectionsLabel: 'أبعاد',
        cssModifier: 'efficacy',
    },
];

const ScalesList: React.FC = () => {
    const navigate = useNavigate();
    const progress = useAppStore((s) => s.progress);

    // Check which scales are already filled
    const isCognitiveDone = !!progress.cognitiveFilled;
    const isEfficacyDone = !!progress.efficacyFilled;

    const isDone = (id: string) => {
        if (id === 'cognitive') return isCognitiveDone;
        if (id === 'efficacy') return isEfficacyDone;
        return false;
    };

    return (
        <div className="scales-page">
            {/* Header */}
            <div className="scales-header">
                <div className="scales-header__emoji">📋</div>
                <h2 className="scales-header__title">المقاييس</h2>
                <p className="scales-header__sub">
                    اختر المقياس الذي تريد الإجابة عليه
                </p>
            </div>

            {/* Scale Cards */}
            <div className="scales-cards">
                {SCALES.map((scale) => {
                    const done = isDone(scale.id);
                    return (
                        <button
                            key={scale.id}
                            className={`scale-card scale-card--${scale.cssModifier} ${done ? 'scale-card--done' : ''}`}
                            onClick={() => navigate(`/survey/${scale.id}`)}
                        >
                            <div className="scale-card__emoji">{scale.emoji}</div>
                            <div className="scale-card__body">
                                <h3 className="scale-card__title">{scale.title}</h3>
                                <p className="scale-card__info">
                                    {scale.sectionsCount} {scale.sectionsLabel} • {scale.questionsCount} سؤال
                                </p>
                                {done && (
                                    <span className="scale-card__done-badge">
                                        ✓ عرض الإجابات
                                    </span>
                                )}
                            </div>
                            <span className="scale-card__arrow">
                                <ChevronLeft size={22} />
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ScalesList;
