"use client";

/**
 * Auth Context
 * Global cross-app auth state (Rule 5: Context for global state only).
 * Wraps useAuth hook for app-wide access.
 */

import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

type AuthContextType = ReturnType<typeof useAuth>;

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const auth = useAuth();

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuthContext must be used within AuthProvider");
    }
    return context;
}
