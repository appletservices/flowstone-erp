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
import { Badge } from "@/components/ui/badge";
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
import {
  useRoles,
  ALL_MODULES,
  Role,
  Module,
  ModulePermissions,
  CrudOperation,
} from "@/hooks/useRoles";
import {
  Shield,
  Users,
  UserCheck,
  Save,
  RotateCcw,
  Check,
  Eye,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

const ROLE_INFO: { role: Role; label: string; description: string; icon: React.ElementType; color: string }[] = [
  {
    role: "admin",
    label: "Administrator",
    description: "Full access to all features and settings",
    icon: Shield,
    color: "text-red-500",
  },
  {
    role: "manager",
    label: "Manager",
    description: "Access to operations and reports",
    icon: UserCheck,
    color: "text-amber-500",
  },
  {
    role: "user",
    label: "User",
    description: "Basic access to daily operations",
    icon: Users,
    color: "text-blue-500",
  },
];

const CRUD_OPERATIONS: { key: CrudOperation; label: string; icon: React.ElementType }[] = [
  { key: "view", label: "View", icon: Eye },
  { key: "create", label: "Create", icon: Plus },
  { key: "update", label: "Update", icon: Pencil },
  { key: "delete", label: "Delete", icon: Trash2 },
];

// Group modules by category
function groupByCategory(modules: Module[]) {
  return modules.reduce((acc, module) => {
    const category = module.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(module);
    return acc;
  }, {} as { [key: string]: Module[] });
}

export default function RoleManagement() {
  const { rolePermissions, updateRolePermissions, currentRole, setCurrentRole } = useRoles();
  const { toast } = useToast();
  
  const [selectedRole, setSelectedRole] = useState<Role>("admin");
  const [editedPermissions, setEditedPermissions] = useState<{ [moduleId: string]: ModulePermissions }>(
    rolePermissions[selectedRole] || {}
  );
  const [hasChanges, setHasChanges] = useState(false);

  const groupedModules = groupByCategory(ALL_MODULES);

  useEffect(() => {
    setEditedPermissions(rolePermissions[selectedRole] || {});
    setHasChanges(false);
  }, [selectedRole, rolePermissions]);

  const handleRoleChange = (role: Role) => {
    setSelectedRole(role);
  };

  const togglePermission = (moduleId: string, operation: CrudOperation) => {
    setEditedPermissions((prev) => {
      const current = prev[moduleId] || { view: false, create: false, update: false, delete: false };
      const updated = { ...current, [operation]: !current[operation] };
      
      // If disabling view, disable all other permissions
      if (operation === "view" && !updated.view) {
        updated.create = false;
        updated.update = false;
        updated.delete = false;
      }
      
      // If enabling any other permission, also enable view
      if (operation !== "view" && updated[operation]) {
        updated.view = true;
      }
      
      setHasChanges(true);
      return { ...prev, [moduleId]: updated };
    });
  };

  const toggleAllInCategory = (category: string, operation: CrudOperation) => {
    const categoryModules = groupedModules[category];
    const allEnabled = categoryModules.every((m) => editedPermissions[m.id]?.[operation]);
    
    setEditedPermissions((prev) => {
      const updated = { ...prev };
      categoryModules.forEach((module) => {
        const current = updated[module.id] || { view: false, create: false, update: false, delete: false };
        
        if (operation === "view") {
          updated[module.id] = allEnabled
            ? { view: false, create: false, update: false, delete: false }
            : { ...current, view: true };
        } else {
          updated[module.id] = {
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

  const handleSave = () => {
    updateRolePermissions(selectedRole, editedPermissions);
    setHasChanges(false);
    toast({
      title: "Permissions Saved",
      description: `${ROLE_INFO.find((r) => r.role === selectedRole)?.label} permissions updated successfully.`,
    });
  };

  const handleReset = () => {
    setEditedPermissions(rolePermissions[selectedRole] || {});
    setHasChanges(false);
  };

  const switchToRole = (role: Role) => {
    setCurrentRole(role);
    toast({
      title: "Role Switched",
      description: `You are now viewing as ${ROLE_INFO.find((r) => r.role === role)?.label}.`,
    });
  };

  const countPermissions = (role: Role) => {
    const perms = rolePermissions[role] || {};
    let total = 0;
    Object.values(perms).forEach((p) => {
      if (p.view) total++;
      if (p.create) total++;
      if (p.update) total++;
      if (p.delete) total++;
    });
    return total;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Role & Permissions Management</h1>
        <p className="text-muted-foreground">
          Configure CRUD permissions for each role in your organization
        </p>
      </div>

      {/* Current Role Indicator */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Current Active Role</CardTitle>
          <CardDescription>
            Switch roles to test how different users see the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {ROLE_INFO.map(({ role, label, icon: Icon, color }) => (
              <Button
                key={role}
                variant={currentRole === role ? "default" : "outline"}
                size="sm"
                onClick={() => switchToRole(role)}
                className="gap-2"
              >
                <Icon className={`h-4 w-4 ${currentRole !== role ? color : ""}`} />
                {label}
                {currentRole === role && <Check className="h-3 w-3 ml-1" />}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Tabs */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={selectedRole} onValueChange={(v) => handleRoleChange(v as Role)}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              {ROLE_INFO.map(({ role, label, icon: Icon }) => (
                <TabsTrigger key={role} value={role} className="gap-2">
                  <Icon className="h-4 w-4" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            {ROLE_INFO.map(({ role, label, description }) => (
              <TabsContent key={role} value={role} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{label} Permissions</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      disabled={!hasChanges}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={!hasChanges}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>

                {/* Permission Tables by Category */}
                <div className="space-y-6">
                  {Object.entries(groupedModules).map(([category, modules]) => (
                    <Card key={category}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{category}</CardTitle>
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
                            {modules.map((module) => {
                              const perms = editedPermissions[module.id] || {
                                view: false,
                                create: false,
                                update: false,
                                delete: false,
                              };
                              const allEnabled = perms.view && perms.create && perms.update && perms.delete;
                              
                              return (
                                <TableRow key={module.id}>
                                  <TableCell className="font-medium">{module.label}</TableCell>
                                  {CRUD_OPERATIONS.map(({ key }) => (
                                    <TableCell key={key} className="text-center">
                                      <Checkbox
                                        checked={perms[key]}
                                        onCheckedChange={() => togglePermission(module.id, key)}
                                        disabled={key !== "view" && !perms.view}
                                      />
                                    </TableCell>
                                  ))}
                                  <TableCell className="text-center">
                                    <Checkbox
                                      checked={allEnabled}
                                      onCheckedChange={() => selectAllForModule(module.id)}
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

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Permission Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {ROLE_INFO.map(({ role, label, icon: Icon, color }) => (
              <div key={role} className="flex items-start gap-3 p-4 rounded-lg border">
                <Icon className={`h-5 w-5 mt-0.5 ${color}`} />
                <div>
                  <p className="font-medium">{label}</p>
                  <p className="text-sm text-muted-foreground">
                    {countPermissions(role)} total permissions
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
