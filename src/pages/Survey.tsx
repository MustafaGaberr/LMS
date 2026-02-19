import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import './Survey.css';

const QUESTIONS = [
    {
        id: 'q1',
        text: 'كيف تُقيّم مستوى الدورة بشكل عام؟',
        options: ['ممتاز', 'جيد جداً', 'جيد', 'يحتاج تحسين'],
    },
    {
        id: 'q2',
        text: 'هل المحتوى مناسب لمستواك؟',
        options: ['نعم تماماً', 'إلى حد ما', 'لا'],
    },
    {
        id: 'q3',
        text: 'هل توصي بهذه الدورة للآخرين؟',
        options: ['نعم بكل تأكيد', 'ربما', 'لا'],
    },
];

const Survey: React.FC = () => {
    const navigate = useNavigate();
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const allAnswered = QUESTIONS.every((q) => answers[q.id]);

    return (
        <div className="survey-page">
            <div className="survey-header">
                <span style={{ fontSize: 48 }}>📋</span>
                <h2 className="survey-title">استبيان الرأي</h2>
                <p className="survey-subtitle">آراؤك تساعدنا على التحسين</p>
            </div>

            <div className="survey-questions">
                {QUESTIONS.map((q) => (
                    <Card key={q.id} elevated padding="md">
                        <p className="survey-question-text">{q.text}</p>
                        <div className="survey-options">
                            {q.options.map((opt) => (
                                <button
                                    key={opt}
                                    className={`survey-option ${answers[q.id] === opt ? 'survey-option--selected' : ''}`}
                                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                                    type="button"
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>

            <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={!allAnswered}
                onClick={() => navigate('/survey/results')}
            >
                إرسال الاستبيان
            </Button>
        </div>
    );
};

export default Survey;
