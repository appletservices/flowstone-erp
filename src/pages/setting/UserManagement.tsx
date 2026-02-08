import UserManagementSection from "@/components/settings/UserManagementSection";
import { Users } from "lucide-react";

export default function UserManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage users, roles, and permissions
          </p>
        </div>
        <Users className="h-8 w-8 text-primary" />
      </div>

      <UserManagementSection />
    </div>
  );
}
