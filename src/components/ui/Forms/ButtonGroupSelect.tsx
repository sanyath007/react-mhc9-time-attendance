import React from 'react';
import { cn } from '../../../lib/utils/tailwindcss';
import ErrorMessage from './ErrorMessage';

export interface ButtonGroupOption {
    value: string;
    label: string;
    icon?: React.ReactNode;
}

export interface ButtonGroupSelectProps {
    options: ButtonGroupOption[];
    value: string;
    onChange: (value: string) => void;
    label?: string;
    error?: string;
    disabled?: boolean;
    className?: string;
    containerCss?: string;
    buttonCss?: string;
    activeCss?: string;
    inactiveCss?: string;
}

const ButtonGroupSelect: React.FC<ButtonGroupSelectProps> = ({
    options,
    value,
    onChange,
    label,
    error,
    disabled = false,
    className,
    containerCss,
    buttonCss,
    activeCss,
    inactiveCss
}) => {
    return (
        <div className={cn('relative w-full', className)}>
            {label && (
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {label}
                </label>
            )}

            <div className={cn(
                'grid w-full p-1.5 bg-gray-50/50 border border-gray-200/80 rounded-2xl transition-all duration-200',
                disabled && 'opacity-60 cursor-not-allowed',
                error ? 'border-rose-300 bg-rose-50/10' : '',
                containerCss
            )}
            style={{
                gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`
            }}
            >
                {options.map((opt) => {
                    const isActive = opt.value === value;
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            disabled={disabled}
                            onClick={() => !disabled && onChange(opt.value)}
                            className={cn(
                                'flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-bold rounded-xl transition-all duration-250 cursor-pointer select-none active:scale-[0.98]',
                                buttonCss,
                                isActive 
                                    ? cn(
                                        'bg-white text-blue-600 shadow-[0_4px_12px_rgba(37,99,235,0.08)] border border-gray-100',
                                        activeCss
                                      )
                                    : cn(
                                        'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50',
                                        inactiveCss
                                      ),
                                disabled && 'cursor-not-allowed hover:bg-transparent hover:text-gray-400 active:scale-100'
                            )}
                        >
                            {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                            <span>{opt.label}</span>
                        </button>
                    );
                })}
            </div>

            {error && <ErrorMessage message={error} className="mt-1.5 px-1" />}
        </div>
    );
};

export default ButtonGroupSelect;
