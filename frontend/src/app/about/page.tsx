"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuthContext } from "@/context/AuthContext";
import {
    TrendingUp,
    Cloud,
    MessageSquare,
    ArrowRight,
    CheckCircle,
    Zap,
    Shield,
    BarChart3,
    Smartphone,
} from "lucide-react";

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
};

const stagger = {
    animate: { transition: { staggerChildren: 0.1 } },
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            <Header />

            {/* Hero Section */}
            <HeroSection />

            {/* Problem Section */}
            <ProblemSection />

            {/* Solution Section */}
            <SolutionSection />

            {/* Features Grid */}
            <FeaturesSection />

            {/* Stats Section */}
            <StatsSection />

            {/* How It Works */}
            <HowItWorksSection />

            {/* Testimonials */}
            <TestimonialsSection />

            {/* CTA Section */}
            <CTASection />

            {/* Footer */}
            <Footer />
        </div>
    );
}

function HeroSection() {
    const { isAuthenticated } = useAuthContext();
    const chatLink = isAuthenticated ? "/chat" : "/login";

    return (
        <section className="relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800" />

            {/* Floating elements */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-green-400/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-4xl mx-auto"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold mb-8"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.png" alt="" className="w-5 h-5" />
                        Empowering 140M+ Indian Farmers
                    </motion.div>

                    {/* Headline */}
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
                        AI-Powered Farming
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
                            for Every Farmer
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="mt-8 text-xl sm:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                        KrishiGPT brings the power of artificial intelligence to Indian agriculture.
                        Get instant answers, real-time market prices, and personalized recommendations
                        in your language.
                    </p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Link
                            href={chatLink}
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-all hover:scale-105 shadow-lg shadow-green-500/25"
                        >
                            {isAuthenticated ? "Go to Chat" : "Start Chatting Free"}
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
                        >
                            View Dashboard
                        </Link>
                    </motion.div>

                    {/* Trust badges */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mt-16 flex flex-wrap items-center justify-center gap-8 text-slate-400 dark:text-slate-500"
                    >
                        <span className="text-sm font-medium">Trusted by farmers in</span>
                        <div className="flex gap-6 text-sm font-semibold text-slate-600 dark:text-slate-400">
                            <span>Punjab</span>
                            <span>•</span>
                            <span>Haryana</span>
                            <span>•</span>
                            <span>UP</span>
                            <span>•</span>
                            <span>MP</span>
                            <span>•</span>
                            <span>Maharashtra</span>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}

function ProblemSection() {
    const problems = [
        { icon: "❓", title: "No Expert Access", desc: "Agricultural experts are scarce and expensive" },
        { icon: "📉", title: "Price Uncertainty", desc: "Farmers sell at wrong times, losing income" },
        { icon: "🌧️", title: "Weather Risks", desc: "Unpredictable weather destroys crops" },
        { icon: "📱", title: "Information Gap", desc: "Critical knowledge doesn't reach farmers" },
    ];

    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    variants={stagger}
                    className="text-center mb-16"
                >
                    <motion.p variants={fadeIn} className="text-green-600 dark:text-green-400 font-semibold mb-4">
                        THE PROBLEM
                    </motion.p>
                    <motion.h2 variants={fadeIn} className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white">
                        Indian farmers deserve better
                    </motion.h2>
                    <motion.p variants={fadeIn} className="mt-4 text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Despite feeding 1.4 billion people, our farmers face challenges that technology can solve.
                    </motion.p>
                </motion.div>

                <motion.div
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    variants={stagger}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {problems.map((problem, i) => (
                        <motion.div
                            key={i}
                            variants={fadeIn}
                            className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700"
                        >
                            <span className="text-4xl">{problem.icon}</span>
                            <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                                {problem.title}
                            </h3>
                            <p className="mt-2 text-slate-600 dark:text-slate-400">{problem.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

function SolutionSection() {
    return (
        <section className="py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <p className="text-green-600 dark:text-green-400 font-semibold mb-4">
                            OUR SOLUTION
                        </p>
                        <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                            Your AI farming assistant that speaks your language
                        </h2>
                        <p className="mt-6 text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                            KrishiGPT combines cutting-edge AI with deep agricultural knowledge to provide
                            instant, accurate, and actionable advice to farmers across India.
                        </p>

                        <div className="mt-8 space-y-4">
                            {[
                                "Ask questions in Hindi, Punjabi, or English",
                                "Get real-time MSP and market prices",
                                "Receive weather-based farming recommendations",
                                "Access expert knowledge 24/7, completely free",
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                                    <span className="text-slate-700 dark:text-slate-300 font-medium">{item}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-3xl blur-3xl opacity-20" />
                        <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 shadow-2xl">
                            {/* Chat mockup */}
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">
                                        K
                                    </div>
                                    <div className="flex-1 bg-slate-700 rounded-2xl rounded-tl-none p-4">
                                        <p className="text-white text-sm">
                                            नमस्ते! मैं KrishiGPT हूं। आज मैं आपकी कैसे मदद कर सकता हूं?
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-end">
                                    <div className="bg-green-600 rounded-2xl rounded-tr-none p-4 max-w-[80%]">
                                        <p className="text-white text-sm">
                                            गेहूं की फसल में पीलापन आ रहा है, क्या करूं?
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">
                                        K
                                    </div>
                                    <div className="flex-1 bg-slate-700 rounded-2xl rounded-tl-none p-4">
                                        <p className="text-white text-sm">
                                            पीलापन नाइट्रोजन की कमी का संकेत हो सकता है। यूरिया 25kg/एकड़ डालें...
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function FeaturesSection() {
    const features = [
        {
            icon: MessageSquare,
            title: "AI Chat Assistant",
            desc: "Ask any farming question and get expert answers instantly in your language.",
            color: "from-blue-500 to-indigo-500",
        },
        {
            icon: TrendingUp,
            title: "Live Market Prices",
            desc: "Real-time MSP and mandi prices to help you sell at the right time.",
            color: "from-green-500 to-emerald-500",
        },
        {
            icon: Cloud,
            title: "Weather Intelligence",
            desc: "Hyperlocal forecasts and alerts to protect your crops from weather risks.",
            color: "from-cyan-500 to-blue-500",
        },
        {
            icon: BarChart3,
            title: "Smart Dashboard",
            desc: "All your farm data in one place - prices, weather, insights, and more.",
            color: "from-purple-500 to-pink-500",
        },
        {
            icon: Smartphone,
            title: "Works Everywhere",
            desc: "Access from any device - smartphone, tablet, or computer.",
            color: "from-orange-500 to-red-500",
        },
        {
            icon: Shield,
            title: "Trusted Information",
            desc: "Verified data from government sources and agricultural experts.",
            color: "from-teal-500 to-green-500",
        },
    ];

    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    variants={stagger}
                    className="text-center mb-16"
                >
                    <motion.p variants={fadeIn} className="text-green-600 dark:text-green-400 font-semibold mb-4">
                        FEATURES
                    </motion.p>
                    <motion.h2 variants={fadeIn} className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white">
                        Everything you need to farm smarter
                    </motion.h2>
                </motion.div>

                <motion.div
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    variants={stagger}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {features.map((feature, i) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={i}
                                variants={fadeIn}
                                className="group p-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all hover:-translate-y-1"
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                                    <Icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}

function StatsSection() {
    const stats = [
        { value: "10K+", label: "Farmers Helped" },
        { value: "50K+", label: "Questions Answered" },
        { value: "15+", label: "States Covered" },
        { value: "99%", label: "Accuracy Rate" },
    ];

    return (
        <section className="py-24 bg-gradient-to-br from-green-600 to-emerald-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    variants={stagger}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-8"
                >
                    {stats.map((stat, i) => (
                        <motion.div key={i} variants={fadeIn} className="text-center">
                            <p className="text-5xl sm:text-6xl font-extrabold text-white">{stat.value}</p>
                            <p className="mt-2 text-green-100 font-medium">{stat.label}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

function HowItWorksSection() {
    const steps = [
        { num: "01", title: "Ask Your Question", desc: "Type or speak your farming question in any language" },
        { num: "02", title: "AI Analyzes", desc: "Our AI processes your query with agricultural knowledge" },
        { num: "03", title: "Get Expert Advice", desc: "Receive personalized, actionable recommendations" },
    ];

    return (
        <section className="py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    variants={stagger}
                    className="text-center mb-16"
                >
                    <motion.p variants={fadeIn} className="text-green-600 dark:text-green-400 font-semibold mb-4">
                        HOW IT WORKS
                    </motion.p>
                    <motion.h2 variants={fadeIn} className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white">
                        Simple as 1-2-3
                    </motion.h2>
                </motion.div>

                <motion.div
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    variants={stagger}
                    className="grid md:grid-cols-3 gap-8"
                >
                    {steps.map((step, i) => (
                        <motion.div key={i} variants={fadeIn} className="relative">
                            <div className="text-8xl font-extrabold text-slate-100 dark:text-slate-800 absolute -top-4 -left-2">
                                {step.num}
                            </div>
                            <div className="relative pt-12 pl-4">
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                                    {step.title}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-lg">{step.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

function TestimonialsSection() {
    const testimonials = [
        {
            quote: "KrishiGPT ने मेरी फसल बचा ली। समय पर सही सलाह मिली।",
            name: "Rajinder Singh",
            role: "Wheat Farmer, Punjab",
            avatar: "👨‍🌾",
        },
        {
            quote: "Market prices की जानकारी से मुझे 20% ज्यादा दाम मिले।",
            name: "Suresh Patel",
            role: "Cotton Farmer, Gujarat",
            avatar: "👨‍🌾",
        },
        {
            quote: "अब मुझे किसी expert के पास जाने की जरूरत नहीं।",
            name: "Lakshmi Devi",
            role: "Vegetable Farmer, UP",
            avatar: "👩‍🌾",
        },
    ];

    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    variants={stagger}
                    className="text-center mb-16"
                >
                    <motion.p variants={fadeIn} className="text-green-600 dark:text-green-400 font-semibold mb-4">
                        TESTIMONIALS
                    </motion.p>
                    <motion.h2 variants={fadeIn} className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white">
                        Loved by farmers
                    </motion.h2>
                </motion.div>

                <motion.div
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    variants={stagger}
                    className="grid md:grid-cols-3 gap-8"
                >
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            variants={fadeIn}
                            className="p-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700"
                        >
                            <p className="text-lg text-slate-700 dark:text-slate-300 italic mb-6">
                                &ldquo;{t.quote}&rdquo;
                            </p>
                            <div className="flex items-center gap-4">
                                <span className="text-4xl">{t.avatar}</span>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">{t.name}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{t.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

function CTASection() {
    const { isAuthenticated } = useAuthContext();
    const chatLink = isAuthenticated ? "/chat" : "/login";

    return (
        <section className="py-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                        Ready to transform your farming?
                    </h2>
                    <p className="text-xl text-slate-600 dark:text-slate-400 mb-10">
                        Join thousands of farmers already using KrishiGPT. It&apos;s free, easy, and available 24/7.
                    </p>
                    <Link
                        href={chatLink}
                        className="inline-flex items-center gap-2 px-10 py-5 bg-green-600 text-white text-lg font-semibold rounded-full hover:bg-green-700 transition-all hover:scale-105 shadow-lg shadow-green-500/25"
                    >
                        <Zap className="w-6 h-6" />
                        {isAuthenticated ? "Go to Chat" : "Start Using KrishiGPT Now"}
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}

function Footer() {
    const { isAuthenticated } = useAuthContext();
    const chatLink = isAuthenticated ? "/chat" : "/login";

    return (
        <footer className="bg-slate-900 text-slate-400 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-4 gap-12">
                    <div className="md:col-span-2">
                        <div className="mb-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/logo.png" alt="KrishiGPT" className="h-12 object-contain" />
                        </div>
                        <p className="text-slate-400 max-w-md">
                            Empowering Indian farmers with AI-powered insights, real-time market data,
                            and expert agricultural advice.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Product</h4>
                        <ul className="space-y-2">
                            <li><Link href={chatLink} className="hover:text-white transition-colors">AI Chat</Link></li>
                            <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                            <li><Link href="/admin" className="hover:text-white transition-colors">Admin</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-4">Company</h4>
                        <ul className="space-y-2">
                            <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm">
                    <p>© 2024 KrishiGPT. Made with ❤️ for Indian Farmers.</p>
                </div>
            </div>
        </footer>
    );
}
