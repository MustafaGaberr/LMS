import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot } from 'lucide-react';
import './Welcome.css';

const Welcome: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="welcome-page">
            <div className="welcome-blob welcome-blob--1" />
            <div className="welcome-blob welcome-blob--2" />

            {/* Bot avatar */}
            <div className="welcome-avatar-wrap">
                <div className="welcome-avatar">
                    <Bot size={64} strokeWidth={1.3} />
                </div>
            </div>

            {/* Message card */}
            <div className="welcome-card">
                <p className="welcome-card__line welcome-card__line--bold">
                    مرحباً طلاب الفرقة الثالثة
                </p>
                <p className="welcome-card__line">
                    أنا روبوت المحادثة .....
                </p>
                <p className="welcome-card__line">
                    ساكون معك مرشداً طوال الرحلة التعليمية هيا بينا لنبدأ تعلمنا
                </p>
            </div>

            {/* CTA */}
            <div className="welcome-footer">
                <button className="welcome-start-btn" onClick={() => navigate('/course-start')}>
                    بدأ
                </button>
            </div>
        </div>
    );
};

export default Welcome;
