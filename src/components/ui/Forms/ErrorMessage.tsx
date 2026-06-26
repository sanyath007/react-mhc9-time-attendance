import { AlertCircle } from 'lucide-react'
import { cn } from '../../../lib/utils/tailwindcss'

const ErrorMessage = ({ message, className }: { message: string, className?: string }) => {
    return (
        <p className={cn("text-xs text-rose-500 flex items-center gap-1", className)}>
            <AlertCircle size={12} />
            {message}
        </p>
    )
}

export default ErrorMessage