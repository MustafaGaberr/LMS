import React from 'react';
import clsx from 'clsx';
import './Badge.css';

export type BadgeVariant = 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'neutral';

export interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    size?: 'sm' | 'md';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'primary',
    size = 'sm',
    className,
}) => {
    return (
        <span className={clsx('badge', `badge--${variant}`, `badge--${size}`, className)}>
            {children}
        </span>
    );
};

export default Badge;
