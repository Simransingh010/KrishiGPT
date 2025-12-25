"use client";

import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {label}
                {props.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
                className={cn(
                    "w-full px-4 py-2.5 rounded-xl border transition-colors",
                    "bg-white dark:bg-slate-800",
                    "border-slate-200 dark:border-slate-700",
                    "text-slate-900 dark:text-white",
                    "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                    "focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500",
                    error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
                    className
                )}
                {...props}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {label}
                {props.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
                className={cn(
                    "w-full px-4 py-2.5 rounded-xl border transition-colors resize-none",
                    "bg-white dark:bg-slate-800",
                    "border-slate-200 dark:border-slate-700",
                    "text-slate-900 dark:text-white",
                    "placeholder:text-slate-400 dark:placeholder:text-slate-500",
                    "focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500",
                    error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
                    className
                )}
                rows={4}
                {...props}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: { value: string; label: string }[];
    error?: string;
}

export function Select({ label, options, error, className, ...props }: SelectProps) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {label}
                {props.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
                className={cn(
                    "w-full px-4 py-2.5 rounded-xl border transition-colors",
                    "bg-white dark:bg-slate-800",
                    "border-slate-200 dark:border-slate-700",
                    "text-slate-900 dark:text-white",
                    "focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500",
                    error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
                    className
                )}
                {...props}
            >
                <option value="">Select...</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
    label: string;
}

export function Checkbox({ label, className, ...props }: CheckboxProps) {
    return (
        <label className="flex items-center gap-3 cursor-pointer">
            <input
                type="checkbox"
                className={cn(
                    "w-5 h-5 rounded border-slate-300 dark:border-slate-600",
                    "text-green-600 focus:ring-green-500/20",
                    className
                )}
                {...props}
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
        </label>
    );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "ghost";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
}

export function Button({
    variant = "primary",
    size = "md",
    isLoading,
    children,
    className,
    disabled,
    ...props
}: ButtonProps) {
    const variants = {
        primary: "bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400",
        secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
        danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400",
        ghost: "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2.5 text-sm",
        lg: "px-6 py-3 text-base",
    };

    return (
        <button
            className={cn(
                "font-semibold rounded-xl transition-colors disabled:cursor-not-allowed",
                variants[variant],
                sizes[size],
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                    </svg>
                    Loading...
                </span>
            ) : (
                children
            )}
        </button>
    );
}
