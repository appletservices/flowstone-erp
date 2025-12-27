import { useState } from "react";
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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ContactFormDialog } from "@/components/contact/ContactFormDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Vendor {
  id: string;
  name: string;
  type: "karahi" | "katae";
  phone: string;
  email: string;
  address: string;
  totalTransactions: number;
  pendingAmount: string;
  status: "active" | "inactive";
  lastTransaction: string;
}

const vendors: Vendor[] = [
  {
    id: "1",
    name: "Raju Karahi Works",
    type: "karahi",
    phone: "+91 98765 43210",
    email: "raju.karahi@email.com",
    address: "Shop #12, Industrial Area, Mumbai",
    totalTransactions: 245,
    pendingAmount: "₹45,000",
    status: "active",
    lastTransaction: "Today",
  },
  {
    id: "2",
    name: "Shyam Katae Services",
    type: "katae",
    phone: "+91 87654 32109",
    email: "shyam.katae@email.com",
    address: "Unit 5, Textile Hub, Surat",
    totalTransactions: 189,
    pendingAmount: "₹0",
    status: "active",
    lastTransaction: "Yesterday",
  },
  {
    id: "3",
    name: "Krishna Karahi",
    type: "karahi",
    phone: "+91 76543 21098",
    email: "krishna.k@email.com",
    address: "Plot 8, GIDC, Ahmedabad",
    totalTransactions: 156,
    pendingAmount: "₹18,500",
    status: "active",
    lastTransaction: "2 days ago",
  },
  {
    id: "4",
    name: "Mohan Katae Factory",
    type: "katae",
    phone: "+91 65432 10987",
    email: "mohan.factory@email.com",
    address: "Building B, Sector 7, Noida",
    totalTransactions: 78,
    pendingAmount: "₹72,000",
    status: "inactive",
    lastTransaction: "1 week ago",
  },
  {
    id: "5",
    name: "Suresh Karahi Enterprise",
    type: "karahi",
    phone: "+91 54321 09876",
    email: "suresh.ent@email.com",
    address: "Lane 3, Textile Market, Jaipur",
    totalTransactions: 312,
    pendingAmount: "₹25,000",
    status: "active",
    lastTransaction: "3 days ago",
  },
  {
    id: "6",
    name: "Ramesh Katae Works",
    type: "katae",
    phone: "+91 43210 98765",
    email: "ramesh.works@email.com",
    address: "Shop 45, Fabric Lane, Delhi",
    totalTransactions: 98,
    pendingAmount: "₹8,750",
    status: "active",
    lastTransaction: "Today",
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
  const [searchQuery, setSearchQuery] = useState("");

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
                  <DropdownMenuItem>View Profile</DropdownMenuItem>
                  <DropdownMenuItem>View Ledger</DropdownMenuItem>
                  <DropdownMenuItem>Issue Inventory</DropdownMenuItem>
                  <DropdownMenuItem>Receive Inventory</DropdownMenuItem>
                  <DropdownMenuItem>Record Payment</DropdownMenuItem>
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
                <span className="truncate">{vendor.email}</span>
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
              <Button variant="ghost" size="sm" className="text-primary h-7 px-2">
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
