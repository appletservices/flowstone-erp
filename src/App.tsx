import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";

import { AuthProvider } from "@/hooks/useAuth";
import { RolesProvider } from "@/hooks/useRoles";
import { AppearanceProvider } from "@/hooks/useAppearance";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { PermissionGuard } from "@/components/layout/PermissionGuard";

import Dashboard from "@/pages/Dashboard";
import ChartOfAccounts from "@/pages/ChartOfAccounts";
import Inventory from "@/pages/Inventory";
import RawInventory from "@/pages/inventory/raw/RawInventory";
import DesignInventory from "@/pages/inventory/design/DesignInventory";
import KataeProduct from "@/pages/inventory/katae/KataeProduct";
import FinishInventory from "@/pages/inventory/finish/FinishedProduct";
import Vendors from "@/pages/vendors/Vendors";
import Purchase from "@/pages/purchase/Purchase";
import PurchaseOrderDetail from "@/pages/purchase/PurchaseOrderDetail";
import PurchaseOrderForm from "@/pages/purchase/PurchaseOrderForm";
import Sales from "@/pages/Sales";
import Settings from "@/pages/setting/Settings";
import Units from "@/pages/setup/Units";
import Machines from "@/pages/setup/Machines";
import ExpenseCategories from "@/pages/setup/ExpenseCategories";
import Receivable from "@/pages/Receiveables/Receivable";
import ContactVendors from "@/pages/vendors/Vendors";
import Others from "@/pages/Others";
import Ledger from "@/pages/Ledger";
import VLedger from "@/pages/vendors/VLedger";
import RcLedger from "@/pages/Receiveables/RcLedger";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import RoleManagement from "@/pages/setting/RoleManagement";
import Security from "@/pages/setting/Security";

import IssuedKatae from "@/pages/katae/IssuedKatae";
import KataeIssuedMaterial from "@/pages/katae/KataeIssuedMaterial";
import KataeReceive from "@/pages/katae/KataeReceive";
import KataeReceiveForm from "@/pages/katae/KataeReceiveForm";
import KataeReceiveLedger from "@/pages/katae/KataeReceiveLedger";
import PurchaseReturn from "@/pages/purchase/PurchaseReturn";
import PurchaseReturnForm from "@/pages/purchase/PurchaseReturnForm";
import PurchaseReturnDetail from "@/pages/purchase/PurchaseReturnDetail";

import PurchaseReport from "@/pages/reports/PurchaseReport";
import PaymentReport from "@/pages/reports/PaymentReport";
import AccountLedger from "@/pages/reports/AccountLedger";
import KataeIssueReport from "@/pages/KataeIssueReport";
import KataeReceiveReport from "@/pages/KataeReceiveReport";


