import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, VolumeX, RotateCcw, User, Palette, LogOut } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import './Settings.css';

const Settings: React.FC = () => {
    const navigate = useNavigate();
    const activeUserId = useAppStore((s) => s.activeUserId);
    const theme = useAppStore((s) => s.theme);
    const soundEnabled = useAppStore((s) => s.settings.soundEnabled);
    const toggleSound = useAppStore((s) => s.toggleSound);
    const logout = useAppStore((s) => s.logout);
    const resetAll = useAppStore((s) => s.resetAll);

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const handleReset = async () => {
        if (window.confirm('هل أنت متأكد؟ سيتم حذف جميع البيانات والعودة إلى البداية.')) {
            await resetAll();
            navigate('/login', { replace: true });
        }
    };

    const userLabel = activeUserId === 'student1' ? 'الطالب الأول' : 'الطالب الثاني';

    return (
        <div className="settings-page">
            {/* User info */}
            <Card elevated className="settings-card">
                <div className="settings-user">
                    <div className="settings-user__avatar">
                        <User size={26} />
                    </div>
                    <div className="settings-user__info">
                        <p className="settings-user__name">{userLabel}</p>
                        <p className="settings-user__id">{activeUserId}</p>
                    </div>
                </div>
            </Card>

            {/* Theme preview */}
            <Card elevated className="settings-card">
                <div className="settings-section-header">
                    <Palette size={18} />
                    <span>نمط الألوان</span>
                </div>
                <div className="theme-preview">
                    <div className="theme-swatch" data-label="الرئيسي">
                        <div className="theme-swatch__color" style={{ background: 'var(--color-primary)' }} />
                        <span>الأساسي</span>
                    </div>
                    <div className="theme-swatch" data-label="المميز">
                        <div className="theme-swatch__color" style={{ background: 'var(--color-accent)' }} />
                        <span>المميز</span>
                    </div>
                    <div className="theme-badge">
                        نمط {theme === 'A' ? 'أ — أزرق' : 'ب — بنفسجي'}
                    </div>
                </div>
            </Card>

            {/* Sound toggle */}
            <Card elevated className="settings-card settings-row" onClick={toggleSound}>
                <div className="settings-row__icon">
                    {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </div>
                <div className="settings-row__content">
                    <p className="settings-row__title">الأصوات</p>
                    <p className="settings-row__desc">
                        {soundEnabled ? 'مفعّلة' : 'معطّلة'}
                    </p>
                </div>
                <div className="toggle-switch" aria-checked={soundEnabled} role="switch">
                    <div className="toggle-switch__thumb" />
                </div>
            </Card>

            {/* Logout */}
            <Button
                variant="secondary"
                size="md"
                fullWidth
                icon={<LogOut size={18} />}
                iconPosition="start"
                onClick={handleLogout}
            >
                تسجيل الخروج
            </Button>

            {/* Reset */}
            <Button
                variant="danger"
                size="md"
                fullWidth
                icon={<RotateCcw size={18} />}
                iconPosition="start"
                onClick={handleReset}
            >
                إعادة تعيين التطبيق
            </Button>
        </div>
    );
};

export default Settings;
