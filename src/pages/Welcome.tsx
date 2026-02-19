import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/Button';
import { course } from '../data/sampleCourse';
import './Welcome.css';

const Welcome: React.FC = () => {
    const navigate = useNavigate();
    const activeUserId = useAppStore((s) => s.activeUserId);
    const label = activeUserId === 'student1' ? 'الطالب الأول' : 'الطالب الثاني';

    return (
        <div className="welcome-page">
            <div className="welcome-bg-blob" />

            <div className="welcome-content">
                <div className="welcome-emoji">🎉</div>
                <h2 className="welcome-title">أهلاً، {label}!</h2>
                <p className="welcome-course-name">{course.title}</p>
                <p className="welcome-desc">
                    أنت على وشك البدء في رحلة تعلم استثنائية. تعرّف على الدورة وأهدافها قبل أن تنطلق.
                </p>

                <div className="welcome-stats">
                    <div className="welcome-stat">
                        <span className="welcome-stat__value">{course.units.length}</span>
                        <span className="welcome-stat__label">وحدات</span>
                    </div>
                    <div className="welcome-stat-divider" />
                    <div className="welcome-stat">
                        <span className="welcome-stat__value">
                            {course.units.reduce((acc, u) => acc + u.lessons.length, 0)}
                        </span>
                        <span className="welcome-stat__label">درسًا</span>
                    </div>
                    <div className="welcome-stat-divider" />
                    <div className="welcome-stat">
                        <span className="welcome-stat__value">{course.objectives.length}</span>
                        <span className="welcome-stat__label">أهداف</span>
                    </div>
                </div>
            </div>

            <div className="welcome-footer">
                <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/course-start')}>
                    ابدأ الآن 🚀
                </Button>
                <Button variant="ghost" size="md" fullWidth onClick={() => navigate('/units')}>
                    انتقل مباشرةً للوحدات
                </Button>
            </div>
        </div>
    );
};

export default Welcome;
