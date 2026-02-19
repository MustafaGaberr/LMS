import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ChevronLeft, CheckCircle } from 'lucide-react';
import { course } from '../data/sampleCourse';
import './Objectives.css';

const Objectives: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="objectives-page">
            <div className="objectives-header">
                <Target size={20} className="objectives-header__icon" />
                <div>
                    <h2 className="objectives-header__title">أهداف الدورة</h2>
                    <p className="objectives-header__sub">
                        {course.objectives.length} أهداف تعليمية
                    </p>
                </div>
            </div>

            <div className="objectives-list">
                {course.objectives.map((obj, i) => (
                    <button
                        key={obj.id}
                        className="objective-card"
                        onClick={() => navigate(`/objectives/${obj.id}`)}
                    >
                        <div className="objective-card__num">{i + 1}</div>
                        <div className="objective-card__body">
                            <p className="objective-card__title">{obj.title}</p>
                            <p className="objective-card__preview">
                                {obj.details.slice(0, 80)}...
                            </p>
                        </div>
                        <ChevronLeft size={18} className="objective-card__arrow" />
                    </button>
                ))}
            </div>

            <button
                className="objectives-cta"
                onClick={() => navigate('/units')}
            >
                <CheckCircle size={18} />
                <span>فهمت الأهداف — انتقل للوحدات</span>
            </button>
        </div>
    );
};

export default Objectives;
