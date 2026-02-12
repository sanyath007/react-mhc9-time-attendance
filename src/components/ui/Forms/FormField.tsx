import { AlertCircle, Info } from 'lucide-react';

// Form Field Component
interface FormFieldProps {
    label: string;
    required?: boolean;
    error?: string;
    hint?: string;
    children: React.ReactNode;
    className?: string;
}

const FormField: React.FC<FormFieldProps> = ({
    label,
    required,
    error,
    hint,
    children,
    className = '',
}) => (
    <div className={`space-y-1.5 ${className}`}>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {children}
        {hint && !error && (
            <p className="text-xs text-slate-400 flex items-center gap-1">
                <Info size={12} />
                {hint}
            </p>
        )}
        {error && (
            <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle size={12} />
                {error}
            </p>
        )}
    </div>
);

export default FormField;