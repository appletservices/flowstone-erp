import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "@/hooks/useAuth";
import { RolesProvider } from "@/hooks/useRoles";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { PermissionGuard } from "@/components/layout/PermissionGuard";

import Dashboard from "@/pages/Dashboard";
import ChartOfAccounts from "@/pages/ChartOfAccounts";
import Inventory from "@/pages/Inventory";
import RawInventory from "@/pages/RawInventory";
import Vendors from "@/pages/Vendors";
import Purchase from "@/pages/Purchase";
import Sales from "@/pages/Sales";
import Settings from "@/pages/Settings";
import Units from "@/pages/Units";
import Machines from "@/pages/Machines";
import ExpenseCategories from "@/pages/ExpenseCategories";
import Receivable from "@/pages/Receivable";
import ContactVendors from "@/pages/ContactVendors";
import Others from "@/pages/Others";
import Ledger from "@/pages/Ledger";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import RoleManagement from "@/pages/RoleManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <RolesProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />

            <Routes>
              {/* Public Route */}
              <Route path="/auth" element={<Auth />} />

<<<<<<< HEAD
              {/* Protected Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<PermissionGuard permissionId="dashboard"><Dashboard /></PermissionGuard>} />
                <Route path="/accounts" element={<PermissionGuard permissionId="accounts"><ChartOfAccounts /></PermissionGuard>} />
                <Route path="/inventory" element={<PermissionGuard permissionId="inventory_overview"><Inventory /></PermissionGuard>} />
                <Route path="/inventory/raw" element={<PermissionGuard permissionId="inventory_raw"><RawInventory /></PermissionGuard>} />
                <Route path="/inventory/:category" element={<PermissionGuard permissionId="inventory_overview"><Inventory /></PermissionGuard>} />
                <Route path="/vendors" element={<Vendors />} />
                <Route path="/purchase" element={<PermissionGuard permissionId="purchase"><Purchase /></PermissionGuard>} />
                <Route path="/sales" element={<PermissionGuard permissionId="sales"><Sales /></PermissionGuard>} />
                <Route path="/settings" element={<PermissionGuard permissionId="settings"><Settings /></PermissionGuard>} />
                <Route path="/settings/roles" element={<PermissionGuard permissionId="role_management"><RoleManagement /></PermissionGuard>} />
                <Route path="/setup/units" element={<PermissionGuard permissionId="setup_units"><Units /></PermissionGuard>} />
                <Route path="/setup/machines" element={<PermissionGuard permissionId="setup_machines"><Machines /></PermissionGuard>} />
                <Route
                  path="/setup/expense-categories"
                  element={<PermissionGuard permissionId="setup_expense"><ExpenseCategories /></PermissionGuard>}
                />
                <Route path="/contact/receivable" element={<PermissionGuard permissionId="contact_receivable"><Receivable /></PermissionGuard>} />
                <Route path="/contact/vendors" element={<PermissionGuard permissionId="contact_vendors"><ContactVendors /></PermissionGuard>} />
                <Route path="/contact/others" element={<PermissionGuard permissionId="contact_others"><Others /></PermissionGuard>} />
                <Route path="/ledger/:type/:id" element={<Ledger />} />
              </Route>
=======
            {/* Protected Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/accounts" element={<ChartOfAccounts />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/inventory/raw" element={<RawInventory />} />
              <Route path="/inventory/:category" element={<Inventory />} />
              <Route path="/vendors" element={<Vendors />} />
              <Route path="/purchase" element={<Purchase />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/setup/units" element={<Units />} />
              <Route path="/setup/machines" element={<Machines />} />
              <Route
                path="/setup/expense-categories"
                element={<ExpenseCategories />}
              />
              <Route path="/contact/receivable" element={<Receivable />} />
              <Route path="/contact/vendors" element={<ContactVendors />} />
              <Route path="/contact/others" element={<Others />} />
              <Route path="/ledger/:type/:id" element={<Ledger />} />
            </Route>
>>>>>>> 99ec63645dd930e46436551578f1b84422c085e7

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </RolesProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
