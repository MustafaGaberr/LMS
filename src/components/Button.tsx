import React from 'react';
import clsx from 'clsx';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'start' | 'end';
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    iconPosition = 'start',
    fullWidth = false,
    children,
    className,
    disabled,
    ...props
}) => {
    return (
        <button
            className={clsx(
                'btn',
                `btn--${variant}`,
                `btn--${size}`,
                { 'btn--full': fullWidth, 'btn--loading': loading },
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <span className="btn__spinner" aria-hidden="true" />
            ) : (
                <>
                    {icon && iconPosition === 'start' && (
                        <span className="btn__icon btn__icon--start">{icon}</span>
                    )}
                    {children && <span className="btn__label">{children}</span>}
                    {icon && iconPosition === 'end' && (
                        <span className="btn__icon btn__icon--end">{icon}</span>
                    )}
                </>
            )}
        </button>
    );
};

export default Button;
