"use client";

/**
 * AuthGuard Component
 * Protects routes that require authentication.
 * Rule 9: Component does one thing - guards routes.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";

interface AuthGuardProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
    const { status, isAuthenticated } = useAuthContext();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // Loading state
    if (status === "loading") {
        return fallback ?? <AuthLoadingScreen />;
    }

    // Not authenticated - will redirect
    if (!isAuthenticated) {
        return fallback ?? <AuthLoadingScreen />;
    }

    return <>{children}</>;
}

function AuthLoadingScreen() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            </div>
        </div>
    );
}
