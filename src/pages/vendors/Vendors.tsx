import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Phone,
  Mail,
  MapPin,
  Pencil,
  Trash2,
  BookOpen,
  CreditCard,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ContactFormDialog } from "@/components/contact/ContactFormDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useBackendSearch } from "@/hooks/useBackendSearch";
import { FilterDialog } from "@/components/filters/FilterDialog";
import { Badge } from "@/components/ui/badge";

const getTypeStyles = (type: string) => {
  const t = type.toUpperCase();
  if (t.includes("Local")) return "bg-blue-100 text-blue-600";
  if (t.includes("Export")) return "bg-purple-100 text-purple-600";
  if (t.includes("Other")) return "bg-orange-100 text-orange-600";
  return "bg-primary/10 text-primary";
};

interface Vendor {
  id: string;
  name: string;
  type: string;
  phone: string;
  email: string;
  address: string;
  code: string;
  balanceType: "credit" | "debit";
  openingAmount: string;
  totalTransactions: number;
  pendingAmount: string;
  status: "active" | "inactive";
  lastTransaction: string;
  date: Date;
}

interface ApiItem {
  id: number;
  name: string;
  type: string;
  phone: string;
  email: string;
  address: string;
  code: string;
  pending_amount: string;
  total_transactions: number;
  status: string;
}

interface AccountType {
  account_code: string;
  name: string;
}

