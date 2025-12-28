import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useRoles, CrudOperation } from "@/hooks/useRoles";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PermissionGuardProps {
  children: ReactNode;
  permissionId?: string;
  operation?: CrudOperation;
  fallback?: "redirect" | "message" | "hide";
}

export function PermissionGuard({
  children,
  permissionId,
  operation = "view",
  fallback = "message",
}: PermissionGuardProps) {
  const { canAccessPath, hasPermission } = useRoles();
  const location = useLocation();

  const hasAccess = permissionId
    ? hasPermission(permissionId, operation)
    : canAccessPath(location.pathname);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback === "redirect") {
    return <Navigate to="/" replace />;
  }

  if (fallback === "hide") {
    return null;
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You don't have permission to {operation} this content. Please contact your administrator
            if you believe this is an error.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permissionId: string,
  operation: CrudOperation = "view"
) {
  return function WrappedComponent(props: P) {
    return (
      <PermissionGuard permissionId={permissionId} operation={operation}>
        <Component {...props} />
      </PermissionGuard>
    );
  };
}

// Hook for checking permissions in components
export function usePermissionCheck(permissionId: string) {
  const { hasPermission } = useRoles();
  
  return {
    canView: hasPermission(permissionId, "view"),
    canCreate: hasPermission(permissionId, "create"),
    canUpdate: hasPermission(permissionId, "update"),
    canDelete: hasPermission(permissionId, "delete"),
  };
}
