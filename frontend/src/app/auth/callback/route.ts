/**
 * OAuth Callback Handler
 * Handles redirect from OAuth providers (Google, etc.)
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");

    if (code) {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        await supabase.auth.exchangeCodeForSession(code);
    }

    // Redirect to chat after successful auth
    return NextResponse.redirect(new URL("/chat", requestUrl.origin));
}
