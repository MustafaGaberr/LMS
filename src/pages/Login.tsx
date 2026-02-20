import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, AlertCircle, Bot, GraduationCap } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import './Login.css';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const login = useAppStore((s) => s.login);
    const seenOnboarding = useAppStore((s) => s.seenOnboarding);

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

        setLoading(true);
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
            {/* ── Hero / top section ── */}
            <div className="login-hero">
                <div className="login-hero__blob" />

                {/* Bot icon + animated dots + Student icon */}
                <div className="login-hero__bots">
                    <div className="login-hero__bot-icon">
                        <Bot size={40} strokeWidth={1.4} />
                    </div>

                    {/* Animated dots between */}
                    <div className="login-hero__dots">
                        <span /><span /><span />
                    </div>

                    <div className="login-hero__bot-icon login-hero__bot-icon--right">
                        <GraduationCap size={40} strokeWidth={1.4} />
                    </div>
                </div>

                {/* Chatbot greeting card */}
                <div className="login-hero__greeting">
                    <p className="login-hero__greeting-bold">مرحباً... أنا روبوت المحادثة الذكي</p>
                    <p className="login-hero__greeting-sub">قم بتسجيل الدخول لنبدأ</p>
                </div>
            </div>

            {/* ── Form card / bottom section ── */}
            <div className="login-form-wrap">
                <form className="login-form" onSubmit={handleSubmit} noValidate>
                    {error && (
                        <div className="error-toast" role="alert">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Username — icon on RIGHT (first in RTL) */}
                    <div className="login-field-group">
                        <label className="login-label" htmlFor="username">اسم المستخدم</label>
                        <div className="login-field">
                            <span className="login-field__icon"><User size={18} /></span>
                            <input
                                id="username"
                                className="login-field__input"
                                type="text"
                                placeholder="ادخل اسم المستخدم"
                                value={username}
                                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                                autoComplete="username"
                                autoCapitalize="none"
                                autoCorrect="off"
                            />
                        </div>
                    </div>

                    {/* Password — Lock on RIGHT, Eye on LEFT */}
                    <div className="login-field-group">
                        <label className="login-label" htmlFor="password">كلمة المرور</label>
                        <div className="login-field">
                            <span className="login-field__icon"><Lock size={18} /></span>
                            <input
                                id="password"
                                className="login-field__input"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="login-field__eye"
                                onClick={() => setShowPassword((v) => !v)}
                                tabIndex={-1}
                                aria-label={showPassword ? 'إخفاء' : 'إظهار'}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button type="submit" className="login-submit-btn" disabled={loading}>
                        {loading ? (
                            <span className="login-submit-btn__dots">
                                <span /><span /><span />
                            </span>
                        ) : 'تسجيل الدخول'}
                    </button>

                    <p className="login-hint">
                        استخدم: <strong>student1</strong> أو <strong>student2</strong> — كلمة المرور: <strong>1234</strong>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
