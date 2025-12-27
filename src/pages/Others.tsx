import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface OtherContact {
  id: string;
  code: string;
  name: string;
  type: string;
  phone: string;
  email: string;
  balance: string;
  status: "active" | "inactive";
  lastUpdated: string;
}

const contacts: OtherContact[] = [
  {
    id: "1",
    code: "OTH-001",
    name: "Transport Services Ltd",
    type: "Transport",
    phone: "+92 321 1234567",
    email: "transport@services.com",
    balance: "Rs. 25,000",
    status: "active",
    lastUpdated: "2 hours ago",
  },
  {
    id: "2",
    code: "OTH-002",
    name: "Quality Testing Lab",
    type: "Testing",
    phone: "+92 333 9876543",
    email: "lab@testing.com",
    balance: "Rs. 15,000",
    status: "active",
    lastUpdated: "1 day ago",
  },
  {
    id: "3",
    code: "OTH-003",
    name: "Packaging Solutions",
    type: "Packaging",
    phone: "+92 300 5551234",
    email: "pack@solutions.com",
    balance: "Rs. 0",
    status: "active",
    lastUpdated: "5 hours ago",
  },
  {
    id: "4",
    code: "OTH-004",
    name: "Office Supplies Co",
    type: "Supplies",
    phone: "+92 311 4567890",
    email: "office@supplies.com",
    balance: "Rs. 8,500",
    status: "inactive",
    lastUpdated: "3 days ago",
  },
  {
    id: "5",
    code: "OTH-005",
    name: "Maintenance Services",
    type: "Maintenance",
    phone: "+92 345 6789012",
    email: "maint@services.com",
    balance: "Rs. 12,000",
    status: "active",
    lastUpdated: "30 mins ago",
  },
  {
    id: "6",
    code: "OTH-006",
    name: "Security Agency",
    type: "Security",
    phone: "+92 321 2345678",
    email: "security@agency.com",
    balance: "Rs. 45,000",
    status: "active",
    lastUpdated: "1 hour ago",
  },
];

const statusConfig = {
  active: { label: "Active", class: "chip-success" },
  inactive: { label: "Inactive", class: "chip-danger" },
};

export default function Others() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBalance = contacts.reduce((acc, c) => {
    const amount = parseInt(c.balance.replace(/[Rs.,\s]/g, "")) || 0;
    return acc + amount;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Other Contacts</h1>
          <p className="text-muted-foreground">
            Manage other business contacts and service providers
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Contact
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-muted">
              <Users className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Contacts</p>
              <p className="text-2xl font-bold">{contacts.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <Users className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">
                {contacts.filter((c) => c.status === "active").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <Users className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Balance</p>
              <p className="text-2xl font-bold">Rs. {totalBalance.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">All Contacts</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search contacts..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Type</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="animate-fade-in">
                  <td>
                    <span className="font-mono text-sm text-muted-foreground">
                      {contact.code}
                    </span>
                  </td>
                  <td className="font-medium">{contact.name}</td>
                  <td>
                    <span className="text-sm text-muted-foreground">
                      {contact.type}
                    </span>
                  </td>
                  <td className="text-sm">{contact.phone}</td>
                  <td className="text-sm text-muted-foreground">{contact.email}</td>
                  <td className={cn(
                    "font-semibold",
                    contact.balance !== "Rs. 0" && "text-warning"
                  )}>
                    {contact.balance}
                  </td>
                  <td>
                    <span className={cn("chip", statusConfig[contact.status].class)}>
                      {statusConfig[contact.status].label}
                    </span>
                  </td>
                  <td className="text-sm text-muted-foreground">
                    {contact.lastUpdated}
                  </td>
                  <td>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>View Ledger</DropdownMenuItem>
                        <DropdownMenuItem>Edit Contact</DropdownMenuItem>
                        <DropdownMenuItem>Record Payment</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing 1-{filteredContacts.length} of {contacts.length} contacts
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
