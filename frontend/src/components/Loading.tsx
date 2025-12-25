/**
 * Loading Components
 * Consistent loading states across the app.
 * Rule 9: Components should do one thing.
 */

interface SpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
};

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
    return (
        <div
            className={`${sizeClasses[size]} border-green-500 border-t-transparent rounded-full animate-spin ${className}`}
            role="status"
            aria-label="Loading"
        />
    );
}

export function LoadingDots() {
    return (
        <div className="flex items-center gap-1" role="status" aria-label="Loading">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
    );
}

interface LoadingOverlayProps {
    message?: string;
}

export function LoadingOverlay({ message = "Loading..." }: LoadingOverlayProps) {
    return (
        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-3">
                <Spinner size="lg" />
                <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
            </div>
        </div>
    );
}

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
    return (
        <div
            className={`bg-gray-200 dark:bg-slate-700 rounded animate-pulse ${className}`}
            aria-hidden="true"
        />
    );
}

export function CardSkeleton() {
    return (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <Skeleton className="h-4 w-1/3 mb-3" />
            <Skeleton className="h-8 w-1/2 mb-2" />
            <Skeleton className="h-3 w-full mb-1" />
            <Skeleton className="h-3 w-2/3" />
        </div>
    );
}

export function MessageSkeleton() {
    return (
        <div className="flex gap-3 animate-pulse">
            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        </div>
    );
}

export function ConversationSkeleton() {
    return (
        <div className="p-3 animate-pulse">
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                    <Skeleton className="h-4 w-2/3 mb-2" />
                    <Skeleton className="h-3 w-full" />
                </div>
                <Skeleton className="h-3 w-12" />
            </div>
        </div>
    );
}

interface PageLoadingProps {
    message?: string;
}

export function PageLoading({ message = "Loading..." }: PageLoadingProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🌾</span>
                </div>
                <Spinner size="lg" />
                <p className="text-gray-600 dark:text-gray-400">{message}</p>
            </div>
        </div>
    );
}

export default Spinner;
