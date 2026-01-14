import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useBackendSearch } from "@/components/filters/useBackendSearch";
import { FilterDialog } from "@/components/filters/FilterDialog";
import { SearchableSelect } from "@/components/ui/searchable-select";

const url_ = new URL(`${import.meta.env.VITE_API_URL}`);

interface KataeItem {
  id: number;
  name: string;
  opening_qty: string;
  converted_qty: string;
  total_qty: string;
  opening_cost: string;
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
  date: string;
  opening_qty: string;
  opening_cost: string;
  product_qty: string;
}

const emptyFormData: FormData = {
  name: "",
  product_id: "",
  date: "",
  opening_qty: "",
  opening_cost: "",
  product_qty: "",
};

export default function KataeProduct() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KataeItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<KataeItem | null>(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(emptyFormData);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: items,
    isLoading,
    searchQuery,
    setSearchQuery,
    dateRange,
    keyValues,
    applyFilters,
    hasActiveFilters,
    refresh,
  } = useBackendSearch<KataeItem>({
    endpoint: "/inventory/katae/list",
  });

  // Fetch product dropdowns
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
        if (response.ok) {
          const productData = Array.isArray(result) ? result : result.data || [];
          setProducts(productData);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };
    fetchProducts();
  }, []);

  const handleSubmit = async () => {
    if (!formData.name || !formData.product_id) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("auth_token");
      const endpoint = editingItem 
        ? `${url_}/inventory/katae/update`
        : `${url_}/inventory/katae/store`;

      const payload = {
        ...(editingItem && { id: formData.id }),
        name: formData.name,
        product_id: formData.product_id,
        date: formData.date,
        opening_qty: formData.opening_qty,
        opening_cost: formData.opening_cost,
        product_qty: formData.product_qty,
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
        toast.success(editingItem ? "Item updated successfully" : "Item added successfully");
        resetForm();
        refresh();
      } else {
        toast.error(result.message || "Failed to save item");
      }
    } catch (error) {
      toast.error("An error occurred while saving");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(emptyFormData);
    setEditingItem(null);
    setDialogOpen(false);
  };

  const handleEdit = async (item: KataeItem) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${url_}/inventory/katae/edit/${item.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();

      if (response.ok && result.length > 0) {
        const detail = result[0];
        
        // Convert DD-MM-YYYY to YYYY-MM-DD for the date input
        let formattedDate = "";
        if (detail.tdate) {
          const [day, month, year] = detail.tdate.split("-");
          formattedDate = `${year}-${month}-${day}`;
        }

        setEditingItem(item);
        setFormData({
          id: item.id,
          name: detail.name,
          product_id: String(detail.product_id),
          date: formattedDate,
          opening_qty: detail.opening_qty,
          opening_cost: detail.opening_cost,
          product_qty: detail.product_qty,
        });
        setDialogOpen(true);
      } else {
        toast.error("Failed to fetch item details");
      }
    } catch (error) {
      console.error("Edit fetch error:", error);
      toast.error("An error occurred while fetching details");
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${url_}/inventory/katae/delete`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: itemToDelete.id }),
      });

      if (response.ok) {
        toast.success("Item deleted successfully");
        refresh();
      } else {
        toast.error("Failed to delete item");
      }
    } catch (error) {
      toast.error("An error occurred while deleting");
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Katae Product</h1>
          <p className="text-muted-foreground">Manage katae products and stock levels</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4" /> Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    placeholder="Enter item name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input 
                    type="date" 
                    value={formData.date} 
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product *</Label>
                  <SearchableSelect
                    options={products.map((p) => ({
                      value: String(p.id),
                      label: p.name,
                    }))}
                    value={formData.product_id}
                    onValueChange={(v) => setFormData({ ...formData, product_id: v })}
                    placeholder="Select product"
                    searchPlaceholder="Search products..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Product Qty</Label>
                  <Input
                    type="number"
                    placeholder="Enter product quantity"
                    value={formData.product_qty}
                    onChange={(e) => setFormData({ ...formData, product_qty: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Opening Qty</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.opening_qty}
                    onChange={(e) => setFormData({ ...formData, opening_qty: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Opening Cost</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.opening_cost}
                    onChange={(e) => setFormData({ ...formData, opening_cost: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingItem ? "Update Item" : "Add Item"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">All Items</h3>
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
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            <Button
              variant="outline"
              size="sm"
              className={cn("gap-2", hasActiveFilters && "border-primary text-primary")}
              onClick={() => setFilterDialogOpen(true)}
            >
              <Filter className="w-4 h-4" />
              Filter
              {hasActiveFilters && <Badge variant="secondary" className="ml-1 h-5 px-1.5">Active</Badge>}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th className="text-right">Opening Qty</th>
                <th className="text-right">Total Qty</th>
                <th>Unit</th>
                <th className="text-right">Average Cost</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="animate-fade-in">
                  <td className="font-medium">{item.name}</td>
                  <td className="text-right text-muted-foreground">{parseFloat(item.opening_qty || "0").toLocaleString()}</td>
                  <td className="text-right font-bold">{parseFloat(item.total_qty || "0").toLocaleString()}</td>
                  <td className="text-sm">{item.unit}</td>
                  <td className="text-right font-medium text-success">Rs. {parseFloat(item.avg_cost || "0").toLocaleString()}</td>
                  <td>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card">
                        <DropdownMenuItem onClick={() => handleEdit(item)}><Pencil className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/ledger/inventory/${item.id}`)}><BookOpen className="w-4 h-4 mr-2" /> View Ledger</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => { setItemToDelete(item); setDeleteDialogOpen(true); }} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {!isLoading && items.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">No items found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing {items.length} results
          </p>
        </div>
      </div>

      <FilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        onApply={applyFilters}
        showDateRange={false}
        filterFields={[{ key: "unit", label: "Unit", placeholder: "e.g. Pcs, Meter" }]}
        initialDateRange={dateRange}
        initialKeyValues={keyValues}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete "{itemToDelete?.name}"?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}