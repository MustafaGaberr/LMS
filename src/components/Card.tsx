import React from 'react';
import clsx from 'clsx';
import './Card.css';

export interface CardProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
    elevated?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
    children,
    className,
    style,
    onClick,
    elevated = false,
    padding = 'md',
}) => {
    const Tag = onClick ? 'button' : 'div';
    return (
        <Tag
            className={clsx(
                'card',
                `card--pad-${padding}`,
                { 'card--elevated': elevated, 'card--clickable': !!onClick },
                className
            )}
            onClick={onClick}
            style={style}
            type={onClick ? 'button' : undefined}
        >
            {children}
        </Tag>
    );
};

export default Card;
