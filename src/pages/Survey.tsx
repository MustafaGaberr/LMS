import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/Button';
import './Survey.css';

interface SurveyQuestion {
    id: string;
    text: string;
}

const SURVEY_QUESTIONS: SurveyQuestion[] = [
    { id: 'q1', text: 'كيف تُقيّم جودة محتوى الدورة التعليمية؟' },
    { id: 'q2', text: 'كيف تُقيّم سهولة استخدام التطبيق؟' },
    { id: 'q3', text: 'كيف تُقيّم فاعلية الأنشطة التطبيقية والتقييمات؟' },
    { id: 'q4', text: 'هل أضافت هذه الدورة قيمة لمهاراتك الرقمية الفعلية؟' },
    { id: 'q5', text: 'كيف تُقيّم تجربتك التعليمية الإجمالية في هذا التطبيق؟' },
];

const LIKERT_LABELS = ['ضعيف جدًا', 'ضعيف', 'متوسط', 'جيد', 'ممتاز'];

const Survey: React.FC = () => {
    const navigate = useNavigate();
    const isAllCourseDone = useAppStore((s) => s.isAllCourseDone);
    const submitSurveyResponse = useAppStore((s) => s.submitSurveyResponse);

    const [responses, setResponses] = useState<Record<string, number>>({});
    const [submitted, setSubmitted] = useState(false);

    // Guard: must complete all lessons first
    if (!isAllCourseDone()) {
        return (
            <div className="survey-page survey-page--locked">
                <div className="survey-locked-icon">🔒</div>
                <h2 className="survey-locked-title">الاستبيان مقفل</h2>
                <p className="survey-locked-desc">
                    أكمل جميع دروس الدورة الثلاث عشر لفتح الاستبيان.
                </p>
                <Button variant="primary" onClick={() => navigate('/units')}>
                    العودة للوحدات
                </Button>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="survey-page survey-page--done">
                <div className="survey-done-emoji">🎊</div>
                <h2 className="survey-done-title">شكرًا على إجابتك!</h2>
                <p className="survey-done-desc">تم حفظ ردودك بشكل مجهول. نقدّر رأيك.</p>
                <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() => navigate('/survey/results')}
                >
                    عرض النتائج والإحصاءات 📊
                </Button>
            </div>
        );
    }

    const allAnswered = SURVEY_QUESTIONS.every((q) => responses[q.id] !== undefined);

    const handleSubmit = () => {
        if (!allAnswered) return;
        submitSurveyResponse(responses);
        setSubmitted(true);
    };

    return (
        <div className="survey-page">
            <div className="survey-header">
                <h2 className="survey-header__title">استبيان الدورة</h2>
                <p className="survey-header__sub">مجهول الهوية · 5 أسئلة</p>
            </div>

            <div className="survey-questions">
                {SURVEY_QUESTIONS.map((q, qi) => (
                    <div key={q.id} className="survey-q">
                        <p className="survey-q__text">
                            <span className="survey-q__num">{qi + 1}</span>
                            {q.text}
                        </p>
                        <div className="survey-likert">
                            {[1, 2, 3, 4, 5].map((val) => (
                                <button
                                    key={val}
                                    className={`survey-likert-btn ${responses[q.id] === val ? 'survey-likert-btn--active' : ''
                                        }`}
                                    onClick={() =>
                                        setResponses((r) => ({ ...r, [q.id]: val }))
                                    }
                                    title={LIKERT_LABELS[val - 1]}
                                >
                                    <span className="survey-likert-btn__val">{val}</span>
                                    <span className="survey-likert-btn__label">
                                        {LIKERT_LABELS[val - 1]}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={!allAnswered}
                onClick={handleSubmit}
            >
                إرسال الاستبيان 📤
            </Button>
        </div>
    );
};

export default Survey;