import KarahiList from "@/pages/karahi/issue/KarahiList";
import KarahiIssueMaterial from "@/pages/karahi/issue/KarahiIssueMaterial";
import KarahiLedger from "@/pages/karahi/issue/KarahiLedger";
import KarahiMaterialOpening from "@/pages/karahi/issue/KarahiMaterialOpening";
import KarahiDesignReceive from "@/pages/karahi/receive/KarahiDesignReceive";
import KarahiDesignReceiveLedger from "@/pages/karahi/receive/KarahiDesignReceiveLedger";
import KarahiDesignReceiveForm from "@/pages/karahi/receive/KarahiDesignReceiveForm";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppearanceProvider>
      <BrowserRouter>
        <AuthProvider>
          <RolesProvider>
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
                  <Route path="/" element={<PermissionGuard permissionId="dashboard"><Dashboard /></PermissionGuard>} />
                  <Route path="/accounts" element={<PermissionGuard permissionId="accounts"><ChartOfAccounts /></PermissionGuard>} />
                  <Route path="/inventory" element={<PermissionGuard permissionId="inventory_overview"><Inventory /></PermissionGuard>} />
                  <Route path="/inventory/raw" element={<PermissionGuard permissionId="inventory_raw"><RawInventory /></PermissionGuard>} />
                  <Route path="/inventory/design" element={<PermissionGuard permissionId="inventory_design"><DesignInventory /></PermissionGuard>} />
                  <Route path="/inventory/finish" element={<PermissionGuard permissionId="inventory_finished"><FinishInventory /></PermissionGuard>} />
                  <Route path="/inventory/katae" element={<PermissionGuard permissionId="inventory_katae"><KataeProduct /></PermissionGuard>} />
                  {/* <Route path="/inventory/:category" element={<PermissionGuard permissionId="inventory_overview"><Inventory /></PermissionGuard>} /> */}
                  <Route path="/vendors" element={<Vendors />} />
                  <Route path="/inventory/purchase" element={<PermissionGuard permissionId="purchase"><Purchase /></PermissionGuard>} />
                  <Route path="/inventory/purchase/new" element={<PermissionGuard permissionId="purchase"><PurchaseOrderForm /></PermissionGuard>} />
                  <Route path="/inventory/purchase/:id/edit" element={<PermissionGuard permissionId="purchase"><PurchaseOrderForm /></PermissionGuard>} />
                  <Route path="/inventory/purchase/:id" element={<PermissionGuard permissionId="purchase"><PurchaseOrderDetail /></PermissionGuard>} />

                  <Route path="/purchase-return" element={<PermissionGuard permissionId="purchase_return"><PurchaseReturn /></PermissionGuard>} />
                  <Route path="/purchase-return/new" element={<PermissionGuard permissionId="purchase_return"><PurchaseReturnForm /></PermissionGuard>} />
                  <Route path="/purchase-return/:id/edit" element={<PermissionGuard permissionId="purchase_return"><PurchaseReturnForm /></PermissionGuard>} />
                  <Route path="/purchase-return/:id" element={<PermissionGuard permissionId="purchase_return"><PurchaseReturnDetail /></PermissionGuard>} />

                  <Route path="/sales" element={<PermissionGuard permissionId="sales"><Sales /></PermissionGuard>} />
                  <Route path="/settings" element={<PermissionGuard permissionId="settings"><Settings /></PermissionGuard>} />
                  <Route path="/settings/roles" element={<PermissionGuard permissionId="role_management"><RoleManagement /></PermissionGuard>} />
                  <Route path="/settings/security" element={<PermissionGuard permissionId="security"><Security /></PermissionGuard>} />
                  <Route path="/setup/units" element={<PermissionGuard permissionId="setup_units"><Units /></PermissionGuard>} />
                  <Route path="/setup/machines" element={<PermissionGuard permissionId="setup_machines"><Machines /></PermissionGuard>} />
                  <Route
                    path="/setup/expense-categories"
                    element={<PermissionGuard permissionId="setup_expense"><ExpenseCategories /></PermissionGuard>}
                  />
                  <Route path="/contact/receivable" element={<PermissionGuard permissionId="contact_receivable"><Receivable /></PermissionGuard>} />
                  <Route path="/contact/vendors" element={<PermissionGuard permissionId="contact_vendors"><ContactVendors /></PermissionGuard>} />
                  <Route path="/contact/others" element={<PermissionGuard permissionId="contact_others"><Others /></PermissionGuard>} />
                  <Route path="/ledger/inventory/:id" element={<Ledger />} />
                  <Route path="/contacts/ledger/vendor/:id" element={<VLedger />} />
                  <Route path="/contacts/ledger/receiveable/:id" element={<RcLedger />} />
                  <Route path="/katae/issued" element={<PermissionGuard permissionId="katae_issued"><IssuedKatae /></PermissionGuard>} />
                  <Route path="/katae/issued-material/:id" element={<KataeIssuedMaterial />} />
                  <Route path="/katae/receive" element={<PermissionGuard><KataeReceive /></PermissionGuard>} />
                  <Route path="/katae/receive/new" element={<PermissionGuard><KataeReceiveForm /></PermissionGuard>} />
                  <Route path="/katae/receive/edit/:id" element={<PermissionGuard><KataeReceiveForm /></PermissionGuard>} />
                  <Route path="/katae/receive-ledger/:id" element={<PermissionGuard><KataeReceiveLedger /></PermissionGuard>} />

                  <Route path="/karahi/list" element={<PermissionGuard><KarahiList /></PermissionGuard>}/>
                  <Route path="/karahi/issue-material" element={<PermissionGuard><KarahiIssueMaterial /></PermissionGuard>}/>                
                  <Route path="/karahi/issued-ledger/:v/:p" element={<PermissionGuard><KarahiLedger /></PermissionGuard>}/>
                  <Route path="/karahi/material-opening" element={<PermissionGuard permissionId="karahi_material_opening"><KarahiMaterialOpening /></PermissionGuard>}/>
                  <Route
                    path="/karahi/design-receive"
                    element={
                      <PermissionGuard>
                        <KarahiDesignReceive />
                      </PermissionGuard>
                    }
                  />
                  <Route
                    path="/karahi/design-receive/new"
                    element={
                      <PermissionGuard>
                        <KarahiDesignReceiveForm />
                      </PermissionGuard>
                    }
                  />
                  <Route
                    path="/karahi/design-receive/edit/:id"
                    element={
                      <PermissionGuard>
                        <KarahiDesignReceiveForm />
                      </PermissionGuard>
                    }
                  />
                  <Route
                    path="/karahi/design-receive-ledger/:id"
                    element={
                      <PermissionGuard>
                        <KarahiDesignReceiveLedger />
                      </PermissionGuard>
                    }
                  />

                  <Route path="/reports/purchase" element={<PermissionGuard permissionId="report_purchase"><PurchaseReport /></PermissionGuard>} />
                  <Route path="/reports/payment" element={<PermissionGuard permissionId="report_payment" ><PaymentReport /></PermissionGuard>} />
                  <Route path="/account/report" element={<PermissionGuard ><AccountLedger /></PermissionGuard>} />
                  <Route path="/reports/katae/issue" element={<PermissionGuard permissionId="report_katae_issue"><KataeIssueReport /></PermissionGuard>}/>
                  <Route path="/reports/katae/receive" element={<PermissionGuard permissionId="report_katae_receive"><KataeReceiveReport /></PermissionGuard>} />

                  

                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </RolesProvider>
        </AuthProvider>
      </BrowserRouter>
    </AppearanceProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
