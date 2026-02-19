import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Howl } from 'howler';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import './Login.css';

// Simple click sound data URI (beep)
const CLICK_SOUND_SRC = 'data:audio/wav;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7xA4Tvh9Rz/y8QADBwMWgQAZG/ILNAARQ4GLTcDeIIIhxGOBAuD7hOfBB3/94gcJ3w+o5/5eIAIAAAVwWgQAVQ2ORaIQwEMAJiDg95G4nQL7mQVWI6GwRcfsZAcsKkJvxgxEjzFUgfHoSQ9Qq7KNwqHwuB13MA4a1q/DmBrHgPcmjiGoh//EwC5nGPEmS4RcfkVKOhJf+WOgoxJclFz3kgn//dBA+ya1GhurNn8zb//9NNutNuhz31f////9vt///z+IdAEAAAK4LQIAKobHItEIYCGAExBwe8jcToF9zIKrEdDYIuP2MgOWFSE34wYiR5iqQPj0JIeoVdlG4VDlXAgt1RcAMwA6wAFpAZBZEJAtcnMFCAnpijELuEK+vHAAgEBME2QBACFwGAAABBgAAAAAAAAAAg==';

let clickHowl: Howl | null = null;

function getClickSound() {
    if (!clickHowl) {
        clickHowl = new Howl({ src: [CLICK_SOUND_SRC], volume: 0.5 });
    }
    return clickHowl;
}

const Login: React.FC = () => {
    const navigate = useNavigate();
    const login = useAppStore((s) => s.login);
    const seenOnboarding = useAppStore((s) => s.seenOnboarding);
    const soundEnabled = useAppStore((s) => s.settings.soundEnabled);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username.trim() || !password.trim()) {
            setError('يرجى إدخال اسم المستخدم وكلمة المرور');
            return;
        }

        if (soundEnabled) {
            try { getClickSound().play(); } catch { }
        }

        setLoading(true);

        // Simulate async delay for UX
        await new Promise((r) => setTimeout(r, 500));

        const success = login(username.trim(), password);
        setLoading(false);

        if (!success) {
            setError('اسم المستخدم أو كلمة المرور غير صحيحة');
            return;
        }

        if (!seenOnboarding) {
            navigate('/onboarding', { replace: true });
        } else {
            navigate('/units', { replace: true });
        }
    };

    return (
        <div className="login-page">
            {/* Illustration / Brand area */}
            <div className="login-hero">
                <div className="login-hero__blob" />
                <div className="login-hero__icon-wrap">
                    <svg viewBox="0 0 80 80" fill="none" className="login-hero__svg">
                        <circle cx="40" cy="40" r="40" fill="var(--color-primary)" opacity="0.12" />
                        <path
                            d="M20 54V30a4 4 0 0 1 4-4h32a4 4 0 0 1 4 4v24"
                            stroke="var(--color-primary)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                        />
                        <path
                            d="M14 54h52M32 26v-6a8 8 0 0 1 16 0v6"
                            stroke="var(--color-primary)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                        />
                        <circle cx="40" cy="42" r="5" fill="var(--color-primary)" />
                        <path d="M40 47v5" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                </div>
                <h2 className="login-hero__title">منصة التعلم</h2>
                <p className="login-hero__subtitle">سجّل دخولك للمتابعة</p>
            </div>

            {/* Form card */}
            <div className="login-form-wrap">
                <form className="login-form" onSubmit={handleSubmit} noValidate>
                    {error && (
                        <div className="error-toast" role="alert">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <Input
                        id="username"
                        label="اسم المستخدم"
                        type="text"
                        placeholder="student1 أو student2"
                        value={username}
                        onChange={(e) => { setUsername(e.target.value); setError(''); }}
                        iconStart={<User size={18} />}
                        autoComplete="username"
                        autoCapitalize="none"
                        autoCorrect="off"
                    />

                    <Input
                        id="password"
                        label="كلمة المرور"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        iconStart={<Lock size={18} />}
                        iconEnd={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        onIconEndClick={() => setShowPassword((v) => !v)}
                        autoComplete="current-password"
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
                        loading={loading}
                    >
                        تسجيل الدخول
                    </Button>

                    <p className="login-hint">
                        استخدم: <strong>student1</strong> أو <strong>student2</strong> — كلمة المرور: <strong>1234</strong>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
