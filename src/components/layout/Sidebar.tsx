


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
  Wrench,
  Ruler,
  Cog,
  FolderOpen,
  Shield,
  Factory,
  Send,
  RotateCcw,
  FileBarChart,
  FileText,
  Flame,
  List,
  CreditCard,
<<<<<<< HEAD
  Wallet,
  FileCheck,
  Calendar,
=======
  Hammer,
  Layers3,
  ArrowDownToLine,
  FolderInput
>>>>>>> 0d401213c5f791d22868dca3d5b639975bfd602b
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRoles } from "@/hooks/useRoles";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MenuItem {
  label: string;
  icon: React.ElementType;
  path?: string;
  permissionId?: string;
  children?: { label: string; path: string; icon?: React.ElementType; permissionId?: string }[];
}

const menuItems: MenuItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/", permissionId: "dashboard" },
  { label: "Chart of Accounts", icon: BookOpen, path: "/accounts", permissionId: "accounts" },
  {
    label: "Contact",
    icon: Users,
    children: [
      { label: "Receivable", path: "/contact/receivable", icon: Users, permissionId: "contact_receivable" },
      { label: "Vendors", path: "/contact/vendors", icon: Truck, permissionId: "contact_vendors" },
      { label: "Others", path: "/contact/others", icon: Package, permissionId: "contact_others" },
    ],
  },
  {
    label: "Finance",
    icon: Wallet,
    children: [
      { label: "Payment Voucher", path: "/finance/payment-voucher", icon: CreditCard },
      { label: "Receipt Voucher", path: "/finance/receipt-voucher", icon: Receipt },
      { label: "VP Voucher", path: "/finance/vp-voucher", icon: FileCheck },
      { label: "Journal Voucher", path: "/finance/journal-voucher", icon: BookOpen },
      { label: "Post-Dated Check", path: "/finance/post-dated-check", icon: Calendar },
    ],
  },
  {
    label: "Inventory",
    icon: Package,
    children: [
      { label: "Overview", path: "/inventory", icon: Layers, permissionId: "inventory_overview" },
      { label: "Raw Inventory", path: "/inventory/raw", icon: Box, permissionId: "inventory_raw" },
      { label: "Design Inventory", path: "/inventory/design", icon: Palette, permissionId: "inventory_design" },
      { label: "Katae Product", path: "/inventory/katae", icon: Scissors, permissionId: "inventory_katae" },
      { label: "Finished Product", path: "/inventory/finish", icon: PackageCheck, permissionId: "inventory_finished" },
    ],
  },
  {
    label: "Production",
    icon: Hammer,
    children: [
      { label: "Collective", path: "/production/collective", icon: Layers3 },
      { label: "Issue", path: "/production/issue", icon: Send },
      { label: "Receive", path: "/production/receive", icon: ArrowDownToLine },
      { label: "Opening", path: "/production/opening", icon: FolderInput },
    ],
  },



  {
    label: "Katae",
    icon: Factory,
    children: [
      { label: "Issued", path: "/katae/issue/list", icon: Send, permissionId: "katae_issued" },
      { label: "Receive", path: "/katae/receive", icon: RotateCcw },
    ],
  },

  {
    label: "Karahi",
    icon: Flame,
    children: [
      { label: "Karahi List", path: "/karahi/list", icon: List, permissionId: "karahi_list" },
      { label: "Material Opening", path: "/karahi/material-opening", icon: Package, permissionId: "karahi_material_opening" },
      { label: "Design Receive", path: "/karahi/design-receive", icon: Palette },
    ],
  },

  {
    label: "Setup",
    icon: Wrench,
    children: [
      { label: "Units", path: "/setup/units", icon: Ruler, permissionId: "setup_units" },
      { label: "Machines", path: "/setup/machines", icon: Cog, permissionId: "setup_machines" },
      { label: "Expense Categories", path: "/setup/expense-categories", icon: FolderOpen, permissionId: "setup_expense" },
    ],
  },
  { label: "Purchase", icon: ShoppingCart, path: "/inventory/purchase", permissionId: "purchase" },
  { label: "Purchase Return", icon: RotateCcw, path: "/purchase-return", permissionId: "purchase_return" },
  {
    label: "Sales",
    icon: Receipt,
    children: [
      { label: "Sales", path: "/sales", icon: Receipt, permissionId: "sales" },
      { label: "Return Sales ", path: "/sales/return", icon: RotateCcw, permissionId: "sales" },

    ],
  },

  {
    label: "Reports",
    icon: FileBarChart,
    children: [
      { label: "Purchase Report", path: "/reports/purchase", icon: FileText, permissionId: "report_purchase" },
      { label: "Payment Report", path: "/reports/payment", icon: CreditCard, permissionId: "report_payment" },
      { label: "Account Report", path: "/account/report", icon: CreditCard },

      { label: "Katae Issue Report", path: "/reports/katae/issue", icon: Send, permissionId: "report_katae_issue" },
      { label: "Katae Receive Report", path: "/reports/katae/receive", icon: RotateCcw, permissionId: "report_katae_receive" },

      { label: "Karahi Issue Report", path: "/reports/karahi/issue", icon: Send, permissionId: "report_karahi_issue" },
      { label: "Karahi Receive Report", path: "/reports/karahi/receive", icon: RotateCcw, permissionId: "report_karahi_receive" },
      { label: "Karahi Design Receive Report", path: "/reports/karahi/receive-design", icon: RotateCcw, permissionId: "report_karahi_receive" },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    children: [
      { label: "General", path: "/settings", icon: Settings, permissionId: "settings" },
      { label: "Roles & Permissions", path: "/settings/roles", icon: Shield, permissionId: "role_management" },
      { label: "Security", path: "/settings/security", icon: Shield, permissionId: "security" },
    ],
  },
];
interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { hasPermission, currentRole } = useRoles();
  const [expandedItems, setExpandedItems] = useState<string[]>([
    "Inventory",
    "Contact",
    "Settings",
    "Katae",
    "Karahi",
    "Reports",
    "Production",
  ]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]));
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path;
  };

  const isParentActive = (children?: { path: string }[]) => {
    if (!children) return false;
    return children.some((child) => location.pathname === child.path);
  };

  // Filter menu items based on permissions (check view permission)
  const filterMenuItem = (item: MenuItem): MenuItem | null => {
    if (item.children) {
      const filteredChildren = item.children.filter((child) =>
        child.permissionId ? hasPermission(child.permissionId, "view") : true,
      );
      if (filteredChildren.length === 0) return null;
      return { ...item, children: filteredChildren };
    }
    if (item.permissionId && !hasPermission(item.permissionId, "view")) {
      return null;
    }
    return item;
  };

  const filteredMenuItems = menuItems.map(filterMenuItem).filter((item): item is MenuItem => item !== null);

  const roleLabels: { [key: string]: string } = {
    admin: "Admin",
    manager: "Manager",
    user: "User",
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "h-screen bg-sidebar flex flex-col border-r border-sidebar-border transition-all duration-300 relative",
          collapsed ? "w-16" : "w-64",
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-sidebar-border px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            {!collapsed && <span className="font-semibold text-sidebar-foreground text-lg">InvenFlow</span>}
          </div>
        </div>

        {/* Role Badge */}
        {!collapsed && (
          <div className="px-4 py-2 border-b border-sidebar-border">
            <Badge variant="secondary" className="w-full justify-center text-xs">
              <Shield className="w-3 h-3 mr-1" />
              {roleLabels[currentRole] || currentRole}
            </Badge>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto scrollbar-thin">
          <ul className="space-y-1">
            {filteredMenuItems.map((item) => (
              <li key={item.label}>
                {item.children ? (
                  <div>
                    {collapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => toggleExpand(item.label)}
                            className={cn(
                              "sidebar-item w-full justify-center",
                              isParentActive(item.children) && "sidebar-item-active",
                            )}
                          >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="flex flex-col gap-1 p-2">
                          <span className="font-medium">{item.label}</span>
                          <div className="flex flex-col gap-1 mt-1">
                            {item.children.map((child) => (
                              <Link
                                key={child.path}
                                to={child.path}
                                className={cn(
                                  "text-sm px-2 py-1 rounded hover:bg-accent hover:text-accent-foreground",
                                  isActive(child.path) && "bg-accent text-accent-foreground font-medium"
                                )}
                              >
                                {child.label}
                              </Link>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <>
                        <button
                          onClick={() => toggleExpand(item.label)}
                          className={cn(
                            "sidebar-item w-full justify-between",
                            isParentActive(item.children) && "sidebar-item-active",
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            <span>{item.label}</span>
                          </div>
                          {expandedItems.includes(item.label) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        {expandedItems.includes(item.label) && (
                          <ul className="mt-1 ml-4 space-y-1 animate-fade-in">
                            {item.children.map((child) => (
                              <li key={child.path}>
                                <Link
                                  to={child.path}
                                  className={cn("sidebar-item text-sm", isActive(child.path) && "sidebar-item-active")}
                                >
                                  {child.icon && <child.icon className="w-4 h-4" />}
                                  <span>{child.label}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  </div>
                ) : collapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link to={item.path!} className={cn("sidebar-item justify-center", isActive(item.path) && "sidebar-item-active")}>
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <span>{item.label}</span>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Link to={item.path!} className={cn("sidebar-item", isActive(item.path) && "sidebar-item-active")}>
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
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
          {!collapsed && <div className="text-xs text-sidebar-muted">© 2024 InvenFlow ERP</div>}
        </div>
      </aside>
    </TooltipProvider>
  );
}
