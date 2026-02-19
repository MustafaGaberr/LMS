import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Play, MessageCircle, Zap } from 'lucide-react';
import { Button } from '../components/Button';

const LessonDetail: React.FC = () => {
    const { unitId, lessonId } = useParams();
    const navigate = useNavigate();

    return (
        <div style={{ padding: 'var(--space-5) var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Video placeholder */}
            <div style={{ width: '100%', aspectRatio: '16/9', background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Play size={48} />
            </div>
            <div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-3)', marginBottom: 4 }}>{unitId} / {lessonId}</p>
                <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>محتوى الدرس</h2>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-2)', marginTop: 'var(--space-2)', lineHeight: 1.8 }}>
                    محتوى الدرس التفاعلي سيظهر هنا. يمكنك مشاهدة الفيديو أو الانتقال إلى المحادثة والنشاط.
                </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <Button variant="primary" size="md" fullWidth icon={<MessageCircle size={18} />}
                    onClick={() => navigate(`/units/${unitId}/lessons/${lessonId}/chat`)}>
                    المحادثة
                </Button>
                <Button variant="secondary" size="md" fullWidth icon={<Zap size={18} />}
                    onClick={() => navigate(`/units/${unitId}/lessons/${lessonId}/activity`)}>
                    النشاط
                </Button>
            </div>
        </div>
    );
};

export default LessonDetail;
