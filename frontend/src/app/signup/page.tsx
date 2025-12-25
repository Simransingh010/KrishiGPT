import SignUpForm from "@/components/auth/SignUpForm";

export default function SignUpPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-950 dark:to-slate-900 p-4">
            <SignUpForm />
        </main>
    );
}
