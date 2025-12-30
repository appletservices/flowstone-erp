import { useState, useEffect } from "react";
import {
  Package,
  Box,
  Palette,
  Scissors,
  PackageCheck,
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

// Interface for type safety with dynamic data
interface InventoryItem {
  id: number;
  name: string;
  category: string;
  opening_qty: string;
  converted_qty: string;
  total_qty: string;
  opening_cost: string;
  avg_cost: string;
  unit: string;
}

interface InventorySummary {
  inventory: number;
  design: number;
  katae: number;
  finish: number;
}

export default function Inventory() {
  // State for dynamic API data
  const [data, setData] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary>({
    inventory: 0,
    design: 0,
    katae: 0,
    finish: 0,
  });
  const [recordsTotal, setRecordsTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Simulated API Fetch - Replace the inner logic with your actual fetch/axios call
  useEffect(() => {
    const fetchInventory = async () => {
      try {
          const token = localStorage.getItem("auth_token"); 
          const response = await fetch(`${import.meta.env.VITE_API_URL}/inventory/all`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`, 
            },
          });
        const dynamicResponse = await response.json();
        
        // Using your provided structure dynamically:

        setData(dynamicResponse.data);
        setSummary(dynamicResponse.summary);
        setRecordsTotal(dynamicResponse.recordsTotal);
      } catch (error) {
        console.error("Failed to fetch inventory:", error);
      }
    };

    fetchInventory();
  }, []);

  const categoryDisplay = [
    { id: "inventory", name: "Raw Inventory", icon: Box, color: "text-primary", bg: "bg-primary/10", key: "inventory" },
    { id: "design", name: "Design Inventory", icon: Palette, color: "text-secondary", bg: "bg-secondary/10", key: "design" },
    { id: "katae", name: "Katae Product", icon: Scissors, color: "text-warning", bg: "bg-warning/10", key: "katae" },
    { id: "finish", name: "Finished Product", icon: PackageCheck, color: "text-success", bg: "bg-success/10", key: "finish" },
  ];

  const filteredItems = data.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Track and manage all inventory categories and stock levels</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Package className="w-4 h-4" /> Stock Report
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Add Item
          </Button>
        </div>
      </div>

      {/* Category Cards - Dynamic Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categoryDisplay.map((cat) => {
          const Icon = cat.icon;
          const itemCount = summary[cat.key as keyof InventorySummary] || 0;
          return (
            <div key={cat.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow cursor-pointer group animate-fade-in">
              <div className="flex items-start justify-between mb-4">
                <div className={cn("p-3 rounded-xl", cat.bg)}>
                  <Icon className={cn("w-6 h-6", cat.color)} />
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="font-semibold mb-1">{cat.name}</h3>
              <p className="text-sm text-muted-foreground">{itemCount} items</p>
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
              <Input 
                placeholder="Search items..." 
                className="pl-10" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" /> Filter
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="p-4">Category</th>
                <th className="p-4">Item Name</th>
                <th className="p-4">Opening-Qty</th>
                <th className="p-4">Total-Qty</th>
                <th className="p-4">Converted-Qty</th>
                <th className="p-4">Unit</th>
                <th className="p-4">Average Cost</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-b border-border hover:bg-muted/5 animate-fade-in">
                  <td className="p-4 capitalize">
                    <span className="text-sm font-medium">{item.category}</span>
                  </td>
                  <td className="p-4 font-medium">{item.name}</td>
                  <td className="p-4">{Number(item.opening_qty).toLocaleString()}</td>
                  <td className="p-4 font-semibold">{Number(item.total_qty).toLocaleString()}</td>
                  <td className="p-4">{Number(item.converted_qty).toLocaleString()}</td>
                  <td className="p-4 text-sm text-muted-foreground">{item.unit}</td>
                  <td className="p-4">Rs. {Number(item.avg_cost).toLocaleString()}</td>
                  <td className="p-4 text-right">
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination - Dynamic Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredItems.length} of {recordsTotal} items
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled={data.length < 10}>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}