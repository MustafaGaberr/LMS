import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot } from 'lucide-react';
import { course } from '../data/sampleCourse';
import './CourseStart.css';

const CourseStart: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="cs-page">
            <div className="cs-blob cs-blob--1" />
            <div className="cs-blob cs-blob--2" />

            {/* ── Bot avatar (same as Welcome) ── */}
            <div className="cs-avatar-wrap">
                <div className="cs-avatar">
                    <Bot size={64} strokeWidth={1.3} />
                </div>
                <div className="cs-dots">
                    <span /><span /><span />
                </div>
            </div>

            {/* ── Cards ── */}
            <div className="cs-body">
                <div className="cs-card">
                    <p className="cs-card__title">{course.title}</p>
                </div>
                <div className="cs-card cs-card--code">
                    <p className="cs-card__code">كود المقرر...</p>
                </div>
            </div>

            {/* ── Footer ── */}
            <div className="cs-footer">
                <p className="cs-tagline">هيا بنا نبدأ تعلمنا في محتوانا</p>
                <button className="cs-start-btn" onClick={() => navigate('/objectives')}>
                    بدأ
                </button>
            </div>
        </div>
    );
};

export default CourseStart;
