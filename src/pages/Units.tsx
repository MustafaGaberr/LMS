import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ChevronLeft, Lock } from 'lucide-react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';

const UNITS = [
    { id: 'u1', title: 'الوحدة الأولى', subtitle: 'مقدمة في المفاهيم', lessons: 5, locked: false },
    { id: 'u2', title: 'الوحدة الثانية', subtitle: 'التطبيق العملي', lessons: 4, locked: true },
    { id: 'u3', title: 'الوحدة الثالثة', subtitle: 'التقييم والمراجعة', lessons: 3, locked: true },
];

const Units: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div style={{ padding: 'var(--space-5) var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ marginBottom: 'var(--space-2)' }}>
                <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>الوحدات التعليمية</h2>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-3)', marginTop: 4 }}>
                    اختر وحدة للمتابعة
                </p>
            </div>
            {UNITS.map((unit) => (
                <Card
                    key={unit.id}
                    elevated
                    onClick={unit.locked ? undefined : () => navigate(`/units/${unit.id}/lessons`)}
                    style={{ opacity: unit.locked ? 0.6 : 1 } as React.CSSProperties}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                        <div className="placeholder-icon" style={{ width: 52, height: 52, borderRadius: 'var(--radius-lg)', flexShrink: 0, margin: 0 }}>
                            {unit.locked ? <Lock size={22} /> : <BookOpen size={22} />}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginBottom: 4 }}>
                                <span style={{ fontWeight: 700 }}>{unit.title}</span>
                                {unit.locked && <Badge variant="neutral">مقفل</Badge>}
                            </div>
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-3)' }}>{unit.subtitle}</p>
                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-3)', marginTop: 4 }}>
                                {unit.lessons} دروس
                            </p>
                        </div>
                        {!unit.locked && <ChevronLeft size={18} color="var(--color-text-3)" />}
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default Units;
