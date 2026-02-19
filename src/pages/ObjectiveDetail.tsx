import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const ObjectiveDetail: React.FC = () => {
    const { id } = useParams();
    return (
        <div className="placeholder-page" style={{ padding: 'var(--space-8) var(--space-6)' }}>
            <div className="placeholder-icon"><CheckCircle size={36} /></div>
            <p className="placeholder-title">الهدف رقم {id}</p>
            <p className="placeholder-subtitle">تفاصيل الهدف التعليمي ستظهر هنا</p>
        </div>
    );
};

export default ObjectiveDetail;
