"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full p-2 bg-gray-100 dark:bg-[#121212] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-[#D4AF37] hover:bg-gray-200 dark:hover:bg-[#1a1a1a] transition-all relative overflow-hidden w-10 h-10 flex items-center justify-center"
            aria-label="Toggle theme"
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute" />
            <Moon className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute" />
        </button>
    )
}
