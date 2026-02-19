import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '../components/Button';

const SurveyResults: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="placeholder-page" style={{ padding: 'var(--space-8) var(--space-6)' }}>
            <CheckCircle size={64} color="var(--color-success)" />
            <p className="placeholder-title">شكراً لمشاركتك!</p>
            <p className="placeholder-subtitle">تم تسجيل إجاباتك بنجاح. تحليل النتائج سيظهر هنا.</p>
            <Button variant="primary" size="md" onClick={() => navigate('/units')}>
                العودة للوحدات
            </Button>
        </div>
    );
};

export default SurveyResults;
