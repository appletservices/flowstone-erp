import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Palette,
  CalendarIcon,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useBackendSearch } from "@/hooks/useBackendSearch";
import { FilterDialog } from "@/components/filters/FilterDialog";

const API_URL = "https://crm.dripcot.com/api";

interface DesignItem {
  id: number;
  name: string;
  product_id: number;
  product_name?: string;
  opening_qty: string;
  total_qty: string;
  avg_cost: string;
  unit: string;
}

interface ProductOption {
  id: number;
  name: string;
}

interface FormData {
  id?: number;
  name: string;
  product_id: string;
  opening_qty: string;
  per_unit_cost: string;
  date: Date | undefined;
}

const emptyFormData: FormData = {
  name: "",
  product_id: "",
  opening_qty: "",
  per_unit_cost: "",
  date: undefined,
};

export default function DesignInventory() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(emptyFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [designItems, setDesignItems] = useState<DesignItem[]>([]);
  const [recordsTotal, setRecordsTotal] = useState(0);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    dateRange,
    keyValues,
    applyFilters,
    clearFilters,
    hasActiveFilters,
  } = useBackendSearch<DesignItem>({ endpoint: "/inventory/design/list" });

  // Fetch products from dropdown API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(`${API_URL}/inventory/raw/dropdown`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();
        if (result.data) {
          setProducts(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Fetch design inventory list
  const fetchDesignItems = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      
      const response = await fetch(`${API_URL}/inventory/design/list?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      if (result.data) {
        setDesignItems(result.data);
        setRecordsTotal(result.recordsTotal || result.data.length);
      }
    } catch (error) {
      console.error("Failed to fetch design items:", error);
    }
  };

  useEffect(() => {
    fetchDesignItems();
  }, [searchQuery]);

  const totalItems = recordsTotal;
  const totalValue = designItems.reduce(
    (acc, item) => acc + parseFloat(item.total_qty || "0") * parseFloat(item.avg_cost || "0"),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.product_id) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("auth_token");
      const endpoint = isEditing 
        ? `${API_URL}/inventory/design/update`
        : `${API_URL}/inventory/design/store`;

      const payload = {
        ...(isEditing && { id: formData.id }),
        name: formData.name,
        product_id: formData.product_id,
        opening_qty: formData.opening_qty || "0",
        per_unit_cost: formData.per_unit_cost || "0",
        date: formData.date ? format(formData.date, "yyyy-MM-dd") : null,
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success !== false) {
        toast.success(isEditing ? "Design item updated successfully" : "Design item added successfully");
        setDialogOpen(false);
        setFormData(emptyFormData);
        setIsEditing(false);
        fetchDesignItems();
      } else {
        toast.error(result.message || "Failed to save design item");
      }
    } catch (error) {
      console.error("Failed to save design item:", error);
      toast.error("Failed to save design item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: DesignItem) => {
    setFormData({
      id: item.id,
      name: item.name,
      product_id: String(item.product_id),
      opening_qty: item.opening_qty,
      per_unit_cost: item.avg_cost,
      date: undefined,
    });
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setFormData(emptyFormData);
      setIsEditing(false);
    }
  };

  const getProductName = (productId: number) => {
    return products.find((p) => p.id === productId)?.name || String(productId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Design Inventory</h1>
          <p className="text-muted-foreground">
            Manage design patterns and inventory
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Design
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-card">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Design Item" : "Add Design Item"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter design name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Product Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="product">Product *</Label>
                <Select
                  value={formData.product_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, product_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    {products.map((product) => (
                      <SelectItem key={product.id} value={String(product.id)}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Opening Quantity */}
                <div className="space-y-2">
                  <Label htmlFor="opening_qty">Opening Quantity</Label>
                  <Input
                    id="opening_qty"
                    type="number"
                    placeholder="Enter quantity"
                    value={formData.opening_qty}
                    onChange={(e) =>
                      setFormData({ ...formData, opening_qty: e.target.value })
                    }
                  />
                </div>

                {/* Per Unit Cost */}
                <div className="space-y-2">
                  <Label htmlFor="per_unit_cost">Per Unit Cost</Label>
                  <Input
                    id="per_unit_cost"
                    type="number"
                    placeholder="Enter cost"
                    value={formData.per_unit_cost}
                    onChange={(e) =>
                      setFormData({ ...formData, per_unit_cost: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => setFormData({ ...formData, date })}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? "Update" : "Save"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-muted">
              <Palette className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Designs</p>
              <p className="text-2xl font-bold">{totalItems}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <Palette className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Product Types</p>
              <p className="text-2xl font-bold">
                {new Set(designItems.map((d) => d.product_id)).size}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <Palette className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold">Rs. {totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">All Designs</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search designs..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className={cn("gap-2", hasActiveFilters && "border-primary")}
              onClick={() => setFilterDialogOpen(true)}
            >
              <Filter className="w-4 h-4" />
              Filter
              {hasActiveFilters && <span className="h-2 w-2 rounded-full bg-primary" />}
            </Button>
            <FilterDialog
              open={filterDialogOpen}
              onOpenChange={setFilterDialogOpen}
              onApply={applyFilters}
              initialDateRange={dateRange}
              initialKeyValues={keyValues}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Product</th>
                <th>Opening Qty</th>
                <th>Total Qty</th>
                <th>Avg Cost</th>
                <th>Unit</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {designItems.map((item) => (
                <tr key={item.id} className="animate-fade-in">
                  <td className="font-medium">{item.name}</td>
                  <td>
                    <span className="text-sm capitalize">
                      {item.product_name || getProductName(item.product_id)}
                    </span>
                  </td>
                  <td className="text-muted-foreground">{parseFloat(item.opening_qty).toLocaleString()}</td>
                  <td className="font-medium">{parseFloat(item.total_qty).toLocaleString()}</td>
                  <td className="font-medium text-success">
                    Rs. {parseFloat(item.avg_cost).toLocaleString()}
                  </td>
                  <td className="text-sm text-muted-foreground">
                    {item.unit}
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
                        <DropdownMenuItem onClick={() => handleEdit(item)}>Edit Design</DropdownMenuItem>
                        <DropdownMenuItem>Update Stock</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
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
            Showing {designItems.length} of {recordsTotal} designs
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
              1
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
