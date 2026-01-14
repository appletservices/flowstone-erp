import { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Building2,
  Users,
  Shield,
  Database,
  Bell,
  Palette,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Check,
  PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface SettingsSection {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

const sections: SettingsSection[] = [
  {
    id: "company",
    label: "Company Settings",
    icon: Building2,
    description: "Business name, address, and contact details",
  },
  {
    id: "users",
    label: "User Management",
    icon: Users,
    description: "Manage users, roles, and permissions",
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
    description: "Password policies and two-factor authentication",
  },
  {
    id: "data",
    label: "Data & Backup",
    icon: Database,
    description: "Database settings and backup configuration",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    description: "Email and alert preferences",
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: Palette,
    description: "Theme, colors, and display settings",
  },
];

// Theme color presets with light and dark mode values
const themeColors = [
  {
    id: "blue",
    name: "Blue",
    preview: "bg-blue-600",
    light: { primary: "234 89% 45%", ring: "234 89% 45%" },
    dark: { primary: "234 89% 60%", ring: "234 89% 60%" },
  },
  {
    id: "violet",
    name: "Violet",
    preview: "bg-violet-600",
    light: { primary: "262 83% 58%", ring: "262 83% 58%" },
    dark: { primary: "262 83% 68%", ring: "262 83% 68%" },
  },
  {
    id: "rose",
    name: "Rose",
    preview: "bg-rose-600",
    light: { primary: "346 77% 50%", ring: "346 77% 50%" },
    dark: { primary: "346 77% 60%", ring: "346 77% 60%" },
  },
  {
    id: "orange",
    name: "Orange",
    preview: "bg-orange-600",
    light: { primary: "24 95% 50%", ring: "24 95% 50%" },
    dark: { primary: "24 95% 55%", ring: "24 95% 55%" },
  },
  {
    id: "green",
    name: "Green",
    preview: "bg-emerald-600",
    light: { primary: "160 84% 39%", ring: "160 84% 39%" },
    dark: { primary: "160 84% 45%", ring: "160 84% 45%" },
  },
  {
    id: "cyan",
    name: "Cyan",
    preview: "bg-cyan-600",
    light: { primary: "192 91% 36%", ring: "192 91% 36%" },
    dark: { primary: "192 91% 45%", ring: "192 91% 45%" },
  },
];

// Sidebar background color presets
const sidebarColors = [
  {
    id: "dark-blue",
    name: "Dark Blue",
    preview: "bg-[hsl(234,47%,12%)]",
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
    name: "Charcoal",
    preview: "bg-[hsl(220,20%,15%)]",
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
    name: "Slate",
    preview: "bg-slate-800",
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
    name: "Zinc",
    preview: "bg-zinc-800",
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
    name: "Stone",
    preview: "bg-stone-800",
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
    name: "Neutral",
    preview: "bg-neutral-800",
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

export default function Settings() {
  const [activeSection, setActiveSection] = useState("company");
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [compactMode, setCompactMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('compactMode') === 'true';
    }
    return false;
  });
  const [accentColor, setAccentColor] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accentColor') || 'blue';
    }
    return 'blue';
  });
  const [sidebarColor, setSidebarColor] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebarColor') || 'dark-blue';
    }
    return 'dark-blue';
  });

  useEffect(() => {
    setMounted(true);
    // Apply saved accent color on mount
    const savedColor = localStorage.getItem('accentColor') || 'blue';
    applyAccentColor(savedColor);
    // Apply saved sidebar color on mount
    const savedSidebarColor = localStorage.getItem('sidebarColor') || 'dark-blue';
    applySidebarColor(savedSidebarColor);
  }, []);

  useEffect(() => {
    localStorage.setItem('compactMode', compactMode.toString());
    if (compactMode) {
      document.documentElement.classList.add('compact-mode');
    } else {
      document.documentElement.classList.remove('compact-mode');
    }
  }, [compactMode]);

  // Re-apply colors when theme changes
  useEffect(() => {
    if (mounted) {
      applyAccentColor(accentColor);
      applySidebarColor(sidebarColor);
    }
  }, [resolvedTheme, mounted]);

  const applyAccentColor = (colorId: string) => {
    const colorConfig = themeColors.find(c => c.id === colorId);
    if (!colorConfig) return;

    const isDark = resolvedTheme === 'dark';
    const colors = isDark ? colorConfig.dark : colorConfig.light;

    document.documentElement.style.setProperty('--primary', colors.primary);
    document.documentElement.style.setProperty('--ring', colors.ring);
    document.documentElement.style.setProperty('--sidebar-primary', colors.primary);
    document.documentElement.style.setProperty('--sidebar-ring', colors.ring);
  };

  const applySidebarColor = (colorId: string) => {
    const colorConfig = sidebarColors.find(c => c.id === colorId);
    if (!colorConfig) return;

    const isDark = resolvedTheme === 'dark';
    const colors = isDark ? colorConfig.dark : colorConfig.light;

    document.documentElement.style.setProperty('--sidebar-background', colors.background);
    document.documentElement.style.setProperty('--sidebar-foreground', colors.foreground);
    document.documentElement.style.setProperty('--sidebar-accent', colors.accent);
    document.documentElement.style.setProperty('--sidebar-border', colors.border);
    document.documentElement.style.setProperty('--sidebar-muted', colors.muted);
  };

  const handleAccentColorChange = (colorId: string) => {
    setAccentColor(colorId);
    localStorage.setItem('accentColor', colorId);
    applyAccentColor(colorId);
  };

  const handleSidebarColorChange = (colorId: string) => {
    setSidebarColor(colorId);
    localStorage.setItem('sidebarColor', colorId);
    applySidebarColor(colorId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border border-border p-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                    activeSection === section.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeSection === "company" && (
            <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
              <h2 className="text-lg font-semibold mb-6">Company Settings</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" defaultValue="InvenFlow Industries" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gstin">GSTIN</Label>
                    <Input id="gstin" defaultValue="27AABCU9603R1ZM" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Business Address</Label>
                  <Input id="address" defaultValue="123 Industrial Area, Mumbai - 400001" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" defaultValue="+91 22 1234 5678" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="contact@invenflow.com" />
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <Button>Save Changes</Button>
                </div>
              </div>
            </div>
          )}

          {activeSection === "users" && (
            <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">User Management</h2>
                <Button size="sm">Add User</Button>
              </div>
              <div className="space-y-4">
                {[
                  { name: "Admin User", email: "admin@invenflow.com", role: "Administrator" },
                  { name: "John Doe", email: "john@invenflow.com", role: "Accountant" },
                  { name: "Jane Smith", email: "jane@invenflow.com", role: "Inventory Manager" },
                ].map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {user.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="chip chip-primary">{user.role}</span>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
              <h2 className="text-lg font-semibold mb-6">Notification Preferences</h2>
              <div className="space-y-6">
                {[
                  { label: "Low Stock Alerts", description: "Get notified when inventory falls below minimum level" },
                  { label: "Payment Reminders", description: "Receive reminders for pending vendor payments" },
                  { label: "Order Updates", description: "Updates on purchase order and GRN status" },
                  { label: "Daily Summary", description: "Daily email summary of transactions and activities" },
                  { label: "Weekly Reports", description: "Weekly financial and inventory reports" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch defaultChecked={index < 3} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "appearance" && (
            <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
              <h2 className="text-lg font-semibold mb-6">Appearance Settings</h2>
              <div className="space-y-6">
                <div>
                  <Label className="text-base">Theme</Label>
                  <p className="text-sm text-muted-foreground mb-3">Choose your preferred theme</p>
                  <div className="grid grid-cols-3 gap-4">
                    <button 
                      onClick={() => setTheme('light')}
                      className={cn(
                        "p-4 rounded-lg border-2 bg-card flex flex-col items-center gap-2 transition-colors",
                        mounted && theme === 'light' ? "border-primary" : "border-border hover:border-muted-foreground"
                      )}
                    >
                      <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center">
                        <Sun className="w-5 h-5 text-amber-600" />
                      </div>
                      <span className="text-sm font-medium">Light</span>
                    </button>
                    <button 
                      onClick={() => setTheme('dark')}
                      className={cn(
                        "p-4 rounded-lg border-2 bg-card flex flex-col items-center gap-2 transition-colors",
                        mounted && theme === 'dark' ? "border-primary" : "border-border hover:border-muted-foreground"
                      )}
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                        <Moon className="w-5 h-5 text-slate-300" />
                      </div>
                      <span className="text-sm font-medium">Dark</span>
                    </button>
                    <button 
                      onClick={() => setTheme('system')}
                      className={cn(
                        "p-4 rounded-lg border-2 bg-card flex flex-col items-center gap-2 transition-colors",
                        mounted && theme === 'system' ? "border-primary" : "border-border hover:border-muted-foreground"
                      )}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-slate-800 border border-border flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-foreground" />
                      </div>
                      <span className="text-sm font-medium">System</span>
                    </button>
                  </div>
                  {mounted && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Current theme: {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
                      {theme === 'system' && ' (following system preference)'}
                    </p>
                  )}
                </div>
                
                {/* Accent Color Selection */}
                <div className="pt-4 border-t border-border">
                  <Label className="text-base">Accent Color</Label>
                  <p className="text-sm text-muted-foreground mb-3">Choose your preferred accent color</p>
                  <div className="grid grid-cols-6 gap-3">
                    {themeColors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => handleAccentColorChange(color.id)}
                        className={cn(
                          "relative w-full aspect-square rounded-full transition-all",
                          color.preview,
                          accentColor === color.id 
                            ? "ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110" 
                            : "hover:scale-105"
                        )}
                        title={color.name}
                      >
                        {accentColor === color.id && (
                          <Check className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Current accent: {themeColors.find(c => c.id === accentColor)?.name}
                  </p>
                </div>

                {/* Sidebar Background Color Selection */}
                <div className="pt-4 border-t border-border">
                  <Label className="text-base flex items-center gap-2">
                    <PanelLeft className="w-4 h-4" />
                    Sidebar Background
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">Customize sidebar background color</p>
                  <div className="grid grid-cols-6 gap-3">
                    {sidebarColors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => handleSidebarColorChange(color.id)}
                        className={cn(
                          "relative w-full aspect-square rounded-lg transition-all border",
                          color.preview,
                          sidebarColor === color.id 
                            ? "ring-2 ring-offset-2 ring-offset-background ring-foreground scale-105" 
                            : "hover:scale-105 border-border"
                        )}
                        title={color.name}
                      >
                        {sidebarColor === color.id && (
                          <Check className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Current sidebar: {sidebarColors.find(c => c.id === sidebarColor)?.name}
                  </p>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Compact Mode</p>
                      <p className="text-sm text-muted-foreground">Use smaller spacing and fonts</p>
                    </div>
                    <Switch 
                      checked={compactMode} 
                      onCheckedChange={setCompactMode}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {(activeSection === "security" || activeSection === "data") && (
            <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
              <h2 className="text-lg font-semibold mb-4">
                {sections.find(s => s.id === activeSection)?.label}
              </h2>
              <p className="text-muted-foreground">
                This section is under development. Check back soon for updates.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
