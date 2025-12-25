/**
 * useAuth Hook
 * Manages authentication state and actions.
 * Rule 5: Custom hooks before Context.
 * Rule 7: Status FSM instead of boolean explosion.
 */

import { useEffect, useReducer, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import type { AuthStatus, SignInCredentials, SignUpCredentials, AuthError } from "@/types/auth";

interface AuthState {
    status: AuthStatus;
    user: User | null;
    session: Session | null;
    error: AuthError | null;
}

type AuthAction =
    | { type: "LOADING" }
    | { type: "AUTHENTICATED"; payload: { user: User; session: Session } }
    | { type: "UNAUTHENTICATED" }
    | { type: "ERROR"; payload: AuthError }
    | { type: "CLEAR_ERROR" };

function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case "LOADING":
            return { ...state, status: "loading", error: null };
        case "AUTHENTICATED":
            return {
                status: "authenticated",
                user: action.payload.user,
                session: action.payload.session,
                error: null,
            };
        case "UNAUTHENTICATED":
            return { status: "unauthenticated", user: null, session: null, error: null };
        case "ERROR":
            return { ...state, status: "unauthenticated", error: action.payload };
        case "CLEAR_ERROR":
            return { ...state, error: null };
        default:
            return state;
    }
}

const initialState: AuthState = {
    status: "loading",
    user: null,
    session: null,
    error: null,
};

export function useAuth() {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Initialize auth state
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                dispatch({ type: "AUTHENTICATED", payload: { user: session.user, session } });
            } else {
                dispatch({ type: "UNAUTHENTICATED" });
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event: AuthChangeEvent, session: Session | null) => {
                console.log("[Auth] State change:", event);

                if (session?.user) {
                    dispatch({ type: "AUTHENTICATED", payload: { user: session.user, session } });
                } else {
                    dispatch({ type: "UNAUTHENTICATED" });
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signIn = useCallback(async ({ email, password }: SignInCredentials) => {
        dispatch({ type: "LOADING" });

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            dispatch({ type: "ERROR", payload: { message: error.message, code: error.code } });
            return { success: false, error: error.message };
        }

        return { success: true, user: data.user };
    }, []);

    const signUp = useCallback(async ({ email, password, name }: SignUpCredentials) => {
        dispatch({ type: "LOADING" });

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name },
            },
        });

        if (error) {
            dispatch({ type: "ERROR", payload: { message: error.message, code: error.code } });
            return { success: false, error: error.message };
        }

        return { success: true, user: data.user };
    }, []);

    const signInWithGoogle = useCallback(async () => {
        dispatch({ type: "LOADING" });

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            dispatch({ type: "ERROR", payload: { message: error.message, code: error.code } });
            return { success: false, error: error.message };
        }

        return { success: true };
    }, []);

    const signOut = useCallback(async () => {
        const { error } = await supabase.auth.signOut();

        if (error) {
            dispatch({ type: "ERROR", payload: { message: error.message, code: error.code } });
            return { success: false, error: error.message };
        }

        dispatch({ type: "UNAUTHENTICATED" });
        return { success: true };
    }, []);

    const clearError = useCallback(() => {
        dispatch({ type: "CLEAR_ERROR" });
    }, []);

    // Derived state
    const isAuthenticated = state.status === "authenticated";
    const isLoading = state.status === "loading";

    return {
        // State
        status: state.status,
        user: state.user,
        session: state.session,
        error: state.error,

        // Derived
        isAuthenticated,
        isLoading,
        userId: state.user?.id ?? null,

        // Actions
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        clearError,
    };
}
