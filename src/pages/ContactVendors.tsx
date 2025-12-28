import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Phone,
  Mail,
  MapPin,
  IndianRupee,
  Pencil,
  Trash2,
  BookOpen,
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

interface Vendor {
  id: string;
  name: string;
  type: "karahi" | "katae";
  phone: string;
  email: string;
  address: string;
  cnic: string;
  balanceType: "credit" | "debit";
  openingAmount: string;
  totalTransactions: number;
  pendingAmount: string;
  status: "active" | "inactive";
  lastTransaction: string;
  date: Date;
}

const initialVendors: Vendor[] = [
  {
    id: "1",
    name: "Raju Karahi Works",
    type: "karahi",
    phone: "+91 98765 43210",
    email: "raju.karahi@email.com",
    address: "Shop #12, Industrial Area, Mumbai",
    cnic: "12345-6789012-3",
    balanceType: "credit",
    openingAmount: "45000",
    totalTransactions: 245,
    pendingAmount: "₹45,000",
    status: "active",
    lastTransaction: "Today",
    date: new Date(),
  },
  {
    id: "2",
    name: "Shyam Katae Services",
    type: "katae",
    phone: "+91 87654 32109",
    email: "shyam.katae@email.com",
    address: "Unit 5, Textile Hub, Surat",
    cnic: "23456-7890123-4",
    balanceType: "debit",
    openingAmount: "0",
    totalTransactions: 189,
    pendingAmount: "₹0",
    status: "active",
    lastTransaction: "Yesterday",
    date: new Date(),
  },
  {
    id: "3",
    name: "Krishna Karahi",
    type: "karahi",
    phone: "+91 76543 21098",
    email: "krishna.k@email.com",
    address: "Plot 8, GIDC, Ahmedabad",
    cnic: "34567-8901234-5",
    balanceType: "credit",
    openingAmount: "18500",
    totalTransactions: 156,
    pendingAmount: "₹18,500",
    status: "active",
    lastTransaction: "2 days ago",
    date: new Date(),
  },
  {
    id: "4",
    name: "Mohan Katae Factory",
    type: "katae",
    phone: "+91 65432 10987",
    email: "mohan.factory@email.com",
    address: "Building B, Sector 7, Noida",
    cnic: "45678-9012345-6",
    balanceType: "credit",
    openingAmount: "72000",
    totalTransactions: 78,
    pendingAmount: "₹72,000",
    status: "inactive",
    lastTransaction: "1 week ago",
    date: new Date(),
  },
  {
    id: "5",
    name: "Suresh Karahi Enterprise",
    type: "karahi",
    phone: "+91 54321 09876",
    email: "suresh.ent@email.com",
    address: "Lane 3, Textile Market, Jaipur",
    cnic: "56789-0123456-7",
    balanceType: "credit",
    openingAmount: "25000",
    totalTransactions: 312,
    pendingAmount: "₹25,000",
    status: "active",
    lastTransaction: "3 days ago",
    date: new Date(),
  },
  {
    id: "6",
    name: "Ramesh Katae Works",
    type: "katae",
    phone: "+91 43210 98765",
    email: "ramesh.works@email.com",
    address: "Shop 45, Fabric Lane, Delhi",
    cnic: "67890-1234567-8",
    balanceType: "debit",
    openingAmount: "8750",
    totalTransactions: 98,
    pendingAmount: "₹8,750",
    status: "active",
    lastTransaction: "Today",
    date: new Date(),
  },
];

const vendorTypeConfig = {
  karahi: { label: "Karahi Vendor", class: "chip-primary" },
  katae: { label: "Katae Vendor", class: "chip-secondary" },
};

const statusConfig = {
  active: { label: "Active", class: "chip-success" },
  inactive: { label: "Inactive", class: "chip-danger" },
};

