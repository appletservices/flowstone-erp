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

interface FinishedProductItem {
  id: string;
  name: string;
  date: string;
  opening_qty: string;
  opening_cost: string;
  total_qty: string;
  unit: string;
  avg_cost: string;
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FinishedProductItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<FinishedProductItem | null>(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<InventoryOption[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    date: new Date().toISOString().split('T')[0],
    openingQty: "",
    openingCost: "",
  });
  
  const [itemRows, setItemRows] = useState<ItemRow[]>([
    { id: "1", inventoryId: "", quantity: "" }
  ]);

  // Fetch inventory items for dropdown
  useEffect(() => {
    const fetchInventoryItems = async () => {
      setIsLoadingInventory(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/inventory/dropdown`);
        const result = await response.json();
        if (result.status && result.data) {
          setInventoryItems(result.data);
        }
      } catch (error) {
        console.error("Error fetching inventory items:", error);
      } finally {
        setIsLoadingInventory(false);
      }
    };
    fetchInventoryItems();
  }, []);

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

  const totalValue = products.reduce((acc, p) => acc + parseFloat(p.total_qty || "0") * parseFloat(p.avg_cost || "0"), 0);
  const totalProducts = products.length;

  const addItemRow = () => {
    setItemRows([
      ...itemRows,
      { id: Date.now().toString(), inventoryId: "", quantity: "" }
    ]);
  };

  const removeItemRow = (id: string) => {
    if (itemRows.length > 1) {
      setItemRows(itemRows.filter(row => row.id !== id));
    }
  };

  const updateItemRow = (id: string, field: keyof ItemRow, value: string) => {
    setItemRows(itemRows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.date || !formData.openingQty || !formData.openingCost) {
      toast.error("Please fill in all required fields");
      return;
    }

    const validItems = itemRows.filter(row => row.inventoryId && row.quantity);
    if (validItems.length === 0) {
      toast.error("Please add at least one item");
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

      const response = await fetch(`${import.meta.env.VITE_API_URL}/inventory/finish/store`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      console.error("Error saving product:", error);
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

  const handleEdit = (product: FinishedProductItem) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      date: product.date,
      openingQty: product.opening_qty,
      openingCost: product.opening_cost,
    });
    setDialogOpen(true);
  };

  const handleDelete = () => {
    if (!productToDelete) return;
    setDeleteDialogOpen(false);
    setProductToDelete(null);
    toast.success("Product deleted successfully");
    refresh();
  };

  const openDeleteDialog = (product: FinishedProductItem) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Finished Products</h1>
          <p className="text-muted-foreground">
            Manage finished products and their inventory components
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* First Row: Name, Date, Opening Qty, Opening Cost */}
              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    placeholder="Product name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Opening Qty *</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.openingQty}
                    onChange={(e) => setFormData({ ...formData, openingQty: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Opening Cost *</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.openingCost}
                    onChange={(e) => setFormData({ ...formData, openingCost: e.target.value })}
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Inventory Items</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addItemRow}
                    className="gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {itemRows.map((row, index) => (
                    <div key={row.id} className="flex items-end gap-3">
                      <div className="flex-1 space-y-1">
                        {index === 0 && <Label className="text-xs text-muted-foreground">Item</Label>}
                        <Select
                          value={row.inventoryId}
                          onValueChange={(value) => updateItemRow(row.id, "inventoryId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select inventory item" />
                          </SelectTrigger>
                          <SelectContent className="bg-card">
                            {isLoadingInventory ? (
                              <div className="flex items-center justify-center p-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                              </div>
                            ) : (
                              inventoryItems.map((item) => (
                                <SelectItem key={item.id} value={String(item.id)}>
                                  {item.name} {item.unit ? `(${item.unit})` : ''}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-28 space-y-1">
                        {index === 0 && <Label className="text-xs text-muted-foreground">Quantity</Label>}
                        <Input
                          type="number"
                          placeholder="0"
                          value={row.quantity}
                          onChange={(e) => updateItemRow(row.id, "quantity", e.target.value)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItemRow(row.id)}
                        disabled={itemRows.length === 1}
                        className="h-10 w-10 text-muted-foreground hover:text-destructive"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
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
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Box className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold">{pagination.totalRecords}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <Box className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold">₹{totalValue.toLocaleString("en-IN")}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <Box className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Products</p>
              <p className="text-2xl font-bold">
                {products.filter(p => parseFloat(p.total_qty || "0") < parseFloat(p.opening_qty || "0") * 0.2).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">All Products</h3>
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
                placeholder="Search products..." 
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
                <th className="text-right">Avg. Cost</th>
                <th className="text-right">Total Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="animate-fade-in">
                  <td className="font-medium">{product.name}</td>
                  <td className="text-right">{parseFloat(product.opening_qty || "0").toLocaleString()}</td>
                  <td className="text-right font-medium">{parseFloat(product.total_qty || "0").toLocaleString()}</td>
                  <td>{product.unit}</td>
                  <td className="text-right">₹{parseFloat(product.avg_cost || "0").toLocaleString()}</td>
                  <td className="text-right font-semibold">
                    ₹{(parseFloat(product.total_qty || "0") * parseFloat(product.avg_cost || "0")).toLocaleString("en-IN")}
                  </td>
                  <td>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card">
                        <DropdownMenuItem onClick={() => handleEdit(product)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/ledger/product/${product.id}`)}>
                          <BookOpen className="w-4 h-4 mr-2" />
                          View Ledger
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => openDeleteDialog(product)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {!isLoading && products.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">No products found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.totalRecords)} of {pagination.totalRecords} products
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

      {/* Filter Dialog */}
      <FilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        onApply={applyFilters}
        showDateRange={false}
        filterFields={[
          { key: "unit", label: "Unit", placeholder: "e.g. Piece" },
        ]}
        initialDateRange={dateRange}
        initialKeyValues={keyValues}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
