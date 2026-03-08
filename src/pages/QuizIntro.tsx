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

    const instructions = [
        `قم بدراسة محتوى إدارة التعلم الإلكتروني (LMS) من خلال أحد المصادر التعليمية الرقمية فيما يلي ما هو نظام إدارة التعلم`,
        `يهدف نظام إدارة التعلم (LMS) إلى تسهيل إدارة وتقديم المحتوى التعليمي عبر الإنترنت`,
        `يساعد في تنظيم وإدارة واستخدام المحتوى التعليمي بشكل فعّال`,
        `نظام إدارة التعليم الإلكتروني هو منصة رقمية تمكّن المعلمين من إنشاء وتقديم المحتوى التعليمي`,
        `التوجه نحو الصفحة التالية والبدء باستخدام الـ chatbot ومحاولة حتى الانتهاء من الإجابة، مع التركيز حتى إتمام هذا الجزء بسهولة قبل الانتقال`,
    ];

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
                <ul className="quiz-intro-card__list">
                    {instructions.map((text, i) => (
                        <li key={i} className="quiz-intro-card__item">
                            {text}
                        </li>
                    ))}
                </ul>
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
