"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo3D from "../Logo3D/Logo3D";
import { LayoutDashboard, MessageSquare, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";

interface HeaderProps {
  appName?: string;
}

export default function Header({ appName = "Krishi AI" }: HeaderProps) {
  const pathname = usePathname();
  const { theme, toggleTheme, isDark } = useTheme();
  
  return (
    <header className="w-full bg-gray-50 dark:bg-slate-900 py-4 px-6 lg:px-12 border-b border-gray-100 dark:border-slate-800 transition-colors duration-300">
      <div className="mx-auto flex items-center justify-between">
        <Link href="/">
          <Logo3D />
        </Link>

        <div className="hidden md:flex items-center gap-1 bg-white dark:bg-slate-800 rounded-full shadow-sm dark:shadow-slate-900/50 px-2 py-2 transition-colors duration-300">
          <Link 
            href="/" 
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-full",
              pathname === "/" 
                ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400" 
                : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </Link>
          <Link 
            href="/dashboard" 
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-full",
              pathname === "/dashboard" 
                ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400" 
                : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-700"
            )}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <a href="#" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
            Market
          </a>
          <a href="#" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
            About
          </a>
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="ml-2 p-2 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
          
          <button className="ml-2 px-6 py-2 bg-green-500 text-white text-sm font-medium rounded-full hover:bg-green-600 transition-colors">
            Let's talk!
          </button>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-2">
          <Link 
            href="/" 
            className={cn(
              "p-2 rounded-lg transition-colors",
              pathname === "/" 
                ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400" 
                : "text-gray-700 dark:text-gray-300"
            )}
          >
            <MessageSquare className="w-5 h-5" />
          </Link>
          <Link 
            href="/dashboard" 
            className={cn(
              "p-2 rounded-lg transition-colors",
              pathname === "/dashboard" 
                ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400" 
                : "text-gray-700 dark:text-gray-300"
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
          </Link>
          
          {/* Mobile Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 transition-colors"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
