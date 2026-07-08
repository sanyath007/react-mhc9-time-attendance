import { useState, useEffect } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

export const useTheme = (): ThemeContextType => {
    const [theme, setThemeState] = useState<Theme>(() => {
        // 1. Check localStorage for stored theme
        const storedTheme = localStorage.getItem("theme") as Theme;
        if (storedTheme) return storedTheme;

        // 2. Check system preference
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            return "dark";
        }

        // 3. Default to light
        return "light";
    });

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem("theme", newTheme);
    };

    // 5. Sync system changes
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e: MediaQueryListEvent) => {
            if (theme === "system") {
                setThemeState(e.matches ? "dark" : "light");
            }
        };
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme]);

    // 6. Apply theme class to document body
    useEffect(() => {
        const root = window.document.documentElement;

        // Remove all theme classes
        root.classList.remove("light", "dark", "system");

        // Add the current theme class
        if (theme !== "system") {
            root.classList.add(theme);
        }
    }, [theme]);

    return { theme, setTheme };
};