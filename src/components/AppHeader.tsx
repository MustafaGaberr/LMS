import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import './AppHeader.css';

export interface AppHeaderProps {
    title: string;
    showBack?: boolean;
    onBack?: () => void;
    rightSlot?: React.ReactNode;
    transparent?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
    title,
    showBack = false,
    onBack,
    rightSlot,
    transparent = false,
}) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    return (
        <header className={clsx('app-header', { 'app-header--transparent': transparent })}>
            <div className="app-header__inner">
                {/* Right side: back button or spacer */}
                <div className="app-header__side app-header__side--right">
                    {showBack && (
                        <button
                            className="app-header__back-btn"
                            onClick={handleBack}
                            aria-label="رجوع"
                            type="button"
                        >
                            <ArrowRight size={20} />
                        </button>
                    )}
                </div>

                {/* Center: title */}
                <h1 className="app-header__title">{title}</h1>

                {/* Left side: optional slot */}
                <div className="app-header__side app-header__side--left">
                    {rightSlot}
                </div>
            </div>
        </header>
    );
};

export default AppHeader;
