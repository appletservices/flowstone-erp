import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./useAuth";

export type Role = "admin" | "manager" | "user";
export type CrudOperation = "view" | "create" | "update" | "delete";

export interface Module {
  id: string;
  label: string;
  path: string;
  category?: string;
}

export interface ModulePermissions {
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export interface RolePermissions {
  [role: string]: {
    [moduleId: string]: ModulePermissions;
  };
}

// All available modules
export const ALL_MODULES: Module[] = [
  { id: "dashboard", label: "Dashboard", path: "/", category: "Main" },
  { id: "accounts", label: "Chart of Accounts", path: "/accounts", category: "Finance" },
  { id: "contact_receivable", label: "Receivable", path: "/contact/receivable", category: "Contact" },
  { id: "contact_vendors", label: "Vendors", path: "/contact/vendors", category: "Contact" },
  { id: "contact_others", label: "Others", path: "/contact/others", category: "Contact" },
  { id: "inventory_overview", label: "Inventory Overview", path: "/inventory", category: "Inventory" },
  { id: "inventory_raw", label: "Raw Inventory", path: "/inventory/raw", category: "Inventory" },
  { id: "inventory_design", label: "Design Inventory", path: "/inventory/design", category: "Inventory" },
  { id: "inventory_katae", label: "Katae Product", path: "/inventory/katae", category: "Inventory" },
  { id: "inventory_finished", label: "Finished Product", path: "/inventory/finished", category: "Inventory" },
  { id: "setup_units", label: "Units", path: "/setup/units", category: "Setup" },
  { id: "setup_machines", label: "Machines", path: "/setup/machines", category: "Setup" },
  { id: "setup_expense", label: "Expense Categories", path: "/setup/expense-categories", category: "Setup" },
  { id: "purchase", label: "Purchase", path: "/purchase", category: "Operations" },
  { id: "sales", label: "Sales", path: "/sales", category: "Operations" },
  { id: "settings", label: "Settings", path: "/settings", category: "Admin" },
  { id: "role_management", label: "Role Management", path: "/settings/roles", category: "Admin" },
];

// Helper to create full permissions
const fullPermissions = (): ModulePermissions => ({
  view: true,
  create: true,
  update: true,
  delete: true,
});

// Helper to create view-only permissions
const viewOnly = (): ModulePermissions => ({
  view: true,
  create: false,
  update: false,
  delete: false,
});

// Helper to create no permissions
const noPermissions = (): ModulePermissions => ({
  view: false,
  create: false,
  update: false,
  delete: false,
});

// Default permissions for each role
const DEFAULT_ROLE_PERMISSIONS: RolePermissions = {
  admin: ALL_MODULES.reduce((acc, module) => {
    acc[module.id] = fullPermissions();
    return acc;
  }, {} as { [moduleId: string]: ModulePermissions }),
  
  manager: {
    dashboard: fullPermissions(),
    accounts: fullPermissions(),
    contact_receivable: fullPermissions(),
    contact_vendors: fullPermissions(),
    contact_others: fullPermissions(),
    inventory_overview: fullPermissions(),
    inventory_raw: fullPermissions(),
    inventory_design: fullPermissions(),
    inventory_katae: fullPermissions(),
    inventory_finished: fullPermissions(),
    setup_units: { view: true, create: true, update: true, delete: false },
    setup_machines: { view: true, create: true, update: true, delete: false },
    setup_expense: { view: true, create: true, update: true, delete: false },
    purchase: fullPermissions(),
    sales: fullPermissions(),
    settings: viewOnly(),
    role_management: noPermissions(),
  },
  
  user: {
    dashboard: viewOnly(),
    accounts: noPermissions(),
    contact_receivable: viewOnly(),
    contact_vendors: viewOnly(),
    contact_others: viewOnly(),
    inventory_overview: viewOnly(),
    inventory_raw: { view: true, create: true, update: false, delete: false },
    inventory_design: { view: true, create: true, update: false, delete: false },
    inventory_katae: { view: true, create: true, update: false, delete: false },
    inventory_finished: { view: true, create: true, update: false, delete: false },
    setup_units: noPermissions(),
    setup_machines: noPermissions(),
    setup_expense: noPermissions(),
    purchase: { view: true, create: true, update: false, delete: false },
    sales: { view: true, create: true, update: false, delete: false },
    settings: noPermissions(),
    role_management: noPermissions(),
  },
};

interface RolesContextType {
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  rolePermissions: RolePermissions;
  updateRolePermissions: (role: Role, permissions: { [moduleId: string]: ModulePermissions }) => void;
  hasPermission: (moduleId: string, operation?: CrudOperation) => boolean;
  canAccessPath: (path: string) => boolean;
  getAllowedPaths: () => string[];
  getModulePermissions: (moduleId: string) => ModulePermissions;
}

const RolesContext = createContext<RolesContextType | null>(null);

const STORAGE_KEY = "role_permissions_v2";
const USER_ROLE_KEY = "user_role";

export function RolesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  const [currentRole, setCurrentRole] = useState<Role>(() => {
    const stored = localStorage.getItem(USER_ROLE_KEY);
    return (stored as Role) || "admin";
  });

  const [rolePermissions, setRolePermissions] = useState<RolePermissions>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_ROLE_PERMISSIONS;
      }
    }
    return DEFAULT_ROLE_PERMISSIONS;
  });

  // Persist role permissions
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rolePermissions));
  }, [rolePermissions]);

  // Persist current role
  useEffect(() => {
    localStorage.setItem(USER_ROLE_KEY, currentRole);
  }, [currentRole]);

  // Sync role from user data if available
  useEffect(() => {
    if (user?.role) {
      const roleMap: { [key: string]: Role } = {
        Administrator: "admin",
        Manager: "manager",
        User: "user",
      };
      const mappedRole = roleMap[user.role] || "user";
      setCurrentRole(mappedRole);
    }
  }, [user]);

  const updateRolePermissions = (role: Role, permissions: { [moduleId: string]: ModulePermissions }) => {
    setRolePermissions((prev) => ({
      ...prev,
      [role]: permissions,
    }));
  };

  const getModulePermissions = (moduleId: string): ModulePermissions => {
    const permissions = rolePermissions[currentRole]?.[moduleId];
    return permissions || noPermissions();
  };

  const hasPermission = (moduleId: string, operation: CrudOperation = "view"): boolean => {
    const permissions = getModulePermissions(moduleId);
    return permissions[operation];
  };

  const canAccessPath = (path: string): boolean => {
    const module = ALL_MODULES.find((m) => m.path === path);
    if (!module) return true; // Allow access to undefined paths
    return hasPermission(module.id, "view");
  };

  const getAllowedPaths = (): string[] => {
    const permissions = rolePermissions[currentRole] || {};
    return ALL_MODULES
      .filter((m) => permissions[m.id]?.view)
      .map((m) => m.path);
  };

  return (
    <RolesContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        rolePermissions,
        updateRolePermissions,
        hasPermission,
        canAccessPath,
        getAllowedPaths,
        getModulePermissions,
      }}
    >
      {children}
    </RolesContext.Provider>
  );
}

export function useRoles() {
  const ctx = useContext(RolesContext);
  if (!ctx) throw new Error("useRoles must be used inside RolesProvider");
  return ctx;
}
