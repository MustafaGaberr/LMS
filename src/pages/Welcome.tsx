import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { course } from '../data/sampleCourse';
import './Welcome.css';

const Welcome: React.FC = () => {
    const navigate = useNavigate();
    const [showCourse, setShowCourse] = useState(false);

    const handleBtn = () => {
        if (!showCourse) {
            setShowCourse(true);
        } else {
            navigate('/objectives');
        }
    };

    const handleBack = () => {
        if (showCourse) {
            setShowCourse(false);
        } else {
            navigate('/onboarding');
        }
    };

    return (
        <div className="welcome-page">
            <div className="welcome-blob welcome-blob--1" />
            <div className="welcome-blob welcome-blob--2" />

            {/* ── Header back button ── */}
            <div className="welcome-header">
                <button className="welcome-back-btn" onClick={handleBack} aria-label="رجوع">
                    <ChevronRight size={22} />
                    <span>رجوع</span>
                </button>
            </div>

            {/* ── Bot avatar + dots (always fixed here) ── */}
            <div className="welcome-avatar-wrap">
                <div className="welcome-avatar">
                    <Bot size={64} strokeWidth={1.3} />
                </div>
                <div className="welcome-dots">
                    <span /><span /><span />
                </div>
            </div>

            {/* ── Content (changes between welcome & course) ── */}
            <div className="welcome-content-area">
                <AnimatePresence mode="wait">
                    {!showCourse ? (
                        <motion.div
                            key="welcome"
                            className="welcome-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.25 }}
                        >
                            <p className="welcome-card__line welcome-card__line--bold">
                                مرحباً طلاب الفرقة الثالثة
                            </p>
                            <p className="welcome-card__line">
                                أنا روبوت المحادثة .....
                            </p>
                            <p className="welcome-card__line">
                                سأكون معك مرشداً طوال الرحلة التعليمية، هيا بينا لنبدأ تعلمنا
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="course"
                            className="welcome-course-cards"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div className="welcome-card welcome-card--course">
                                <p className="welcome-card__course-title">{course.subject ?? course.title}</p>
                            </div>
                            <div className="welcome-card welcome-card--code">
                                <p className="welcome-card__code">كود المقرر...</p>
                            </div>
                            <p className="welcome-card__tagline">هيا بنا نبدأ تعلمنا في محتوانا</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Footer (button always here) ── */}
            <div className="welcome-footer">
                <button className="welcome-start-btn" onClick={handleBtn}>
                    {showCourse ? 'بدأ' : 'التالي'}
                </button>
            </div>
        </div>
    );
};

export default Welcome;
