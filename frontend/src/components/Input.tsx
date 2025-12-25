/**
 * Input Components
 * Rule 14: Prefer controlled components.
 * Uncontrolled inputs hide bugs. Controlled inputs expose them early.
 */

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Text Input
interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
    ({ label, error, hint, leftIcon, rightIcon, className, id, ...props }, ref) => {
        const inputId = id || `input-${Math.random().toString(36).slice(2)}`;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={cn(
                            "w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500",
                            "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
                            "disabled:bg-gray-100 dark:disabled:bg-slate-900 disabled:cursor-not-allowed",
                            error
                                ? "border-red-300 dark:border-red-700"
                                : "border-gray-300 dark:border-slate-600",
                            leftIcon && "pl-10",
                            rightIcon && "pr-10",
                            className
                        )}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && (
                    <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                        {error}
                    </p>
                )}
                {hint && !error && (
                    <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                        {hint}
                    </p>
                )}
            </div>
        );
    }
);
TextInput.displayName = "TextInput";

// Textarea
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, hint, className, id, ...props }, ref) => {
        const inputId = id || `textarea-${Math.random().toString(36).slice(2)}`;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={inputId}
                    className={cn(
                        "w-full px-3 py-2.5 rounded-lg border bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none",
                        "focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent",
                        "disabled:bg-gray-100 dark:disabled:bg-slate-900 disabled:cursor-not-allowed",
                        error
                            ? "border-red-300 dark:border-red-700"
                            : "border-gray-300 dark:border-slate-600",
                        className
                    )}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
                    {...props}
                />
                {error && (
                    <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                        {error}
                    </p>
                )}
                {hint && !error && (
                    <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                        {hint}
                    </p>
                )}
            </div>
        );
    }
);
Textarea.displayName = "Textarea";

// Search Input
interface SearchInputProps extends Omit<TextInputProps, "leftIcon" | "type"> {
    onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
    ({ onClear, value, className, ...props }, ref) => {
        const hasValue = value && String(value).length > 0;

        return (
            <TextInput
                ref={ref}
                type="search"
                value={value}
                leftIcon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                }
                rightIcon={
                    hasValue && onClear ? (
                        <button
                            type="button"
                            onClick={onClear}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    ) : undefined
                }
                className={className}
                {...props}
            />
        );
    }
);
SearchInput.displayName = "SearchInput";
