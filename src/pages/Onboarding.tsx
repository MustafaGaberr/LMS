import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/Button';
import './Onboarding.css';

interface Slide {
    emoji: string;
    title: string;
    desc: string;
    color: string;
}

const SLIDES: Slide[] = [
    {
        emoji: '👋',
        title: 'أهلاً بك في منصة التعلم',
        desc: 'رحلتك نحو الكفاءة الرقمية تبدأ هنا. ستتعلم مهارات حيوية يحتاجها كل متعلم في العصر الرقمي.',
        color: 'var(--color-primary-subtle)',
    },
    {
        emoji: '📚',
        title: 'محتوى ثري ومتنوع',
        desc: 'ثلاث وحدات تعليمية، خمسة عشر درسًا مصوّرًا، أنشطة تفاعلية وتقييمات تضمن رسوخ المعرفة.',
        color: 'var(--color-accent-subtle)',
    },
    {
        emoji: '🎯',
        title: 'تقدّم تسلسلي منظّم',
        desc: 'يُفتح كل درس عند إتمام الذي قبله. هذا التسلسل يضمن بناء معرفتك خطوةً بخطوة على أسس سليمة.',
        color: 'var(--color-primary-subtle)',
    },
    {
        emoji: '🎬',
        title: 'فيديوهات تعليمية مدمجة',
        desc: 'كل درس يحتوي على فيديو يشرح المفهوم بصريًا. يمكنك مشاهدته مباشرةً داخل التطبيق دون الانتقال لأي موقع خارجي.',
        color: 'var(--color-accent-subtle)',
    },
    {
        emoji: '🗺️',
        title: 'خريطة تعلّمك الشخصية',
        desc: 'راقب تقدمك عبر خريطة تفاعلية تُظهر وحداتك ودروسك ومرحلتك الحالية في كل لحظة.',
        color: 'var(--color-primary-subtle)',
    },
    {
        emoji: '✍️',
        title: 'أنشطة عملية حقيقية',
        desc: 'لا يكتفي التطبيق بالشرح النظري — كل درس يتضمن نشاطًا تطبيقيًا يُرسّخ المهارة في واقع حياتك.',
        color: 'var(--color-accent-subtle)',
    },
    {
        emoji: '🔒',
        title: 'خصوصيتك محمية',
        desc: 'تقدمك وإعداداتك محفوظة على جهازك فقط. لا نشاركها مع أي طرف ثالث.',
        color: 'var(--color-primary-subtle)',
    },
    {
        emoji: '🚀',
        title: 'جاهز؟ لنبدأ!',
        desc: 'كل ما تحتاجه أمامك. انقر "ابدأ رحلتك" وانطلق نحو إتقان مهارات التعلم الرقمي.',
        color: 'var(--color-accent-subtle)',
    },
];

const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
};

const Onboarding: React.FC = () => {
    const navigate = useNavigate();
    const markOnboardingSeen = useAppStore((s) => s.markOnboardingSeen);
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(1);

    const isLast = step === SLIDES.length - 1;

    const goNext = () => {
        if (isLast) {
            markOnboardingSeen();
            navigate('/welcome', { replace: true });
        } else {
            setDirection(1);
            setStep((s) => s + 1);
        }
    };

    const goPrev = () => {
        if (step > 0) {
            setDirection(-1);
            setStep((s) => s - 1);
        }
    };

    const handleSkip = () => {
        markOnboardingSeen();
        navigate('/units', { replace: true });
    };

    const slide = SLIDES[step];

    return (
        <div className="onboarding-page" style={{ background: slide.color }}>
            {/* Skip button */}
            <div className="onboarding-topbar">
                <button className="onboarding-skip-btn" onClick={handleSkip}>
                    <X size={18} />
                    <span>تخطي</span>
                </button>
            </div>

            {/* Slide content */}
            <div className="onboarding-content">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={step}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="onboarding-slide"
                    >
                        <div className="onboarding-emoji">{slide.emoji}</div>
                        <h2 className="onboarding-title">{slide.title}</h2>
                        <p className="onboarding-desc">{slide.desc}</p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Dots */}
            <div className="onboarding-dots">
                {SLIDES.map((_, i) => (
                    <button
                        key={i}
                        className={`onboarding-dot ${i === step ? 'onboarding-dot--active' : ''}`}
                        onClick={() => { setDirection(i > step ? 1 : -1); setStep(i); }}
                        aria-label={`الشريحة ${i + 1}`}
                    />
                ))}
            </div>

            {/* Navigation */}
            <div className="onboarding-footer">
                {step > 0 && (
                    <button className="onboarding-back-btn" onClick={goPrev}>
                        <ChevronLeft size={18} style={{ transform: 'rotate(180deg)' }} />
                    </button>
                )}
                <Button
                    variant="primary"
                    size="lg"
                    onClick={goNext}
                    className="onboarding-next-btn"
                    icon={!isLast ? <ChevronLeft size={18} /> : undefined}
                    iconPosition="end"
                >
                    {isLast ? 'ابدأ رحلتك 🚀' : 'التالي'}
                </Button>
            </div>
        </div>
    );
};

export default Onboarding;
