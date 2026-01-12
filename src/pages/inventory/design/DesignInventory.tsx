import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Plus,
  Pencil,
  MoreHorizontal,
  Trash2,
  BookOpen,
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

const url_ = new URL(`${import.meta.env.VITE_API_URL}`);

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
  code: string;
  product_id: string;
  opening_qty: string;
  per_unit_cost: string;
  date: Date | undefined;
}

const emptyFormData: FormData = {
  name: "",
  code: "",
  product_id: "",
  opening_qty: "",
  per_unit_cost: "",
  date: undefined,
};

export default function DesignInventory() {
   const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(emptyFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  const {
    data: designItems,
    isLoading,
    searchQuery,
    setSearchQuery,
    dateRange,
    keyValues,
    applyFilters,
    hasActiveFilters,
    refresh,
    pagination,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    nextPage,
    previousPage,
  } = useBackendSearch<DesignItem>({ 
    endpoint: "/inventory/design/list",
    pageSize: 10,
  });

  // Fetch products from dropdown API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(`${url_}/inventory/type/inventory`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();
        if (Array.isArray(result)) {
          setProducts(result);
        } else if (result.data) {
          setProducts(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);



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
        ? `${url_}/inventory/design/update`
        : `${url_}/inventory/design/store`;

      const payload = {
        ...(isEditing && { id: formData.id }),
        name: formData.name,
        code: formData.code,
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
        refresh();
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
      code: (item as any).code || "",
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

  // const getProductName = (productId: number) => {
  //   return products.find((p) => p.id === productId)?.name || String(productId);
  // };

  if (isLoading && designItems.length === 0) {
        return (
          <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        );
  }

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

              {/* Code */}
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  placeholder="Enter design code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
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

      {/* Table */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">All Designs</h3>
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
                placeholder="Search designs..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
             {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
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
                      {item.product_name}
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
                          <DropdownMenuItem onClick={() => handleEdit(item)}>
                            <Pencil className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/ledger/inventory/${item.id}`)}>
                              <BookOpen className="w-4 h-4 mr-2" /> View Ledger
                          </DropdownMenuItem>
                        <DropdownMenuItem> <Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
               {!isLoading && designItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">No items found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.totalRecords)} of {pagination.totalRecords} designs
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={previousPage} disabled={currentPage === 1}>
              Previous
            </Button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum: number;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className={currentPage === pageNum ? "bg-primary text-primary-foreground" : ""}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button variant="outline" size="sm" onClick={nextPage} disabled={currentPage === pagination.totalPages}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
