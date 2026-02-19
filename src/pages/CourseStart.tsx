import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Code } from 'lucide-react';
import { course } from '../data/sampleCourse';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import './CourseStart.css';

const CourseStart: React.FC = () => {
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [codeError, setCodeError] = useState('');

    const handleStart = () => {
        // Optional: validate code if provided
        if (code.trim() && code.trim().toUpperCase() !== (course.code ?? '').toUpperCase()) {
            setCodeError('كود المقرر غير صحيح. يمكنك المتابعة بدونه.');
            return;
        }
        navigate('/objectives');
    };

    const handleSkipCode = () => navigate('/objectives');

    return (
        <div className="course-start-page">
            {/* Hero card */}
            <div className="course-card">
                <div className="course-card__icon">
                    <BookOpen size={36} />
                </div>
                <h2 className="course-card__title">{course.title}</h2>
                <p className="course-card__desc">{course.description}</p>
                {course.code && (
                    <div className="course-card__code-badge">
                        <Code size={14} />
                        {course.code}
                    </div>
                )}
            </div>

            {/* Stats row */}
            <div className="course-stats">
                {[
                    { value: course.units.length, label: 'وحدات' },
                    { value: course.units.reduce((a, u) => a + u.lessons.length, 0), label: 'درسًا' },
                    { value: course.objectives.length, label: 'أهداف' },
                ].map((s) => (
                    <div key={s.label} className="course-stat">
                        <span className="course-stat__value">{s.value}</span>
                        <span className="course-stat__label">{s.label}</span>
                    </div>
                ))}
            </div>

            {/* Optional course code input */}
            <div className="course-code-section">
                <p className="course-code-hint">إذا كان لديك كود المقرر، أدخله هنا (اختياري)</p>
                <Input
                    label=""
                    placeholder="كود المقرر — مثلاً: DLS-101"
                    value={code}
                    onChange={(e) => { setCode(e.target.value); setCodeError(''); }}
                    error={codeError}
                    iconStart={<Code size={16} />}
                />
            </div>

            {/* Actions */}
            <div className="course-start-footer">
                <Button variant="primary" size="lg" fullWidth onClick={handleStart}>
                    بدء الدورة 🎯
                </Button>
                <Button variant="ghost" size="md" fullWidth onClick={handleSkipCode}>
                    بدون كود
                </Button>
            </div>
        </div>
    );
};

export default CourseStart;
