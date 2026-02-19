import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Play, MessageCircle, Activity, ChevronLeft } from 'lucide-react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';

const LESSONS = [
    { id: 'l1', title: 'الدرس الأول', duration: '10 دقائق' },
    { id: 'l2', title: 'الدرس الثاني', duration: '15 دقيقة' },
    { id: 'l3', title: 'الدرس الثالث', duration: '12 دقيقة' },
    { id: 'l4', title: 'الدرس الرابع', duration: '8 دقائق' },
    { id: 'l5', title: 'الدرس الخامس', duration: '20 دقيقة' },
];

const LessonsList: React.FC = () => {
    const { unitId } = useParams();
    const navigate = useNavigate();

    return (
        <div style={{ padding: 'var(--space-5) var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ marginBottom: 'var(--space-2)' }}>
                <Badge variant="primary">{unitId}</Badge>
                <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, marginTop: 'var(--space-2)' }}>الدروس</h2>
            </div>
            {LESSONS.map((lesson, i) => (
                <Card key={lesson.id} elevated onClick={() => navigate(`/units/${unitId}/lessons/${lesson.id}`)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-full)', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>
                            {i + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 600 }}>{lesson.title}</p>
                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-3)' }}>{lesson.duration}</p>
                        </div>
                        <ChevronLeft size={16} color="var(--color-text-3)" />
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default LessonsList;
