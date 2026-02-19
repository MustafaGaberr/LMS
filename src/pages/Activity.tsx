import React from 'react';
import { useParams } from 'react-router-dom';
import { Zap } from 'lucide-react';

const Activity: React.FC = () => {
    const { unitId, lessonId } = useParams();
    return (
        <div className="placeholder-page" style={{ padding: 'var(--space-8) var(--space-6)' }}>
            <div className="placeholder-icon"><Zap size={36} /></div>
            <p className="placeholder-title">النشاط التفاعلي</p>
            <p className="placeholder-subtitle">{unitId} / {lessonId}</p>
            <p className="placeholder-subtitle">الأنشطة والتمارين ستُبنى في المرحلة التالية</p>
        </div>
    );
};

export default Activity;
