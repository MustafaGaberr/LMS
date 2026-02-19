import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { course } from '../data/sampleCourse';
import './Objectives.css';

const ORDINAL = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن'];

const Objectives: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="obj-page">
            {/* Title banner — matches the black header in wireframe */}
            <div className="obj-title-banner">
                <span>{course.title}</span>
            </div>

            {/* Two-column list: description left | label button right */}
            <div className="obj-rows">
                {course.objectives.map((obj, i) => {
                    const isOdd = i % 2 === 0; // alternates green / gray like wireframe
                    return (
                        <button
                            key={obj.id}
                            className="obj-row"
                            onClick={() => navigate(`/objectives/${obj.id}`)}
                        >
                            {/* Description card — left */}
                            <div className="obj-row__desc">
                                <p>{obj.title}</p>
                            </div>

                            {/* Label button — right */}
                            <div className={`obj-row__label ${isOdd ? 'obj-row__label--green' : 'obj-row__label--gray'}`}>
                                الهدف {ORDINAL[i] ?? i + 1}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Back → go to units */}
            <button className="obj-back-btn" onClick={() => navigate('/units')} aria-label="رجوع">
                <ArrowRight size={22} />
            </button>
        </div>
    );
};

export default Objectives;