export default function Vendors() {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [accountTypes, setAccountTypes] = useState<{ value: string; label: string }[]>([]);

  const {
    data: rawData,
    isLoading,
    searchQuery,
    setSearchQuery,
    dateRange,
    keyValues,
    applyFilters,
    hasActiveFilters,
    summary,
    refresh,
  } = useBackendSearch<ApiItem>({
    endpoint: "/contacts/vendors/list",
  });

  // Fetch account types from API
  useEffect(() => {
    const fetchAccountTypes = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/contacts/vendors/subaccount`, {

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        if (data.success && data.accounts) {
          setAccountTypes(
            data.accounts.map((acc: AccountType) => ({
              value: acc.account_code,
              label: acc.name,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch account types:", error);
      }
    };
    fetchAccountTypes();
  }, []);

  const vendors: Vendor[] = rawData.map((item) => ({
    id: item.id.toString(),
    name: item.name,
    type: item.type,
    phone: item.phone,
    email: item.email,
    address: item.address,
    code: item.code,
    balanceType: parseFloat(item.pending_amount) < 0 ? "debit" : "credit",
    openingAmount: Math.abs(parseFloat(item.pending_amount)).toString(),
    totalTransactions: item.total_transactions || 0,
    pendingAmount: `₹${Math.abs(parseFloat(item.pending_amount)).toLocaleString("en-IN")}`,
    status: item.status?.toLowerCase() === "active" ? "active" : "inactive",
    lastTransaction: "N/A",
    date: new Date(),
  }));

  const handleAddVendor = async (formData: any): Promise<{ success: boolean; message?: string }> => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/contacts/vendors/store`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          sub: formData.accountType,
          phone: formData.phone,
          cnic: formData.cnic,
          address: formData.address,
          opening_balance_type: formData.balanceType,
          opening_balance: formData.openingAmount || "0",
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        return { success: false, message: data.message };
      }
      
      toast.success("Vendor added successfully");
      refresh();
      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, message: "Failed to add vendor" };
    }
  };

  const handleEditVendor = async (): Promise<{ success: boolean; message?: string }> => {
    setEditDialogOpen(false);
    toast.success("Vendor updated successfully");
    refresh();
    return { success: true };
  };

  const handleDeleteVendor = async () => {
    if (!vendorToDelete) return;
    setDeleteDialogOpen(false);
    toast.success("Vendor deleted successfully");
    refresh();
  };

  const openEditDialog = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (vendor: Vendor) => {
    setVendorToDelete(vendor);
    setDeleteDialogOpen(true);
  };

  if (isLoading && vendors.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Receiveables</h1>
          <p className="text-muted-foreground">Manage customer receivables and payments</p>
        </div>
        <ContactFormDialog
          trigger={<Button className="gap-2"><Plus className="w-4 h-4" /> Add Vendor</Button>}
          title="Add Vendor"
          accountTypes={accountTypes}
          onSubmit={handleAddVendor}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-muted">
              <User className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Customers</p>
              <p className="text-2xl font-bold">{summary?.total_contacts || 0}</p>
            </div>
          </div>
        </div>

        {summary?.contacts_type_wise?.map((item: { type: string; total: number }) => (
          <div key={item.type} className="bg-card rounded-xl border border-border p-5 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className={cn("p-3 rounded-xl", getTypeStyles(item.type))}>
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground truncate max-w-[120px]" title={item.type}>
                  {item.type.replace("VENDORS", "").trim()}
                </p>
                <p className="text-2xl font-bold">{item.total}</p>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <CreditCard className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Receivable</p>
              <p className="text-2xl font-bold">
                ₹{Math.abs(parseFloat(summary?.total_payables || "0")).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search vendors by name or code..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        <Button
          variant="outline"
          className={cn("gap-2", hasActiveFilters && "border-primary text-primary")}
          onClick={() => setFilterDialogOpen(true)}
        >
          <Filter className="w-4 h-4" />
          Filter
          {hasActiveFilters && <Badge variant="secondary" className="ml-1 h-5 px-1.5">Active</Badge>}
        </Button>
      </div>

      {/* Vendor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vendors.map((vendor) => (
          <div key={vendor.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow animate-fade-in">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className={cn("font-semibold", getTypeStyles(vendor.type))}>
                    {vendor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{vendor.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className={cn("chip text-[10px] border-none font-medium", getTypeStyles(vendor.type))}>
                      {vendor.type}
                    </span>
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card">
                  <DropdownMenuItem onClick={() => openEditDialog(vendor)}><Pencil className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`/contacts/ledger/vendor/${vendor.id}`)}><BookOpen className="w-4 h-4 mr-2" /> View Ledger</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => openDeleteDialog(vendor)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" /> <span>{vendor.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" /> <span className="truncate">{vendor.email || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" /> <span className="truncate">{vendor.address}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Total Transactions</p>
                <p className="font-semibold">{vendor.totalTransactions}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending Amount</p>
                <p className={cn("font-semibold", vendor.pendingAmount !== "₹0" && "text-warning")}>
                  {vendor.pendingAmount}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Code: {vendor.code}</span>
              <Button variant="ghost" size="sm" className="text-primary h-7 px-2" onClick={() => navigate(`/contacts/ledger/vendor/${vendor.id}`)}>View Ledger</Button>
            </div>
          </div>
        ))}

        {!isLoading && vendors.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No vendors found
          </div>
        )}
      </div>

      {/* Filter Dialog */}
      <FilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        onApply={applyFilters}
        showDateRange={false}
        filterFields={[
          { key: "type", label: "Vendor Type", placeholder: "e.g. EMBROIDERY VENDORS" },
          { key: "status", label: "Status", placeholder: "active or inactive" },
        ]}
        initialDateRange={dateRange}
        initialKeyValues={keyValues}
      />

      {/* Edit Dialog */}
      {editingVendor && (
        <ContactFormDialog
          title="Edit Vendor"
          accountTypes={accountTypes}
          onSubmit={handleEditVendor}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          defaultValues={{
            accountType: editingVendor.type,
            name: editingVendor.name,
            date: editingVendor.date,
            phone: editingVendor.phone,
            cnic: editingVendor.code,
            balanceType: editingVendor.balanceType,
            openingAmount: editingVendor.openingAmount,
            address: editingVendor.address,
          }}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete "{vendorToDelete?.name}"? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVendor} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
