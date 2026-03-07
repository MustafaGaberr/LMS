import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import './Onboarding.css';

// ─── Slide data ───────────────────────────────────────────────────────────────

interface Slide {
    content: React.ReactNode;
}

const SLIDES: Slide[] = [
    {
        content: (
            <div className="ob-card">

                <p className="ob-card__line ob-card__line--bold">جامعة أسوان</p>
                <div className="ob-card__divider" />
                <p className="ob-card__line">كلية التربية النوعية</p>
                <p className="ob-card__line">قسم تكنولوجيا التعليم</p>
            </div>
        ),
    },
    {
        content: (
            <div className="ob-card ob-card--center">
                <p className="ob-card__headline">يُقدِّم</p>
            </div>
        ),
    },
    {
        content: (
            <div className="ob-card">
                <p className="ob-card__research-title">
                    التفاعل بين نمط الاستجابة لروبوتات المحادثة القائمة على الذكاء الاصطناعي التوليدي
                    ومستوى السعة العقلية وأثره في تنمية قوة السيطرة المعرفية والكفاءة الذاتية
                    لدى طلاب تكنولوجيا التعليم
                </p>
            </div>
        ),
    },
    {
        content: (
            <div className="ob-card ob-card--center">
                <p className="ob-card__headline">إعداد</p>
            </div>
        ),
    },
    {
        content: (
            <div className="ob-card">
                <p className="ob-card__line ob-card__line--label">الباحث/</p>
                <p className="ob-card__line ob-card__line--bold">وليد راضي عبدالمجيد</p>
                <div className="ob-card__divider" />
                <p className="ob-card__line ob-card__line--sm">المعيد بقسم تكنولوجيا التعليم</p>
                <p className="ob-card__line ob-card__line--sm">كلية التربية النوعية — جامعة أسوان</p>
            </div>
        ),
    },
    {
        content: (
            <div className="ob-card">
                <p className="ob-card__line ob-card__line--label">إشراف/</p>
                <p className="ob-card__line ob-card__line--bold">أ.د/ حلمي أبو موتة</p>
                <div className="ob-card__divider" />
                <p className="ob-card__line ob-card__line--sm">أستاذ تكنولوجيا التعليم</p>
                <p className="ob-card__line ob-card__line--sm">ورئيس قسم تكنولوجيا التعليم</p>
                <p className="ob-card__line ob-card__line--sm">كلية التربية النوعية — جامعة أسوان</p>
            </div>
        ),
    },
    {
        content: (
            <div className="ob-card">
                <p className="ob-card__line ob-card__line--label">إشراف/</p>
                <p className="ob-card__line ob-card__line--bold">أ.د/ رجاء علي عبدالعليم</p>
                <div className="ob-card__divider" />
                <p className="ob-card__line ob-card__line--sm">أستاذ تكنولوجيا التعليم</p>
                <p className="ob-card__line ob-card__line--sm">ووكيل الكلية لشئون البيئة وخدمة المجتمع</p>
                <p className="ob-card__line ob-card__line--sm">كلية التربية النوعية — جامعة أسوان</p>
            </div>
        ),
    },
];

// ─── Animations ───────────────────────────────────────────────────────────────

const variants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 50 : -50 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -50 : 50 }),
};

// ─── Component ────────────────────────────────────────────────────────────────

const Onboarding: React.FC = () => {
    const navigate = useNavigate();
    const markOnboardingSeen = useAppStore((s) => s.markOnboardingSeen);
    const [step, setStep] = useState(0);
    const [dir, setDir] = useState(1);

    const isLast = step === SLIDES.length - 1;

    const finish = () => {
        markOnboardingSeen();
        navigate('/welcome', { replace: true });
    };

    const handleNext = () => {
        if (isLast) {
            finish();
        } else {
            setDir(1);
            setStep((s) => s + 1);
        }
    };

    return (
        <div className="ob-page">
            {/* ── Blobs ── */}
            <div className="ob-blob ob-blob--1" />
            <div className="ob-blob ob-blob--2" />

            {/* ── Logo / Person image ── */}
            <div className="ob-logo-wrap">
                {step <= 3 && (
                    <div className="ob-logo-dual">
                        <img src="/assets/aswlogo.png" alt="شعار جامعة أسوان" className="ob-logo__img ob-logo__img--sm" />
                        <img src="/assets/facultylogo.png" alt="شعار كلية التربية" className="ob-logo__img ob-logo__img--sm" />
                    </div>
                )}
                {step === 4 && (
                    <img src="/assets/drwalid.png" alt="د. وليد راضي" className="ob-logo__img ob-logo__img--person" />
                )}
                {step === 5 && (
                    <img src="/assets/drhelmy.jpeg" alt="أ.د. حلمي أبو موتة" className="ob-logo__img ob-logo__img--person" />
                )}
                {step === 6 && (
                    <img src="/assets/drragaa.jpeg" alt="أ.د. رجاء علي" className="ob-logo__img ob-logo__img--person" />
                )}
            </div>

            {/* ── Slide ── */}
            <div className="ob-slide-area">
                <AnimatePresence mode="wait" custom={dir}>
                    <motion.div
                        key={step}
                        custom={dir}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.28, ease: 'easeInOut' }}
                        className="ob-slide"
                    >
                        {SLIDES[step].content}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ── Dots ── */}
            <div className="ob-dots">
                {SLIDES.map((_, i) => (
                    <button
                        key={i}
                        className={`ob-dot ${i === step ? 'ob-dot--active' : ''}`}
                        onClick={() => { setDir(i > step ? 1 : -1); setStep(i); }}
                        aria-label={`الشريحة ${i + 1}`}
                    />
                ))}
            </div>

            {/* ── Footer: next only ── */}
            <div className="ob-footer">
                <button className="ob-next-btn" onClick={handleNext}>
                    {isLast ? 'التالي' : 'التالي'}
                </button>
            </div>
        </div>
    );
};

export default Onboarding;
