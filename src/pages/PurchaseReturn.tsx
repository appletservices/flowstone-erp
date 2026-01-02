import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RotateCcw,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
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

interface PurchaseReturn {
  id: string;
  returnNumber: string;
  vendor: string;
  vendorType: "karahi" | "katae";
  items: number;
  totalAmount: string;
  status: "pending" | "approved" | "completed" | "cancelled";
  date: string;
  tCharges: string;
}

const purchaseReturns: PurchaseReturn[] = [
  {
    id: "1",
    returnNumber: "PR-2024-001",
    vendor: "ABC Textiles",
    vendorType: "karahi",
    items: 3,
    totalAmount: "₹45,000",
    status: "completed",
    date: "Dec 24, 2024",
    tCharges: "₹1,200",
  },
  {
    id: "2",
    returnNumber: "PR-2024-002",
    vendor: "XYZ Suppliers",
    vendorType: "katae",
    items: 2,
    totalAmount: "₹22,000",
    status: "approved",
    date: "Dec 23, 2024",
    tCharges: "₹600",
  },
  {
    id: "3",
    returnNumber: "PR-2024-003",
    vendor: "Raju Karahi Works",
    vendorType: "karahi",
    items: 4,
    totalAmount: "₹78,000",
    status: "pending",
    date: "Dec 22, 2024",
    tCharges: "₹2,100",
  },
  {
    id: "4",
    returnNumber: "PR-2024-004",
    vendor: "Shyam Katae Services",
    vendorType: "katae",
    items: 1,
    totalAmount: "₹12,000",
    status: "cancelled",
    date: "Dec 21, 2024",
    tCharges: "₹400",
  },
  {
    id: "5",
    returnNumber: "PR-2024-005",
    vendor: "Krishna Karahi",
    vendorType: "karahi",
    items: 2,
    totalAmount: "₹35,500",
    status: "completed",
    date: "Dec 20, 2024",
    tCharges: "₹900",
  },
];

const statusConfig = {
  pending: { label: "Pending", icon: Clock, class: "chip-warning" },
  approved: { label: "Approved", icon: CheckCircle, class: "chip-primary" },
  completed: { label: "Completed", icon: CheckCircle, class: "chip-success" },
  cancelled: { label: "Cancelled", icon: XCircle, class: "chip-danger" },
};

export default function PurchaseReturn() {
  const navigate = useNavigate();
  const stats = {
    total: purchaseReturns.length,
    pending: purchaseReturns.filter((pr) => pr.status === "pending").length,
    approved: purchaseReturns.filter((pr) => pr.status === "approved").length,
    completed: purchaseReturns.filter((pr) => pr.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Purchase Returns</h1>
          <p className="text-muted-foreground">
            Manage purchase returns and refunds
          </p>
        </div>
        <Button className="gap-2" onClick={() => navigate("/purchase-return/new")}>
          <Plus className="w-4 h-4" />
          Create Purchase Return
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-muted">
              <RotateCcw className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Returns</p>
              <p className="text-2xl font-bold">{stats.total}</p>
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
            <div className="p-3 rounded-xl bg-primary/10">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold">{stats.approved}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Returns Table */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">All Purchase Returns</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search returns..." className="pl-10" />
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
                <th>Return Number</th>
                <th>Vendor</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>T-Charges</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {purchaseReturns.map((pr) => {
                const StatusIcon = statusConfig[pr.status].icon;
                return (
                  <tr key={pr.id} className="animate-fade-in">
                    <td>
                      <span className="font-mono text-sm font-medium text-primary">
                        {pr.returnNumber}
                      </span>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium">{pr.vendor}</p>
                        <span className={cn(
                          "chip text-xs",
                          pr.vendorType === "karahi" ? "chip-primary" : "chip-secondary"
                        )}>
                          {pr.vendorType === "karahi" ? "Karahi" : "Katae"}
                        </span>
                      </div>
                    </td>
                    <td>{pr.items} items</td>
                    <td className="font-semibold">{pr.totalAmount}</td>
                    <td>
                      <span className={cn("chip flex items-center gap-1.5 w-fit", statusConfig[pr.status].class)}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusConfig[pr.status].label}
                      </span>
                    </td>
                    <td>{pr.tCharges}</td>
                    <td className="text-muted-foreground">{pr.date}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => navigate(`/purchase-return/${pr.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card">
                            <DropdownMenuItem onClick={() => navigate(`/purchase-return/${pr.id}`)}>View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/purchase-return/${pr.id}/edit`)}>Edit Return</DropdownMenuItem>
                            <DropdownMenuItem>Print Return</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Cancel Return
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
            Showing 1-5 of 12 returns
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