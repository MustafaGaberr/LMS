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
                <div className="ob-card__badge">🏛️</div>
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
                <div className="ob-card__badge">🎓</div>
                <p className="ob-card__headline">يُقدِّم</p>
            </div>
        ),
    },
    {
        content: (
            <div className="ob-card">
                <div className="ob-card__badge">📄</div>
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
                <div className="ob-card__badge">✏️</div>
                <p className="ob-card__headline">إعداد</p>
            </div>
        ),
    },
    {
        content: (
            <div className="ob-card">
                <div className="ob-card__badge">👨‍🎓</div>
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
                <div className="ob-card__badge">👨‍🏫</div>
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
                <div className="ob-card__badge">👩‍🏫</div>
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
    const activeUserId = useAppStore((s) => s.activeUserId);
    const [step, setStep] = useState(0);
    const [dir, setDir] = useState(1);

    const isLast = step === SLIDES.length - 1;

    // student1 → blue (primary), student2 → secondary/accent colour
    const skipColor = activeUserId === 'student2' ? 'ob-skip-btn--accent' : 'ob-skip-btn--primary';

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

            {/* ── Logo ── */}
            <div className="ob-logo-wrap">
                <div className="ob-logo">
                    <svg viewBox="0 0 80 80" fill="none" className="ob-logo__svg">
                        <rect width="80" height="80" rx="18" fill="var(--color-primary)" opacity="0.12" />
                        <path d="M20 54V30a4 4 0 0 1 4-4h32a4 4 0 0 1 4 4v24"
                            stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M14 54h52M32 26v-6a8 8 0 0 1 16 0v6"
                            stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" />
                        <circle cx="40" cy="42" r="5" fill="var(--color-primary)" />
                        <path d="M40 47v5" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                </div>
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
                    {isLast ? 'ابدأ الآن ✨' : 'التالي'}
                </button>
            </div>
        </div>
    );
};

export default Onboarding;
