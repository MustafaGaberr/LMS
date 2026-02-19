import React from 'react';
import { Map } from 'lucide-react';
import { Badge } from '../components/Badge';
import './Roadmap.css';

const STAGES = [
    { id: 1, label: 'تسجيل الدخول', done: true },
    { id: 2, label: 'الاستعداد', done: true },
    { id: 3, label: 'الوحدة الأولى', done: false, current: true },
    { id: 4, label: 'الوحدة الثانية', done: false },
    { id: 5, label: 'التقييم النهائي', done: false },
];

const Roadmap: React.FC = () => {
    return (
        <div className="roadmap-page">
            <div className="roadmap-header">
                <div className="placeholder-icon" style={{ alignSelf: 'center', background: 'var(--color-primary-subtle)' }}>
                    <Map size={32} />
                </div>
                <h2 className="roadmap-title">خريطة رحلتك التعليمية</h2>
                <p className="roadmap-subtitle">تتبع تقدمك خطوة بخطوة</p>
            </div>

            <div className="roadmap-track">
                {STAGES.map((stage, i) => (
                    <div key={stage.id} className="roadmap-node">
                        <div className={`roadmap-circle ${stage.done ? 'roadmap-circle--done' : ''} ${stage.current ? 'roadmap-circle--current' : ''}`}>
                            {stage.done ? '✓' : stage.id}
                        </div>
                        {i < STAGES.length - 1 && (
                            <div className={`roadmap-line ${stage.done ? 'roadmap-line--done' : ''}`} />
                        )}
                        <div className="roadmap-label">
                            <span>{stage.label}</span>
                            {stage.current && <Badge variant="accent">الآن</Badge>}
                            {stage.done && <Badge variant="success">مكتمل</Badge>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Roadmap;
