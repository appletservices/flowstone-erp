import { useState } from "react";
import {
  ShoppingCart,
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

interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: string;
  vendorType: "karahi" | "katae";
  items: number;
  totalAmount: string;
  status: "pending" | "approved" | "received" | "cancelled";
  date: string;
  grnStatus: "pending" | "verified" | "none";
}

const purchaseOrders: PurchaseOrder[] = [
  {
    id: "1",
    poNumber: "PO-2024-001",
    vendor: "ABC Textiles",
    vendorType: "karahi",
    items: 5,
    totalAmount: "₹1,25,000",
    status: "received",
    date: "Dec 24, 2024",
    grnStatus: "verified",
  },
  {
    id: "2",
    poNumber: "PO-2024-002",
    vendor: "XYZ Suppliers",
    vendorType: "katae",
    items: 3,
    totalAmount: "₹45,000",
    status: "approved",
    date: "Dec 23, 2024",
    grnStatus: "pending",
  },
  {
    id: "3",
    poNumber: "PO-2024-003",
    vendor: "Raju Karahi Works",
    vendorType: "karahi",
    items: 8,
    totalAmount: "₹2,18,000",
    status: "pending",
    date: "Dec 22, 2024",
    grnStatus: "none",
  },
  {
    id: "4",
    poNumber: "PO-2024-004",
    vendor: "Shyam Katae Services",
    vendorType: "katae",
    items: 2,
    totalAmount: "₹32,000",
    status: "cancelled",
    date: "Dec 21, 2024",
    grnStatus: "none",
  },
  {
    id: "5",
    poNumber: "PO-2024-005",
    vendor: "Krishna Karahi",
    vendorType: "karahi",
    items: 4,
    totalAmount: "₹87,500",
    status: "received",
    date: "Dec 20, 2024",
    grnStatus: "verified",
  },
];

const statusConfig = {
  pending: { label: "Pending", icon: Clock, class: "chip-warning" },
  approved: { label: "Approved", icon: CheckCircle, class: "chip-primary" },
  received: { label: "Received", icon: CheckCircle, class: "chip-success" },
  cancelled: { label: "Cancelled", icon: XCircle, class: "chip-danger" },
};

const grnStatusConfig = {
  pending: { label: "GRN Pending", class: "chip-warning" },
  verified: { label: "GRN Verified", class: "chip-success" },
  none: { label: "-", class: "" },
};

export default function Purchase() {
  const stats = {
    total: purchaseOrders.length,
    pending: purchaseOrders.filter((po) => po.status === "pending").length,
    approved: purchaseOrders.filter((po) => po.status === "approved").length,
    received: purchaseOrders.filter((po) => po.status === "received").length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Purchase Orders</h1>
          <p className="text-muted-foreground">
            Manage purchase orders, GRN verification, and vendor payments
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Create Purchase Order
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-muted">
              <ShoppingCart className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
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
              <p className="text-sm text-muted-foreground">Received</p>
              <p className="text-2xl font-bold">{stats.received}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">All Purchase Orders</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search orders..." className="pl-10" />
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
                <th>PO Number</th>
                <th>Vendor</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>GRN Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map((po) => {
                const StatusIcon = statusConfig[po.status].icon;
                return (
                  <tr key={po.id} className="animate-fade-in">
                    <td>
                      <span className="font-mono text-sm font-medium text-primary">
                        {po.poNumber}
                      </span>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium">{po.vendor}</p>
                        <span className={cn(
                          "chip text-xs",
                          po.vendorType === "karahi" ? "chip-primary" : "chip-secondary"
                        )}>
                          {po.vendorType === "karahi" ? "Karahi" : "Katae"}
                        </span>
                      </div>
                    </td>
                    <td>{po.items} items</td>
                    <td className="font-semibold">{po.totalAmount}</td>
                    <td>
                      <span className={cn("chip flex items-center gap-1.5 w-fit", statusConfig[po.status].class)}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusConfig[po.status].label}
                      </span>
                    </td>
                    <td>
                      {po.grnStatus !== "none" && (
                        <span className={cn("chip", grnStatusConfig[po.grnStatus].class)}>
                          {grnStatusConfig[po.grnStatus].label}
                        </span>
                      )}
                    </td>
                    <td className="text-muted-foreground">{po.date}</td>
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
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit Order</DropdownMenuItem>
                            <DropdownMenuItem>Create GRN</DropdownMenuItem>
                            <DropdownMenuItem>Print PO</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Cancel Order
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
            Showing 1-5 of 24 orders
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
