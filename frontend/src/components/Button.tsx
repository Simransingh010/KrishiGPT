/**
 * Button Components
 * Rule 10: Prefer composition over configuration.
 * Instead of <Button variant="primary" size="large" />,
 * we use <PrimaryButton />, <SecondaryButton />, etc.
 */

import { forwardRef, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./Loading";

// Base props
interface BaseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    isLoading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

// Base styles
const baseStyles = "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

// Primary Button - Main CTA
export const PrimaryButton = forwardRef<HTMLButtonElement, BaseButtonProps>(
    ({ children, isLoading, leftIcon, rightIcon, className, disabled, ...props }, ref) => (
        <button
            ref={ref}
            className={cn(
                baseStyles,
                "px-4 py-2.5 bg-green-500 text-white hover:bg-green-600 focus:ring-green-500",
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? <Spinner size="sm" className="border-white border-t-transparent" /> : leftIcon}
            {children}
            {!isLoading && rightIcon}
        </button>
    )
);
PrimaryButton.displayName = "PrimaryButton";

// Secondary Button - Less prominent actions
export const SecondaryButton = forwardRef<HTMLButtonElement, BaseButtonProps>(
    ({ children, isLoading, leftIcon, rightIcon, className, disabled, ...props }, ref) => (
        <button
            ref={ref}
            className={cn(
                baseStyles,
                "px-4 py-2.5 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 focus:ring-gray-500",
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? <Spinner size="sm" /> : leftIcon}
            {children}
            {!isLoading && rightIcon}
        </button>
    )
);
SecondaryButton.displayName = "SecondaryButton";

// Ghost Button - Minimal styling
export const GhostButton = forwardRef<HTMLButtonElement, BaseButtonProps>(
    ({ children, isLoading, leftIcon, rightIcon, className, disabled, ...props }, ref) => (
        <button
            ref={ref}
            className={cn(
                baseStyles,
                "px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 focus:ring-gray-500",
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? <Spinner size="sm" /> : leftIcon}
            {children}
            {!isLoading && rightIcon}
        </button>
    )
);
GhostButton.displayName = "GhostButton";

// Danger Button - Destructive actions
export const DangerButton = forwardRef<HTMLButtonElement, BaseButtonProps>(
    ({ children, isLoading, leftIcon, rightIcon, className, disabled, ...props }, ref) => (
        <button
            ref={ref}
            className={cn(
                baseStyles,
                "px-4 py-2.5 bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? <Spinner size="sm" className="border-white border-t-transparent" /> : leftIcon}
            {children}
            {!isLoading && rightIcon}
        </button>
    )
);
DangerButton.displayName = "DangerButton";

// Icon Button - Square button for icons only
export const IconButton = forwardRef<HTMLButtonElement, Omit<BaseButtonProps, "leftIcon" | "rightIcon">>(
    ({ children, isLoading, className, disabled, ...props }, ref) => (
        <button
            ref={ref}
            className={cn(
                "inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed",
                "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800",
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? <Spinner size="sm" /> : children}
        </button>
    )
);
IconButton.displayName = "IconButton";

// Pill Button - Rounded full
export const PillButton = forwardRef<HTMLButtonElement, BaseButtonProps>(
    ({ children, isLoading, leftIcon, rightIcon, className, disabled, ...props }, ref) => (
        <button
            ref={ref}
            className={cn(
                baseStyles,
                "px-6 py-2.5 rounded-full bg-green-500 text-white hover:bg-green-600 focus:ring-green-500",
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? <Spinner size="sm" className="border-white border-t-transparent" /> : leftIcon}
            {children}
            {!isLoading && rightIcon}
        </button>
    )
);
PillButton.displayName = "PillButton";
