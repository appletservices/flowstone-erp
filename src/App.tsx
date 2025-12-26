import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";

import Dashboard from "@/pages/Dashboard";
import ChartOfAccounts from "@/pages/ChartOfAccounts";
import Inventory from "@/pages/Inventory";
import Vendors from "@/pages/Vendors";
import Purchase from "@/pages/Purchase";
import Sales from "@/pages/Sales";
import Settings from "@/pages/Settings";
import Units from "@/pages/Units";
import Machines from "@/pages/Machines";
import ExpenseCategories from "@/pages/ExpenseCategories";
import Customers from "@/pages/Customers";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <Routes>
            {/* Public Route */}
            <Route path="/auth" element={<Auth />} />

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
              <Route
                path="/receivable/customers"
                element={<Customers />}
              />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
