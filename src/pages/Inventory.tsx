import {
  Package,
  Box,
  Palette,
  Scissors,
  PackageCheck,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  ArrowRight,
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

interface InventoryCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  items: number;
  value: string;
  change: number;
}

const categories: InventoryCategory[] = [
  {
    id: "raw",
    name: "Raw Inventory",
    icon: Box,
    color: "text-primary",
    bg: "bg-primary/10",
    items: 156,
    value: "₹8,45,000",
    change: 12.5,
  },
  {
    id: "design",
    name: "Design Inventory",
    icon: Palette,
    color: "text-secondary",
    bg: "bg-secondary/10",
    items: 89,
    value: "₹4,25,000",
    change: 8.3,
  },
  {
    id: "katae",
    name: "Katae Product",
    icon: Scissors,
    color: "text-warning",
    bg: "bg-warning/10",
    items: 234,
    value: "₹2,18,000",
    change: -3.2,
  },
  {
    id: "finished",
    name: "Finished Product",
    icon: PackageCheck,
    color: "text-success",
    bg: "bg-success/10",
    items: 412,
    value: "₹12,50,000",
    change: 18.7,
  },
];

interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: string;
  totalValue: string;
  status: "in-stock" | "low-stock" | "out-of-stock";
  lastUpdated: string;
}

const inventoryItems: InventoryItem[] = [
  {
    id: "1",
    code: "RAW-001",
    name: "Cotton Fabric Premium",
    category: "Raw Inventory",
    quantity: 850,
    unit: "Meters",
    unitPrice: "₹120",
    totalValue: "₹1,02,000",
    status: "in-stock",
    lastUpdated: "2 hours ago",
  },
  {
    id: "2",
    code: "RAW-002",
    name: "Silk Thread Gold",
    category: "Raw Inventory",
    quantity: 45,
    unit: "Spools",
    unitPrice: "₹250",
    totalValue: "₹11,250",
    status: "low-stock",
    lastUpdated: "1 day ago",
  },
  {
    id: "3",
    code: "DES-001",
    name: "Embroidery Pattern A1",
    category: "Design Inventory",
    quantity: 120,
    unit: "Pieces",
    unitPrice: "₹450",
    totalValue: "₹54,000",
    status: "in-stock",
    lastUpdated: "5 hours ago",
  },
  {
    id: "4",
    code: "KAT-001",
    name: "Cut Fabric Lot #234",
    category: "Katae Product",
    quantity: 0,
    unit: "Pieces",
    unitPrice: "₹180",
    totalValue: "₹0",
    status: "out-of-stock",
    lastUpdated: "3 days ago",
  },
  {
    id: "5",
    code: "FIN-001",
    name: "Premium Cotton Shirt",
    category: "Finished Product",
    quantity: 245,
    unit: "Pieces",
    unitPrice: "₹1,250",
    totalValue: "₹3,06,250",
    status: "in-stock",
    lastUpdated: "30 mins ago",
  },
  {
    id: "6",
    code: "FIN-002",
    name: "Silk Embroidered Kurta",
    category: "Finished Product",
    quantity: 89,
    unit: "Pieces",
    unitPrice: "₹2,450",
    totalValue: "₹2,18,050",
    status: "in-stock",
    lastUpdated: "1 hour ago",
  },
];

const statusConfig = {
  "in-stock": { label: "In Stock", class: "chip-success" },
  "low-stock": { label: "Low Stock", class: "chip-warning" },
  "out-of-stock": { label: "Out of Stock", class: "chip-danger" },
};

export default function Inventory() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">
            Track and manage all inventory categories and stock levels
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Package className="w-4 h-4" />
            Stock Report
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <div
              key={category.id}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-medium transition-shadow cursor-pointer group animate-fade-in"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={cn("p-3 rounded-xl", category.bg)}>
                  <Icon className={cn("w-6 h-6", category.color)} />
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="font-semibold mb-1">{category.name}</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{category.value}</p>
                  <p className="text-sm text-muted-foreground">{category.items} items</p>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 text-sm font-medium",
                    category.change >= 0 ? "text-success" : "text-destructive"
                  )}
                >
                  {category.change >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {Math.abs(category.change)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inventory Table */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">All Inventory Items</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search items..." className="pl-10" />
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
                <th>Item Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total Value</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {inventoryItems.map((item) => (
                <tr key={item.id} className="animate-fade-in">
                  <td>
                    <span className="font-mono text-sm text-muted-foreground">
                      {item.code}
                    </span>
                  </td>
                  <td className="font-medium">{item.name}</td>
                  <td>
                    <span className="text-sm text-muted-foreground">
                      {item.category}
                    </span>
                  </td>
                  <td>
                    <span className="font-medium">{item.quantity}</span>
                    <span className="text-sm text-muted-foreground ml-1">
                      {item.unit}
                    </span>
                  </td>
                  <td>{item.unitPrice}</td>
                  <td className="font-semibold">{item.totalValue}</td>
                  <td>
                    <span className={cn("chip", statusConfig[item.status].class)}>
                      {statusConfig[item.status].label}
                    </span>
                  </td>
                  <td className="text-sm text-muted-foreground">
                    {item.lastUpdated}
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
                        <DropdownMenuItem>Stock Ledger</DropdownMenuItem>
                        <DropdownMenuItem>Adjust Stock</DropdownMenuItem>
                        <DropdownMenuItem>Issue to Vendor</DropdownMenuItem>
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
            Showing 1-6 of 891 items
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
