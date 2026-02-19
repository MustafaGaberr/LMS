import React from 'react';
import { useParams } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

const Chat: React.FC = () => {
    const { unitId, lessonId } = useParams();
    return (
        <div className="placeholder-page" style={{ padding: 'var(--space-8) var(--space-6)' }}>
            <div className="placeholder-icon"><MessageCircle size={36} /></div>
            <p className="placeholder-title">المحادثة التفاعلية</p>
            <p className="placeholder-subtitle">
                {unitId} / {lessonId}
            </p>
            <p className="placeholder-subtitle">المحادثة الذكية ستُبنى هنا في المرحلة التالية</p>
        </div>
    );
};

export default Chat;
