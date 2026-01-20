import { useState } from "react";
import { useSetPageHeader } from "@/hooks/usePageHeader";
import {
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  MapPin,
  MoreHorizontal,
  User,
  CreditCard,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ContactFormDialog } from "@/components/contact/ContactFormDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Customers {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  totalTransactions: number;
  CustomersAmount: string;
  status: "active" | "inactive";
  lastTransaction: string;
}

const Customerss: Customers[] = [
  {
    id: "1",
    name: "Ahmad Textiles",
    phone: "+92 321 1234567",
    email: "ahmad@textiles.com",
    address: "Shop #15, Cloth Market, Faisalabad",
    totalTransactions: 245,
    CustomersAmount: "Rs. 125,000",
    status: "active",
    lastTransaction: "Today",
  },
  {
    id: "2",
    name: "Karachi Garments",
    phone: "+92 333 9876543",
    email: "info@karachigarments.pk",
    address: "Block A, SITE Area, Karachi",
    totalTransactions: 189,
    CustomersAmount: "Rs. 250,000",
    status: "active",
    lastTransaction: "Yesterday",
  },
  {
    id: "3",
    name: "Lahore Fashion Hub",
    phone: "+92 300 5551234",
    email: "contact@lahorefashion.com",
    address: "Liberty Market, Lahore",
    totalTransactions: 156,
    CustomersAmount: "Rs. 0",
    status: "inactive",
    lastTransaction: "2 days ago",
  },
  {
    id: "4",
    name: "Islamabad Traders",
    phone: "+92 311 4567890",
    email: "traders@islamabad.pk",
    address: "Blue Area, Islamabad",
    totalTransactions: 78,
    CustomersAmount: "Rs. 85,000",
    status: "active",
    lastTransaction: "1 week ago",
  },
  {
    id: "5",
    name: "Multan Cotton Works",
    phone: "+92 345 6789012",
    email: "cotton@multan.pk",
    address: "Industrial Estate, Multan",
    totalTransactions: 312,
    CustomersAmount: "Rs. 175,000",
    status: "active",
    lastTransaction: "3 days ago",
  },
  {
    id: "6",
    name: "Peshawar Fabrics",
    phone: "+92 321 2345678",
    email: "fabrics@peshawar.pk",
    address: "Saddar Bazaar, Peshawar",
    totalTransactions: 98,
    CustomersAmount: "Rs. 45,000",
    status: "active",
    lastTransaction: "Today",
  },
];

const statusConfig = {
  active: { label: "Active", class: "chip-success" },
  inactive: { label: "Inactive", class: "chip-danger" },
};

export default function Customers() {
  useSetPageHeader("Customers", "Manage customer accounts and payments");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCustomerss = Customerss.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = Customerss.filter((r) => r.status === "active").length;
  const totalCustomers = Customerss.reduce((acc, r) => {
    const amount = parseInt(r.CustomersAmount.replace(/[Rs.,\s]/g, "")) || 0;
    return acc + amount;
  }, 0);

  return (
    <div className="space-y-6">

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-muted">
              <User className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Customers</p>
              <p className="text-2xl font-bold">{Customerss.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <User className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Customers</p>
              <p className="text-2xl font-bold">{activeCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <CreditCard className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Customers</p>
              <p className="text-2xl font-bold">
                Rs. {totalCustomers.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold">Rs. 485,000</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or email..." 
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

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomerss.map((item) => (
          <div
            key={item.id}
            className="bg-card rounded-xl border border-border p-5 hover:shadow-medium transition-shadow animate-fade-in"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {item.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <span className={cn("chip text-xs", statusConfig[item.status].class)}>
                    {statusConfig[item.status].label}
                  </span>
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
                  <DropdownMenuItem>Record Payment</DropdownMenuItem>
                  <DropdownMenuItem>Create Invoice</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{item.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span className="truncate">{item.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{item.address}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Transactions</p>
                <p className="font-semibold">{item.totalTransactions}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Customers</p>
                <p className={cn(
                  "font-semibold",
                  item.CustomersAmount !== "Rs. 0" && "text-warning"
                )}>
                  {item.CustomersAmount}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Last: {item.lastTransaction}
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
