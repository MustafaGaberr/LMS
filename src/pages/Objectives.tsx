import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ChevronLeft } from 'lucide-react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';

const OBJECTIVES = [
    { id: '1', title: 'الهدف الأول', desc: 'فهم المفاهيم الأساسية', done: false },
    { id: '2', title: 'الهدف الثاني', desc: 'تطبيق المعرفة عملياً', done: false },
    { id: '3', title: 'الهدف الثالث', desc: 'تقييم الأداء والتحسين', done: false },
];

const Objectives: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div style={{ padding: 'var(--space-5) var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div className="placeholder-icon" style={{ alignSelf: 'center', marginBottom: 'var(--space-2)' }}>
                <Target size={32} />
            </div>
            {OBJECTIVES.map((obj) => (
                <Card key={obj.id} elevated onClick={() => navigate(`/objectives/${obj.id}`)}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ fontWeight: 700, marginBottom: '4px' }}>{obj.title}</p>
                            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-3)' }}>{obj.desc}</p>
                        </div>
                        <ChevronLeft size={18} color="var(--color-text-3)" />
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default Objectives;