export default function ContactVendors() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const karahiCount = vendors.filter((v) => v.type === "karahi").length;
  const kataeCount = vendors.filter((v) => v.type === "katae").length;
  const totalPending = vendors.reduce((acc, v) => {
    const amount = parseInt(v.pendingAmount.replace(/[₹,]/g, "")) || 0;
    return acc + amount;
  }, 0);

  const handleAddVendor = (data: any) => {
    const newVendor: Vendor = {
      id: Date.now().toString(),
      name: data.name,
      type: data.accountType as "karahi" | "katae",
      phone: data.phone,
      email: "",
      address: data.address,
      cnic: data.cnic,
      balanceType: data.balanceType,
      openingAmount: data.openingAmount,
      totalTransactions: 0,
      pendingAmount: `₹${parseInt(data.openingAmount || "0").toLocaleString("en-IN")}`,
      status: "active",
      lastTransaction: "Never",
      date: data.date || new Date(),
    };
    setVendors([...vendors, newVendor]);
  };

  const handleEditVendor = (data: any) => {
    if (!editingVendor) return;
    
    setVendors(vendors.map(v => 
      v.id === editingVendor.id 
        ? {
            ...v,
            name: data.name,
            type: data.accountType as "karahi" | "katae",
            phone: data.phone,
            address: data.address,
            cnic: data.cnic,
            balanceType: data.balanceType,
            openingAmount: data.openingAmount,
            date: data.date || v.date,
          }
        : v
    ));
    setEditingVendor(null);
    setEditDialogOpen(false);
    toast.success("Vendor updated successfully");
  };

  const handleDeleteVendor = () => {
    if (!vendorToDelete) return;
    setVendors(vendors.filter(v => v.id !== vendorToDelete.id));
    setDeleteDialogOpen(false);
    setVendorToDelete(null);
    toast.success("Vendor deleted successfully");
  };

  const openEditDialog = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (vendor: Vendor) => {
    setVendorToDelete(vendor);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vendors</h1>
          <p className="text-muted-foreground">
            Manage your Karahi and Katae vendor relationships
          </p>
        </div>
        <ContactFormDialog
          trigger={
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Vendor
            </Button>
          }
          title="Add Vendor"
          accountTypes={[
            { value: "karahi", label: "Karahi Vendor" },
            { value: "katae", label: "Katae Vendor" },
          ]}
          onSubmit={handleAddVendor}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-muted">
              <Truck className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Vendors</p>
              <p className="text-2xl font-bold">{vendors.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Truck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Karahi Vendors</p>
              <p className="text-2xl font-bold">{karahiCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10">
              <Truck className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Katae Vendors</p>
              <p className="text-2xl font-bold">{kataeCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <IndianRupee className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Payables</p>
              <p className="text-2xl font-bold">
                ₹{totalPending.toLocaleString("en-IN")}
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
            placeholder="Search vendors by name or email..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVendors.map((vendor) => (
          <div
            key={vendor.id}
            className="bg-card rounded-xl border border-border p-5 hover:shadow-medium transition-shadow animate-fade-in"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-muted text-foreground font-semibold">
                    {vendor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{vendor.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("chip text-xs", vendorTypeConfig[vendor.type].class)}>
                      {vendorTypeConfig[vendor.type].label}
                    </span>
                    <span className={cn("chip text-xs", statusConfig[vendor.status].class)}>
                      {statusConfig[vendor.status].label}
                    </span>
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card">
                  <DropdownMenuItem onClick={() => openEditDialog(vendor)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`/ledger/vendor/${vendor.id}`)}>
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Ledger
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => openDeleteDialog(vendor)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{vendor.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span className="truncate">{vendor.email || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{vendor.address}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Total Transactions</p>
                <p className="font-semibold">{vendor.totalTransactions}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending Amount</p>
                <p className={cn(
                  "font-semibold",
                  vendor.pendingAmount !== "₹0" && "text-warning"
                )}>
                  {vendor.pendingAmount}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Last transaction: {vendor.lastTransaction}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary h-7 px-2"
                onClick={() => navigate(`/ledger/vendor/${vendor.id}`)}
              >
                View Ledger
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      {editingVendor && (
        <ContactFormDialog
          trigger={<span />}
          title="Edit Vendor"
          accountTypes={[
            { value: "karahi", label: "Karahi Vendor" },
            { value: "katae", label: "Katae Vendor" },
          ]}
          onSubmit={handleEditVendor}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          defaultValues={{
            accountType: editingVendor.type,
            name: editingVendor.name,
            date: editingVendor.date,
            phone: editingVendor.phone,
            cnic: editingVendor.cnic,
            balanceType: editingVendor.balanceType,
            openingAmount: editingVendor.openingAmount,
            address: editingVendor.address,
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{vendorToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteVendor}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}