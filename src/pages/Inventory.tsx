import { useState, useEffect, useCallback } from "react";
import { useSetPageHeader } from "@/hooks/usePageHeader";
import { useNavigate } from "react-router-dom";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// Category display config with colors
const categoryDisplay = [
  { id: "inventory", name: "Raw Inventory", icon: Box, color: "text-primary", bg: "bg-primary/10", key: "inventory" },
  { id: "design", name: "Design Inventory", icon: Palette, color: "text-purple-600", bg: "bg-purple-100", key: "design" },
  { id: "katae", name: "Katae Product", icon: Scissors, color: "text-orange-600", bg: "bg-orange-100", key: "katae" },
  { id: "finish", name: "Finished Product", icon: PackageCheck, color: "text-emerald-600", bg: "bg-emerald-100", key: "finish" },
];

// Get category styles for table
const getCategoryStyles = (category: string) => {
  const normalizedCategory = category.toLowerCase().trim();
  const found = categoryDisplay.find(cat => cat.key === normalizedCategory);
  if (found) {
    return { color: found.color, bg: found.bg };
  }
  return { color: "text-muted-foreground", bg: "bg-muted/10" };
};

export default function Inventory() {
  const navigate = useNavigate();
  useSetPageHeader("Inventory Management", "Track and manage all inventory categories");
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
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const url = new URL(`${import.meta.env.VITE_API_URL}/inventory/all`);
      url.searchParams.append("page", currentPage.toString());
      url.searchParams.append("per_page", pageSize.toString());
      if (searchQuery) {
        url.searchParams.append("search", searchQuery);
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      const dynamicResponse = await response.json();

      setData(dynamicResponse.data || []);
      setSummary(dynamicResponse.summary || { inventory: 0, design: 0, katae: 0, finish: 0 });
      setRecordsTotal(dynamicResponse.recordsTotal || dynamicResponse.pagination?.total || 0);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, searchQuery]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(recordsTotal / pageSize);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="space-y-6">

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
            <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card">
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="25">25 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
                <SelectItem value="100">100 / page</SelectItem>
              </SelectContent>
            </Select>
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
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Item Name</th>
                <th className="text-right">Opening-Qty</th>
                <th className="text-right">Total-Qty</th>
                <th className="text-right">Converted-Qty</th>
                <th>Unit</th>
                <th className="text-right">Average Cost</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-muted-foreground">
                    No items found
                  </td>
                </tr>
              ) : (
                data.map((item) => {
                  const categoryStyles = getCategoryStyles(item.category);
                  return (
                    <tr key={item.id}>
                      <td className="capitalize">
                        <span className={cn("text-sm font-medium px-2 py-1 rounded-md", categoryStyles.bg, categoryStyles.color)}>
                          {item.category}
                        </span>
                      </td>
                      <td className="font-medium">{item.name}</td>
                      <td className="text-right">{Number(item.opening_qty).toLocaleString()}</td>
                      <td className="text-right font-semibold">{Number(item.total_qty).toLocaleString()}</td>
                      <td className="text-right">{Number(item.converted_qty).toLocaleString()}</td>
                      <td className="text-muted-foreground">{item.unit}</td>
                      <td className="text-right">Rs. {Number(item.avg_cost).toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/ledger/inventory/${item.id}`)}>
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Showing {data.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0} to {Math.min(currentPage * pageSize, recordsTotal)} of {recordsTotal} items
            </p>
            <div className="flex items-center gap-2">

            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            {getPageNumbers().map((page, index) => (
              typeof page === "number" ? (
                <Button
                  key={index}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              ) : (
                <span key={index} className="px-2 text-muted-foreground">...</span>
              )
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}