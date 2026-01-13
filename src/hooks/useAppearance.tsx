import { useEffect, ReactNode } from "react";
import { useTheme } from "next-themes";

// Theme color presets with light and dark mode values
const themeColors = [
  {
    id: "blue",
    light: { primary: "234 89% 45%", ring: "234 89% 45%" },
    dark: { primary: "234 89% 60%", ring: "234 89% 60%" },
  },
  {
    id: "violet",
    light: { primary: "262 83% 58%", ring: "262 83% 58%" },
    dark: { primary: "262 83% 68%", ring: "262 83% 68%" },
  },
  {
    id: "rose",
    light: { primary: "346 77% 50%", ring: "346 77% 50%" },
    dark: { primary: "346 77% 60%", ring: "346 77% 60%" },
  },
  {
    id: "orange",
    light: { primary: "24 95% 50%", ring: "24 95% 50%" },
    dark: { primary: "24 95% 55%", ring: "24 95% 55%" },
  },
  {
    id: "green",
    light: { primary: "160 84% 39%", ring: "160 84% 39%" },
    dark: { primary: "160 84% 45%", ring: "160 84% 45%" },
  },
  {
    id: "cyan",
    light: { primary: "192 91% 36%", ring: "192 91% 36%" },
    dark: { primary: "192 91% 45%", ring: "192 91% 45%" },
  },
];

function applyAccentColor(colorId: string, theme: string | undefined) {
  const colorConfig = themeColors.find(c => c.id === colorId);
  if (!colorConfig) return;

  const isDark = theme === 'dark';
  const colors = isDark ? colorConfig.dark : colorConfig.light;

  document.documentElement.style.setProperty('--primary', colors.primary);
  document.documentElement.style.setProperty('--ring', colors.ring);
  document.documentElement.style.setProperty('--sidebar-primary', colors.primary);
  document.documentElement.style.setProperty('--sidebar-ring', colors.ring);
}

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // Apply compact mode
    const compactMode = localStorage.getItem('compactMode') === 'true';
    if (compactMode) {
      document.documentElement.classList.add('compact-mode');
    }

    // Apply accent color
    const savedColor = localStorage.getItem('accentColor') || 'blue';
    applyAccentColor(savedColor, resolvedTheme);
  }, []);

  useEffect(() => {
    const savedColor = localStorage.getItem('accentColor') || 'blue';
    applyAccentColor(savedColor, resolvedTheme);
  }, [resolvedTheme]);

  return <>{children}</>;
}