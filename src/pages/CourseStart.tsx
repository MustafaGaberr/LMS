import React from 'react';
import { useNavigate } from 'react-router-dom';
import { course } from '../data/sampleCourse';
import './CourseStart.css';

const CourseStart: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="cs-page">
            <div className="cs-blob cs-blob--1" />
            <div className="cs-blob cs-blob--2" />

            {/* Spacer top */}
            <div />

            {/* Content */}
            <div className="cs-body">
                {/* Course name card */}
                <div className="cs-card">
                    <p className="cs-card__title">{course.title}</p>
                </div>

                {/* Code card */}
                <div className="cs-card cs-card--code">
                    <p className="cs-card__code">كود المقرر...</p>
                </div>

                {/* Tagline */}
                <p className="cs-tagline">
                    هيا بينا نبدأ تعلمنا في محتوانا
                </p>
            </div>

            {/* Footer */}
            <div className="cs-footer">
                <button className="cs-start-btn" onClick={() => navigate('/objectives')}>
                    بدأ
                </button>
            </div>
        </div>
    );
};

export default CourseStart;
