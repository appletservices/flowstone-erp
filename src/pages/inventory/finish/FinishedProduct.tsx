import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Search,
  Filter,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  MoreHorizontal,
  Minus,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useBackendSearch } from "@/hooks/useBackendSearch";
import { FilterDialog } from "@/components/filters/FilterDialog";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { usePageHeader } from "@/hooks/usePageHeader";

interface FinishedProductItem {
  id: number;
  name: string;
  opening_qty: string;
  total_qty: string;
  opening_cost: string;
  avg_cost: string;
  unit: string;
}

interface ItemRow {
  id: string;
  inventoryId: string;
  quantity: string;
}

interface InventoryOption {
  id: number;
  name: string;
  unit?: string;
}

export default function FinishedProduct() {
  const navigate = useNavigate();
  const { setHeaderInfo } = usePageHeader();

  // Set page header on mount
  useState(() => {
    setHeaderInfo({ title: "Finished Products", subtitle: "Manage finished products and components" });
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FinishedProductItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<FinishedProductItem | null>(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<InventoryOption[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingEdit, setIsFetchingEdit] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    date: new Date().toISOString().split('T')[0],
    openingQty: "",
    openingCost: "",
  });

  const [itemRows, setItemRows] = useState<ItemRow[]>([
    { id: "1", inventoryId: "", quantity: "" }
  ]);

  const {
    data: products,
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
  } = useBackendSearch<FinishedProductItem>({
    endpoint: "/inventory/finish/list",
    pageSize: 10,
  });

  useEffect(() => {
    const fetchInventoryItems = async () => {
      setIsLoadingInventory(true);
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/inventory/dropdown`, {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();
        if (result) setInventoryItems(result);
      } catch (error) {
        console.error("Error fetching inventory items:", error);
      } finally {
        setIsLoadingInventory(false);
      }
    };
    fetchInventoryItems();
  }, []);

  const totalValue = products.reduce((acc, p) => acc + (parseFloat(p.total_qty || "0") * parseFloat(p.avg_cost || "0")), 0);

  const addItemRow = () => {
    setItemRows([...itemRows, { id: crypto.randomUUID(), inventoryId: "", quantity: "" }]);
  };

  const removeItemRow = (id: string) => {
    if (itemRows.length > 1) {
      setItemRows(itemRows.filter(row => row.id !== id));
    }
  };

  const updateItemRow = (id: string, field: keyof ItemRow, value: string) => {
    setItemRows(itemRows.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const handleEdit = async (product: FinishedProductItem) => {
    setIsFetchingEdit(true);
    setEditingProduct(product);

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/inventory/finish/edit/${product.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (result) {
        // API format: DD-MM-YYYY -> Input format: YYYY-MM-DD
        let formattedDate = new Date().toISOString().split('T')[0];
        if (result.date) {
          const parts = result.date.split("-");
          if (parts.length === 3) {
            formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
          }
        }

        // Use parseFloat().toString() to trim trailing zeros (e.g., "50.0000" -> "50")
        setFormData({
          name: result.name || "",
          date: formattedDate,
          openingQty: result.opening_qty ? parseFloat(result.opening_qty).toString() : "",
          openingCost: result.opening_cost ? parseFloat(result.opening_cost).toString() : "",
        });

        const mappedRows = result.items?.map((item: any) => ({
          id: crypto.randomUUID(),
          inventoryId: String(item.inventory_id),
          quantity: item.quantity ? parseFloat(item.quantity).toString() : "",
        }));

        setItemRows(mappedRows?.length > 0 ? mappedRows : [{ id: "1", inventoryId: "", quantity: "" }]);
        setDialogOpen(true);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      toast.error("Failed to load product details");
    } finally {
      setIsFetchingEdit(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.date || !formData.openingQty || !formData.openingCost) {
      toast.error("Please fill in all required fields");
      return;
    }

    const validItems = itemRows.filter(row => row.inventoryId && row.quantity);
    if (validItems.length === 0) {
      toast.error("Please add at least one item (BOM)");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        date: formData.date,
        opening_qty: formData.openingQty,
        opening_cost: formData.openingCost,
        items: validItems.map(item => ({
          inventory_id: item.inventoryId,
          quantity: item.quantity,
        })),
      };

      const token = localStorage.getItem("auth_token");
      const url = editingProduct
        ? `${import.meta.env.VITE_API_URL}/inventory/finish/update/${editingProduct.id}`
        : `${import.meta.env.VITE_API_URL}/inventory/finish/store`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.status || result.success) {
        toast.success(editingProduct ? "Product updated successfully" : "Product added successfully");
        resetForm();
        refresh();
      } else {
        toast.error(result.message || "Failed to save product");
      }
    } catch (error) {
      toast.error("Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      date: new Date().toISOString().split('T')[0],
      openingQty: "",
      openingCost: "",
    });
    setItemRows([{ id: "1", inventoryId: "", quantity: "" }]);
    setEditingProduct(null);
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      const token = localStorage.getItem("auth_token");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/inventory/finish/delete`, {
        method: "delete",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: productToDelete.id }),
      });
      if (response.ok) {
        toast.success("Product deleted successfully");
        refresh();
      }
    } catch (e) {
      toast.error("Failed to delete");
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  if (isLoading && products.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!isFetchingEdit) { setDialogOpen(open); if (!open) resetForm(); } }}>
        <DialogContent className="bg-card sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input placeholder="Product name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Opening Qty *</Label>
                <Input type="number" placeholder="0" value={formData.openingQty} onChange={(e) => setFormData({ ...formData, openingQty: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Opening Cost *</Label>
                <Input type="number" placeholder="0.00" value={formData.openingCost} onChange={(e) => setFormData({ ...formData, openingCost: e.target.value })} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Inventory Items (BOM)</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItemRow} className="gap-1"><Plus className="w-4 h-4" /> Add Item</Button>
              </div>
              <div className="space-y-2">
                {itemRows.map((row, index) => (
                  <div key={row.id} className="flex items-end gap-3 animate-in fade-in slide-in-from-top-1">
                    <div className="flex-1">
                      {index === 0 && <Label className="text-xs mb-1 block">Item</Label>}
                      <SearchableSelect
                        options={inventoryItems.map((item) => ({
                          value: String(item.id),
                          label: `${item.name}${item.unit ? ` (${item.unit})` : ''}`,
                        }))}
                        value={row.inventoryId}
                        onValueChange={(val) => updateItemRow(row.id, "inventoryId", val)}
                        placeholder="Select inventory item"
                        searchPlaceholder="Search inventory..."
                        isLoading={isLoadingInventory}
                      />
                    </div>
                    <div className="w-28">
                      {index === 0 && <Label className="text-xs mb-1 block">Quantity</Label>}
                      <Input type="number" placeholder="0" value={row.quantity} onChange={(e) => updateItemRow(row.id, "quantity", e.target.value)} />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeItemRow(row.id)} disabled={itemRows.length === 1} className="text-muted-foreground hover:text-destructive"><Minus className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingProduct ? "Update Product" : "Add Product"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">Inventory List</h3>
          <div className="flex items-center gap-4">
            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger className="w-[100px] h-8"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-card">
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="25">25 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
                <SelectItem value="100">100 / page</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search products..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Button variant="outline" size="sm" className={cn("gap-2", hasActiveFilters && "border-primary text-primary")} onClick={() => setFilterDialogOpen(true)}>
              <Filter className="w-4 h-4" /> Filter
              {hasActiveFilters && <Badge variant="secondary" className="ml-1 h-5 px-1.5">Active</Badge>}
            </Button>
            <Button className="gap-2" onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4" /> Add Product
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
                <th className="text-right">Avg. Cost</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="animate-fade-in">
                  <td className="font-medium">{product.name}</td>
                  <td className="text-right text-muted-foreground">{parseFloat(product.opening_qty || "0").toLocaleString()}</td>
                  <td className="text-right font-medium">{parseFloat(product.total_qty || "0").toLocaleString()}</td>
                  <td className="text-sm">{product.unit}</td>
                  <td className="text-right font-medium text-success">₹{parseFloat(product.avg_cost || "0").toLocaleString()}</td>
                  <td>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card">
                        <DropdownMenuItem onClick={() => handleEdit(product)}>
                          <Pencil className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/ledger/inventory/${product.id}`)}>
                          <BookOpen className="w-4 h-4 mr-2" /> View Ledger
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => { setProductToDelete(product); setDeleteDialogOpen(true); }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {!isLoading && products.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">No products found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.totalRecords)} of {pagination.totalRecords} results
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={previousPage} disabled={currentPage === 1}>
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={nextPage} disabled={currentPage === pagination.totalPages}>
              Next
            </Button>
          </div>
        </div>
      </div>

      <FilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        onApply={applyFilters}
        showDateRange={false}
        filterFields={[{ key: "unit", label: "Unit", placeholder: "e.g. Pcs" }]}
        initialDateRange={dateRange}
        initialKeyValues={keyValues}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete "{productToDelete?.name}"?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isFetchingEdit && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}