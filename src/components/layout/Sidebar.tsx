import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Package,
  Truck,
  ShoppingCart,
  Receipt,
  ChevronDown,
  ChevronRight,
  Settings,
  Building2,
  Layers,
  Box,
  Palette,
  Scissors,
  PackageCheck,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  label: string;
  icon: React.ElementType;
  path?: string;
  children?: { label: string; path: string; icon?: React.ElementType }[];
}

const menuItems: MenuItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Chart of Accounts", icon: BookOpen, path: "/accounts" },
  {
    label: "Contacts",
    icon: Users,
    children: [
      { label: "Customers", path: "/contacts/customers" },
      { label: "Vendors", path: "/contacts/vendors" },
    ],
  },
  {
    label: "Inventory",
    icon: Package,
    children: [
      { label: "Overview", path: "/inventory", icon: Layers },
      { label: "Raw Inventory", path: "/inventory/raw", icon: Box },
      { label: "Design Inventory", path: "/inventory/design", icon: Palette },
      { label: "Katae Product", path: "/inventory/katae", icon: Scissors },
      { label: "Finished Product", path: "/inventory/finished", icon: PackageCheck },
    ],
  },
  { label: "Vendors", icon: Truck, path: "/vendors" },
  { label: "Purchase", icon: ShoppingCart, path: "/purchase" },
  { label: "Sales", icon: Receipt, path: "/sales" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(["Inventory", "Contacts"]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path;
  };

  const isParentActive = (children?: { path: string }[]) => {
    if (!children) return false;
    return children.some((child) => location.pathname === child.path);
  };

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar flex flex-col border-r border-sidebar-border transition-all duration-300 relative",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-sidebar-border px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-sidebar-foreground text-lg">InvenFlow</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto scrollbar-thin">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.label}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className={cn(
                      "sidebar-item w-full justify-between",
                      isParentActive(item.children) && "sidebar-item-active"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </div>
                    {!collapsed && (
                      expandedItems.includes(item.label) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )
                    )}
                  </button>
                  {!collapsed && expandedItems.includes(item.label) && (
                    <ul className="mt-1 ml-4 space-y-1 animate-fade-in">
                      {item.children.map((child) => (
                        <li key={child.path}>
                          <Link
                            to={child.path}
                            className={cn(
                              "sidebar-item text-sm",
                              isActive(child.path) && "sidebar-item-active"
                            )}
                          >
                            {child.icon && <child.icon className="w-4 h-4" />}
                            <span>{child.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path!}
                  className={cn(
                    "sidebar-item",
                    isActive(item.path) && "sidebar-item-active"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center shadow-soft hover:shadow-medium transition-shadow"
      >
        <ChevronLeft className={cn("w-4 h-4 text-muted-foreground transition-transform", collapsed && "rotate-180")} />
      </button>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        {!collapsed && (
          <div className="text-xs text-sidebar-muted">
            © 2024 InvenFlow ERP
          </div>
        )}
      </div>
    </aside>
  );
}
