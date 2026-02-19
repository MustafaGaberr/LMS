import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronLeft } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/Button';
import './Onboarding.css';

const SLIDES = [
    {
        icon: '📚',
        title: 'تعلّم بأسلوبك',
        desc: 'وحدات تعليمية مصممة لتناسب وتيرتك الخاصة',
    },
    {
        icon: '🎯',
        title: 'تتبع تقدّمك',
        desc: 'خريطة تعلم تفاعلية تُظهر رحلتك بوضوح',
    },
    {
        icon: '🏆',
        title: 'حقّق أهدافك',
        desc: 'استبيانات وتقييمات لقياس مستواك',
    },
];

const Onboarding: React.FC = () => {
    const navigate = useNavigate();
    const markOnboardingSeen = useAppStore((s) => s.markOnboardingSeen);
    const [step, setStep] = React.useState(0);

    const isLast = step === SLIDES.length - 1;

    const handleNext = () => {
        if (isLast) {
            markOnboardingSeen();
            navigate('/welcome', { replace: true });
        } else {
            setStep((s) => s + 1);
        }
    };

    const handleSkip = () => {
        markOnboardingSeen();
        navigate('/units', { replace: true });
    };

    const slide = SLIDES[step];

    return (
        <div className="onboarding-page">
            <button className="onboarding-skip" onClick={handleSkip}>تخطي</button>

            <div className="onboarding-content">
                <div className="onboarding-emoji">{slide.icon}</div>
                <h2 className="onboarding-title">{slide.title}</h2>
                <p className="onboarding-desc">{slide.desc}</p>
            </div>

            <div className="onboarding-dots">
                {SLIDES.map((_, i) => (
                    <span key={i} className={`onboarding-dot ${i === step ? 'onboarding-dot--active' : ''}`} />
                ))}
            </div>

            <div className="onboarding-footer">
                <Button variant="primary" size="lg" fullWidth onClick={handleNext}
                    icon={isLast ? undefined : <ChevronLeft size={18} />} iconPosition="end">
                    {isLast ? 'ابدأ الآن' : 'التالي'}
                </Button>
            </div>
        </div>
    );
};

export default Onboarding;
