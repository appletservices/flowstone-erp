import {
  Receipt,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Download,
  TrendingUp,
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

interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  customer: string;
  items: number;
  totalAmount: string;
  status: "draft" | "sent" | "paid" | "overdue";
  date: string;
  dueDate: string;
}

const salesInvoices: SalesInvoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-001",
    customer: "Fashion Hub Ltd",
    items: 12,
    totalAmount: "₹3,75,000",
    status: "paid",
    date: "Dec 24, 2024",
    dueDate: "Jan 23, 2025",
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-002",
    customer: "Elite Garments",
    items: 8,
    totalAmount: "₹2,50,000",
    status: "sent",
    date: "Dec 23, 2024",
    dueDate: "Jan 22, 2025",
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-003",
    customer: "Royal Textiles",
    items: 5,
    totalAmount: "₹1,45,000",
    status: "draft",
    date: "Dec 22, 2024",
    dueDate: "Jan 21, 2025",
  },
  {
    id: "4",
    invoiceNumber: "INV-2024-004",
    customer: "Metro Fashion",
    items: 15,
    totalAmount: "₹4,20,000",
    status: "overdue",
    date: "Dec 10, 2024",
    dueDate: "Dec 20, 2024",
  },
  {
    id: "5",
    invoiceNumber: "INV-2024-005",
    customer: "City Apparels",
    items: 6,
    totalAmount: "₹1,85,000",
    status: "paid",
    date: "Dec 18, 2024",
    dueDate: "Jan 17, 2025",
  },
  {
    id: "6",
    invoiceNumber: "INV-2024-006",
    customer: "Prime Wholesale",
    items: 20,
    totalAmount: "₹5,60,000",
    status: "sent",
    date: "Dec 21, 2024",
    dueDate: "Jan 20, 2025",
  },
];

const statusConfig = {
  draft: { label: "Draft", icon: FileText, class: "chip-warning" },
  sent: { label: "Sent", icon: Clock, class: "chip-primary" },
  paid: { label: "Paid", icon: CheckCircle, class: "chip-success" },
  overdue: { label: "Overdue", icon: XCircle, class: "chip-danger" },
};

export default function Sales() {
  const stats = {
    total: salesInvoices.length,
    totalAmount: salesInvoices.reduce((acc, inv) => {
      const amount = parseInt(inv.totalAmount.replace(/[₹,]/g, "")) || 0;
      return acc + amount;
    }, 0),
    paid: salesInvoices.filter((inv) => inv.status === "paid").length,
    pending: salesInvoices.filter((inv) => inv.status === "sent" || inv.status === "draft").length,
    overdue: salesInvoices.filter((inv) => inv.status === "overdue").length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales & Invoices</h1>
          <p className="text-muted-foreground">
            Manage sales invoices, customer payments, and revenue tracking
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Invoice
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <p className="text-2xl font-bold">
                ₹{stats.totalAmount.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Paid</p>
              <p className="text-2xl font-bold">{stats.paid}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/10">
              <XCircle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold">{stats.overdue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">All Invoices</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search invoices..." className="pl-10" />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Due Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {salesInvoices.map((invoice) => {
                const StatusIcon = statusConfig[invoice.status].icon;
                return (
                  <tr key={invoice.id} className="animate-fade-in">
                    <td>
                      <span className="font-mono text-sm font-medium text-primary">
                        {invoice.invoiceNumber}
                      </span>
                    </td>
                    <td className="font-medium">{invoice.customer}</td>
                    <td>{invoice.items} items</td>
                    <td className="font-semibold">{invoice.totalAmount}</td>
                    <td>
                      <span className={cn("chip flex items-center gap-1.5 w-fit", statusConfig[invoice.status].class)}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusConfig[invoice.status].label}
                      </span>
                    </td>
                    <td className="text-muted-foreground">{invoice.date}</td>
                    <td className={cn(
                      invoice.status === "overdue" && "text-destructive font-medium"
                    )}>
                      {invoice.dueDate}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card">
                            <DropdownMenuItem>View Invoice</DropdownMenuItem>
                            <DropdownMenuItem>Edit Invoice</DropdownMenuItem>
                            <DropdownMenuItem>Send to Customer</DropdownMenuItem>
                            <DropdownMenuItem>Record Payment</DropdownMenuItem>
                            <DropdownMenuItem>Print Invoice</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Void Invoice
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing 1-6 of 48 invoices
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
