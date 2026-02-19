import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { BookOpen } from 'lucide-react';

const CourseStart: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="placeholder-page" style={{ padding: 'var(--space-8) var(--space-6)' }}>
            <div className="placeholder-icon"><BookOpen size={36} /></div>
            <p className="placeholder-title">نظرة عامة على الدورة</p>
            <p className="placeholder-subtitle">اكتشف محتوى الدورة وأهدافها قبل البدء</p>
            <Button variant="primary" size="md" onClick={() => navigate('/objectives')}>
                الانتقال للأهداف
            </Button>
        </div>
    );
};

export default CourseStart;
