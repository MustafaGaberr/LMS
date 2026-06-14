import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { ChevronLeft } from 'lucide-react';
import './ScalesList.css';
import './PreScalesList.css';

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

const PreScalesList: React.FC = () => {
    const navigate = useNavigate();
    const progress = useAppStore((s) => s.progress);

    const isPreCognitiveDone = !!progress.preCognitiveFilled;
    const isPreEfficacyDone  = !!progress.preEfficacyFilled;
    const bothDone = isPreCognitiveDone && isPreEfficacyDone;

    const isDone = (id: string) => {
        if (id === 'cognitive') return isPreCognitiveDone;
        if (id === 'efficacy')  return isPreEfficacyDone;
        return false;
    };

    return (
        <div className="scales-page pre-scales-page">
            {/* Header */}
            <div className="scales-header">
                <div className="scales-header__emoji">📋</div>
                <h2 className="scales-header__title">المقاييس القبلية</h2>
                <p className="scales-header__sub">
                    يرجى تعبئة المقياسين قبل البدء في الوحدات التعليمية
                </p>
            </div>

            {/* Progress indicator */}
            <div className="pre-scales-progress">
                <div className="pre-scales-progress__bar">
                    <div
                        className="pre-scales-progress__fill"
                        style={{
                            width: `${
                                (Number(isPreCognitiveDone) + Number(isPreEfficacyDone)) * 50
                            }%`,
                        }}
                    />
                </div>
                <span className="pre-scales-progress__label">
                    {Number(isPreCognitiveDone) + Number(isPreEfficacyDone)} / 2 مقياس مكتمل
                </span>
            </div>

            {/* Scale Cards */}
            <div className="scales-cards">
                {SCALES.map((scale) => {
                    const done = isDone(scale.id);
                    return (
                        <button
                            key={scale.id}
                            className={`scale-card scale-card--${scale.cssModifier} ${done ? 'scale-card--done' : ''}`}
                            onClick={() => navigate(`/pre-survey/${scale.id}`)}
                        >
                            <div className="scale-card__emoji">{scale.emoji}</div>
                            <div className="scale-card__body">
                                <h3 className="scale-card__title">{scale.title}</h3>
                                <p className="scale-card__info">
                                    {scale.sectionsCount} {scale.sectionsLabel} • {scale.questionsCount} سؤال
                                </p>
                                {done && (
                                    <span className="scale-card__done-badge">
                                        ✓ تم الإجابة
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

            {/* CTA after both done */}
            {bothDone && (
                <button
                    className="pre-scales-continue-btn"
                    onClick={() => navigate('/units')}
                >
                    ابدأ الوحدات التعليمية ←
                </button>
            )}
        </div>
    );
};

export default PreScalesList;
