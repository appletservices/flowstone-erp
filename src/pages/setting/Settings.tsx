import { useState } from "react";
import {
  Settings as SettingsIcon,
  Building2,
  Users,
  Shield,
  Database,
  Bell,
  Palette,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

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

export default function Settings() {
  const [activeSection, setActiveSection] = useState("company");

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
                    <button className="p-4 rounded-lg border-2 border-primary bg-card flex flex-col items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-background border border-border" />
                      <span className="text-sm font-medium">Light</span>
                    </button>
                    <button className="p-4 rounded-lg border border-border bg-card flex flex-col items-center gap-2 hover:border-muted-foreground transition-colors">
                      <div className="w-8 h-8 rounded-full bg-foreground" />
                      <span className="text-sm font-medium">Dark</span>
                    </button>
                    <button className="p-4 rounded-lg border border-border bg-card flex flex-col items-center gap-2 hover:border-muted-foreground transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-background to-foreground" />
                      <span className="text-sm font-medium">System</span>
                    </button>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Compact Mode</p>
                      <p className="text-sm text-muted-foreground">Use smaller spacing and fonts</p>
                    </div>
                    <Switch />
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
