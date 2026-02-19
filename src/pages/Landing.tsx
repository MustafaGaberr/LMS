import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import './Landing.css';

const Landing: React.FC = () => {
    const navigate = useNavigate();
    const activeUserId = useAppStore((s) => s.activeUserId);

    useEffect(() => {
        const timer = setTimeout(() => {
            // If already logged in, skip login and go to units
            if (activeUserId) {
                navigate('/units', { replace: true });
            } else {
                navigate('/login', { replace: true });
            }
        }, 2200);

        return () => clearTimeout(timer);
    }, [activeUserId, navigate]);

    return (
        <div className="splash-page">
            <div className="splash-blob splash-blob--1" />
            <div className="splash-blob splash-blob--2" />

            <div className="splash-content">
                {/* Icon */}
                <div className="splash-icon">
                    <svg viewBox="0 0 80 80" fill="none" className="splash-icon__svg">
                        <circle cx="40" cy="40" r="40" fill="var(--color-primary)" opacity="0.12" />
                        <path
                            d="M20 54V30a4 4 0 0 1 4-4h32a4 4 0 0 1 4 4v24"
                            stroke="var(--color-primary)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                        />
                        <path
                            d="M14 54h52M32 26v-6a8 8 0 0 1 16 0v6"
                            stroke="var(--color-primary)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                        />
                        <circle cx="40" cy="42" r="5" fill="var(--color-primary)" />
                        <path d="M40 47v5" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                </div>

                {/* Text */}
                <h1 className="splash-title">منصة التعلم</h1>
                <p className="splash-subtitle">مهارات التعلم الرقمي والتواصل الفعّال</p>

                {/* Loader dots */}
                <div className="splash-dots">
                    <span className="splash-dot" />
                    <span className="splash-dot" />
                    <span className="splash-dot" />
                </div>
            </div>
        </div>
    );
};

export default Landing;
