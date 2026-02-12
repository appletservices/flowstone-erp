import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield,
  Users,
  UserCheck,
  Save,
  RotateCcw,
  Eye,
  Plus,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

type CrudOperation = "view" | "create" | "update" | "delete";

interface ApiPermission {
  id: number;
  name: string;
  category: string;
  pivot: { role_id: number; permission_id: number };
}

interface ApiRole {
  id: number;
  name: string;
  guard_name: string;
  permissions_by_category: Record<string, ApiPermission[]>;
  permissions: ApiPermission[];
}

interface ModulePerms {
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

// Extract unique modules from a category's permissions
function extractModules(permissions: ApiPermission[]): string[] {
  const modules = new Set<string>();
  permissions.forEach((p) => {
    const [moduleId] = p.name.split(".");
    modules.add(moduleId);
  });
  return Array.from(modules);
}

// Build permission state from API role data
function buildPermissionState(role: ApiRole): Record<string, ModulePerms> {
  const state: Record<string, ModulePerms> = {};
  const assignedNames = new Set(role.permissions.map((p) => p.name));

  // Get all modules from permissions_by_category
  Object.values(role.permissions_by_category).forEach((perms) => {
    const modules = extractModules(perms);
    modules.forEach((moduleId) => {
      state[moduleId] = {
        view: assignedNames.has(`${moduleId}.view`),
        create: assignedNames.has(`${moduleId}.create`),
        update: assignedNames.has(`${moduleId}.update`),
        delete: assignedNames.has(`${moduleId}.delete`),
      };
    });
  });

  return state;
}

// Build a master list of all categories and their modules from ALL roles
function buildCategoryModules(roles: ApiRole[]): Record<string, string[]> {
  const categories: Record<string, Set<string>> = {};

  roles.forEach((role) => {
    Object.entries(role.permissions_by_category).forEach(([category, perms]) => {
      if (!categories[category]) categories[category] = new Set();
      perms.forEach((p) => {
        const [moduleId] = p.name.split(".");
        categories[category].add(moduleId);
      });
    });
  });

  const result: Record<string, string[]> = {};
  Object.entries(categories).forEach(([cat, modules]) => {
    result[cat] = Array.from(modules);
  });
  return result;
}

// Build permission ID lookup: "moduleId.action" -> permission_id
function buildPermissionIdMap(roles: ApiRole[]): Record<string, number> {
  const map: Record<string, number> = {};
  roles.forEach((role) => {
    role.permissions.forEach((p) => {
      map[p.name] = p.id;
    });
  });
  return map;
}

function humanizeModule(moduleId: string): string {
  return moduleId
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const ROLE_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  admin: { icon: Shield, color: "text-red-500" },
  manager: { icon: UserCheck, color: "text-amber-500" },
  user: { icon: Users, color: "text-blue-500" },
};

const CRUD_OPERATIONS: { key: CrudOperation; label: string; icon: React.ElementType }[] = [
  { key: "view", label: "View", icon: Eye },
  { key: "create", label: "Create", icon: Plus },
  { key: "update", label: "Update", icon: Pencil },
  { key: "delete", label: "Delete", icon: Trash2 },
];

export default function RoleManagement() {
  const { toast } = useToast();
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [editedPermissions, setEditedPermissions] = useState<Record<string, ModulePerms>>({});
  const [originalPermissions, setOriginalPermissions] = useState<Record<string, ModulePerms>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const categoryModules = buildCategoryModules(roles);
  const permissionIdMap = buildPermissionIdMap(roles);

  // Fetch roles from API
  useEffect(() => {
    const fetchRoles = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(`${API_URL}/permissions`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok && Array.isArray(data)) {
          setRoles(data);
          if (data.length > 0) {
            setSelectedRoleId(data[0].id);
            const perms = buildPermissionState(data[0]);
            setEditedPermissions(perms);
            setOriginalPermissions(perms);
          }
        }
      } catch (error) {
        console.error("Failed to fetch permissions:", error);
        toast({ title: "Error", description: "Failed to load permissions", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  const handleRoleChange = (roleId: string) => {
    const id = Number(roleId);
    setSelectedRoleId(id);
    const role = roles.find((r) => r.id === id);
    if (role) {
      const perms = buildPermissionState(role);
      setEditedPermissions(perms);
      setOriginalPermissions(perms);
      setHasChanges(false);
    }
  };

  const togglePermission = (moduleId: string, operation: CrudOperation) => {
    setEditedPermissions((prev) => {
      const current = prev[moduleId] || { view: false, create: false, update: false, delete: false };
      const updated = { ...current, [operation]: !current[operation] };

      if (operation === "view" && !updated.view) {
        updated.create = false;
        updated.update = false;
        updated.delete = false;
      }
      if (operation !== "view" && updated[operation]) {
        updated.view = true;
      }

      setHasChanges(true);
      return { ...prev, [moduleId]: updated };
    });
  };

  const toggleAllInCategory = (category: string, operation: CrudOperation) => {
    const modules = categoryModules[category] || [];
    const allEnabled = modules.every((m) => editedPermissions[m]?.[operation]);

    setEditedPermissions((prev) => {
      const updated = { ...prev };
      modules.forEach((moduleId) => {
        const current = updated[moduleId] || { view: false, create: false, update: false, delete: false };
        if (operation === "view") {
          updated[moduleId] = allEnabled
            ? { view: false, create: false, update: false, delete: false }
            : { ...current, view: true };
        } else {
          updated[moduleId] = {
            ...current,
            [operation]: !allEnabled,
            view: !allEnabled ? true : current.view,
          };
        }
      });
      setHasChanges(true);
      return updated;
    });
  };

  const selectAllForModule = (moduleId: string) => {
    setEditedPermissions((prev) => {
      const current = prev[moduleId] || { view: false, create: false, update: false, delete: false };
      const allEnabled = current.view && current.create && current.update && current.delete;
      setHasChanges(true);
      return {
        ...prev,
        [moduleId]: allEnabled
          ? { view: false, create: false, update: false, delete: false }
          : { view: true, create: true, update: true, delete: true },
      };
    });
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    setIsSaving(true);

    // Build permission_ids array from edited state
    const permissionIds: number[] = [];
    Object.entries(editedPermissions).forEach(([moduleId, perms]) => {
      (["view", "create", "update", "delete"] as CrudOperation[]).forEach((op) => {
        if (perms[op]) {
          const key = `${moduleId}.${op}`;
          if (permissionIdMap[key]) {
            permissionIds.push(permissionIdMap[key]);
          }
        }
      });
    });

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}/permissions/${selectedRole.id}/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ permission_ids: permissionIds }),
      });

      if (response.ok) {
        setOriginalPermissions({ ...editedPermissions });
        setHasChanges(false);
        toast({ title: "Permissions Saved", description: `${selectedRole.name} permissions updated successfully.` });
        // Refresh roles data
        const refreshRes = await fetch(`${API_URL}/permissions`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        const refreshData = await refreshRes.json();
        if (refreshRes.ok && Array.isArray(refreshData)) {
          setRoles(refreshData);
        }
      } else {
        toast({ title: "Error", description: "Failed to save permissions", variant: "destructive" });
      }
    } catch (error) {
      console.error("Save error:", error);
      toast({ title: "Error", description: "Failed to save permissions", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setEditedPermissions({ ...originalPermissions });
    setHasChanges(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Role & Permissions Management</h1>
          <p className="text-muted-foreground">Loading permissions...</p>
        </div>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Role & Permissions Management</h1>
        <p className="text-muted-foreground">
          Configure CRUD permissions for each role in your organization
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs
            value={selectedRoleId?.toString() || ""}
            onValueChange={handleRoleChange}
          >
            <TabsList className={`grid w-full mb-6`} style={{ gridTemplateColumns: `repeat(${roles.length}, 1fr)` }}>
              {roles.map((role) => {
                const iconInfo = ROLE_ICONS[role.name] || { icon: Users, color: "text-muted-foreground" };
                const Icon = iconInfo.icon;
                return (
                  <TabsTrigger key={role.id} value={role.id.toString()} className="gap-2 capitalize">
                    <Icon className="h-4 w-4" />
                    {role.name}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {roles.map((role) => (
              <TabsContent key={role.id} value={role.id.toString()} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold capitalize">{role.name} Permissions</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage what {role.name} role can access
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleReset} disabled={!hasChanges}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={!hasChanges || isSaving}>
                      {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Save Changes
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  {Object.entries(categoryModules).map(([category, modules]) => (
                    <Card key={category}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base capitalize">{category}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[200px]">Module</TableHead>
                              {CRUD_OPERATIONS.map(({ key, label, icon: Icon }) => (
                                <TableHead key={key} className="text-center w-[100px]">
                                  <div className="flex flex-col items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-auto p-1 hover:bg-muted"
                                      onClick={() => toggleAllInCategory(category, key)}
                                      title={`Toggle all ${label}`}
                                    >
                                      <Icon className="h-4 w-4" />
                                    </Button>
                                    <span className="text-xs">{label}</span>
                                  </div>
                                </TableHead>
                              ))}
                              <TableHead className="text-center w-[80px]">All</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {modules.map((moduleId) => {
                              const perms = editedPermissions[moduleId] || {
                                view: false, create: false, update: false, delete: false,
                              };
                              const allEnabled = perms.view && perms.create && perms.update && perms.delete;

                              return (
                                <TableRow key={moduleId}>
                                  <TableCell className="font-medium">{humanizeModule(moduleId)}</TableCell>
                                  {CRUD_OPERATIONS.map(({ key }) => (
                                    <TableCell key={key} className="text-center">
                                      <Checkbox
                                        checked={perms[key]}
                                        onCheckedChange={() => togglePermission(moduleId, key)}
                                        disabled={key !== "view" && !perms.view}
                                      />
                                    </TableCell>
                                  ))}
                                  <TableCell className="text-center">
                                    <Checkbox
                                      checked={allEnabled}
                                      onCheckedChange={() => selectAllForModule(moduleId)}
                                    />
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
