import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { getLesson } from '../data/sampleCourse';
import './QuizIntro.css';

const QuizIntro: React.FC = () => {
    const { unitId = '', lessonId = '' } = useParams<{ unitId: string; lessonId: string }>();
    const navigate = useNavigate();

    const lesson = getLesson(unitId, lessonId);

    if (!lesson) {
        return (
            <div className="quiz-intro-page">
                <p className="quiz-intro-error">الدرس غير موجود.</p>
            </div>
        );
    }

    return (
        <div className="quiz-intro-page">
            {/* Header */}
            <div className="quiz-intro-header">
                <h2 className="quiz-intro-header__title">
                    قم بتنفيذ النشاط القادم باستخدام chatbot
                </h2>
            </div>

            {/* Instructions card */}
            <div className="quiz-intro-card">
                <div className="quiz-intro-card__content">
                    {lesson.quizIntroFullContent}
                </div>
            </div>

            {/* CTA Button */}
            <button
                className="quiz-intro-cta"
                onClick={() => navigate(`/units/${unitId}/lessons/${lessonId}/chat`)}
            >
                <MessageSquare size={20} />
                <span>chatbot</span>
            </button>
        </div>
    );
};

export default QuizIntro;
