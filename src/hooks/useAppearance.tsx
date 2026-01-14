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

// Sidebar background color presets
const sidebarColors = [
  {
    id: "dark-blue",
    light: { 
      background: "234 47% 12%", 
      foreground: "220 20% 95%", 
      accent: "234 47% 18%",
      border: "234 30% 20%",
      muted: "234 20% 40%"
    },
    dark: { 
      background: "222 47% 6%", 
      foreground: "220 20% 95%", 
      accent: "222 47% 12%",
      border: "222 30% 15%",
      muted: "222 20% 40%"
    },
  },
  {
    id: "charcoal",
    light: { 
      background: "220 20% 15%", 
      foreground: "220 20% 95%", 
      accent: "220 20% 20%",
      border: "220 15% 25%",
      muted: "220 15% 45%"
    },
    dark: { 
      background: "220 20% 8%", 
      foreground: "220 20% 95%", 
      accent: "220 20% 12%",
      border: "220 15% 18%",
      muted: "220 15% 40%"
    },
  },
  {
    id: "slate",
    light: { 
      background: "215 28% 17%", 
      foreground: "210 40% 96%", 
      accent: "215 28% 22%",
      border: "215 20% 27%",
      muted: "215 16% 47%"
    },
    dark: { 
      background: "215 28% 9%", 
      foreground: "210 40% 96%", 
      accent: "215 28% 14%",
      border: "215 20% 20%",
      muted: "215 16% 43%"
    },
  },
  {
    id: "zinc",
    light: { 
      background: "240 6% 18%", 
      foreground: "0 0% 95%", 
      accent: "240 6% 23%",
      border: "240 5% 28%",
      muted: "240 4% 46%"
    },
    dark: { 
      background: "240 6% 10%", 
      foreground: "0 0% 95%", 
      accent: "240 6% 15%",
      border: "240 5% 20%",
      muted: "240 4% 42%"
    },
  },
  {
    id: "stone",
    light: { 
      background: "30 6% 20%", 
      foreground: "30 10% 95%", 
      accent: "30 6% 25%",
      border: "30 5% 30%",
      muted: "30 4% 46%"
    },
    dark: { 
      background: "30 6% 10%", 
      foreground: "30 10% 95%", 
      accent: "30 6% 15%",
      border: "30 5% 18%",
      muted: "30 4% 40%"
    },
  },
  {
    id: "neutral",
    light: { 
      background: "0 0% 18%", 
      foreground: "0 0% 95%", 
      accent: "0 0% 23%",
      border: "0 0% 28%",
      muted: "0 0% 45%"
    },
    dark: { 
      background: "0 0% 9%", 
      foreground: "0 0% 95%", 
      accent: "0 0% 14%",
      border: "0 0% 19%",
      muted: "0 0% 40%"
    },
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

function applySidebarColor(colorId: string, theme: string | undefined) {
  const colorConfig = sidebarColors.find(c => c.id === colorId);
  if (!colorConfig) return;

  const isDark = theme === 'dark';
  const colors = isDark ? colorConfig.dark : colorConfig.light;

  document.documentElement.style.setProperty('--sidebar-background', colors.background);
  document.documentElement.style.setProperty('--sidebar-foreground', colors.foreground);
  document.documentElement.style.setProperty('--sidebar-accent', colors.accent);
  document.documentElement.style.setProperty('--sidebar-border', colors.border);
  document.documentElement.style.setProperty('--sidebar-muted', colors.muted);
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

    // Apply sidebar color
    const savedSidebarColor = localStorage.getItem('sidebarColor') || 'dark-blue';
    applySidebarColor(savedSidebarColor, resolvedTheme);
  }, []);

  useEffect(() => {
    const savedColor = localStorage.getItem('accentColor') || 'blue';
    applyAccentColor(savedColor, resolvedTheme);

    const savedSidebarColor = localStorage.getItem('sidebarColor') || 'dark-blue';
    applySidebarColor(savedSidebarColor, resolvedTheme);
  }, [resolvedTheme]);

  return <>{children}</>;
}