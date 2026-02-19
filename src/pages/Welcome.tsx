import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/Button';
import './Welcome.css';

const Welcome: React.FC = () => {
    const navigate = useNavigate();
    const activeUserId = useAppStore((s) => s.activeUserId);
    const label = activeUserId === 'student1' ? 'الطالب الأول' : 'الطالب الثاني';

    return (
        <div className="welcome-page">
            <div className="welcome-content">
                <div className="welcome-emoji">🎉</div>
                <h2 className="welcome-title">أهلاً وسهلاً، {label}!</h2>
                <p className="welcome-desc">أنت الآن جاهز لبدء رحلتك التعليمية. دعنا نستعرض ما ينتظرك.</p>
            </div>
            <div className="welcome-footer">
                <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/course-start')}>
                    استعرض الدورة
                </Button>
                <Button variant="ghost" size="md" fullWidth onClick={() => navigate('/units')}>
                    انتقل مباشرة للوحدات
                </Button>
            </div>
        </div>
    );
};

export default Welcome;
