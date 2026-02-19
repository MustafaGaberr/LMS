import React, { useState } from 'react';
import clsx from 'clsx';
import './Input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    iconStart?: React.ReactNode;
    iconEnd?: React.ReactNode;
    onIconEndClick?: () => void;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    iconStart,
    iconEnd,
    onIconEndClick,
    className,
    id,
    ...props
}) => {
    const inputId = id ?? label;

    return (
        <div className={clsx('input-group', { 'input-group--error': !!error }, className)}>
            {label && (
                <label className="input-label" htmlFor={inputId}>
                    {label}
                </label>
            )}
            <div className="input-wrapper">
                {iconStart && (
                    <span className="input-icon input-icon--start">{iconStart}</span>
                )}
                <input
                    id={inputId}
                    className={clsx('input-field', {
                        'input-field--has-icon-start': !!iconStart,
                        'input-field--has-icon-end': !!iconEnd,
                    })}
                    {...props}
                />
                {iconEnd && (
                    <button
                        type="button"
                        className="input-icon input-icon--end input-icon--btn"
                        onClick={onIconEndClick}
                        tabIndex={-1}
                    >
                        {iconEnd}
                    </button>
                )}
            </div>
            {error && (
                <p className="input-error" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
};

export default Input;
