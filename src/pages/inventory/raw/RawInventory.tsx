import { useState } from "react";
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

interface RawInventoryItem {
  id: string;
  name: string;
  opening_qty: string;
  total_qty: string;
  converted_qty: string;
  unit: string;
  avg_cost: string;
}

const units = ["Meter", "Feet", "Kilogram", "Gram", "Piece", "Dozen", "Spool", "MTR (36)", "GHz (36)"];

export default function RawInventory() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RawInventoryItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<RawInventoryItem | null>(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    openingQty: "",
    totalQty: "",
    convertedQty: "",
    unit: "",
    averageCost: "",
  });

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
    pagination,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    nextPage,
    previousPage,
  } = useBackendSearch<RawInventoryItem>({
    endpoint: "/inventory/raw/list",
    pageSize: 10,
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.unit || !formData.openingQty) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/inventory/raw/store`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          opening_qty: formData.openingQty,
          total_qty: formData.totalQty || formData.openingQty,
          converted_qty: formData.convertedQty || "0",
          unit: formData.unit,
          avg_cost: formData.averageCost || "0",
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        toast.success(editingItem ? "Item updated successfully" : "Item added successfully");
        resetForm();
        refresh();
      } else {
        toast.error(result.message || "Failed to save item");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to save item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      openingQty: "",
      totalQty: "",
      convertedQty: "",
      unit: "",
      averageCost: "",
    });
    setEditingItem(null);
    setDialogOpen(false);
  };

  const handleEdit = (item: RawInventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      openingQty: item.opening_qty,
      totalQty: item.total_qty,
      convertedQty: item.converted_qty,
      unit: item.unit,
      averageCost: item.avg_cost,
    });
    setDialogOpen(true);
  };

  const handleDelete = () => {
    toast.success("Item deleted successfully");
    setDeleteDialogOpen(false);
    refresh();
  };
  
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Raw Inventory</h1>
          <p className="text-muted-foreground">Manage raw materials and stock levels</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  placeholder="Enter item name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Opening Qty *</Label>
                  <Input
                    type="number"
                    value={formData.openingQty}
                    onChange={(e) => setFormData({ ...formData, openingQty: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Qty</Label>
                  <Input
                    type="number"
                    value={formData.totalQty}
                    onChange={(e) => setFormData({ ...formData, totalQty: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Converted Qty</Label>
                  <Input
                    type="number"
                    value={formData.convertedQty}
                    onChange={(e) => setFormData({ ...formData, convertedQty: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit *</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => setFormData({ ...formData, unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent className="bg-card">
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Average Cost (₹)</Label>
                <Input
                  type="number"
                  value={formData.averageCost}
                  onChange={(e) => setFormData({ ...formData, averageCost: e.target.value })}
                />
              </div>
              <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingItem ? "Update Item" : "Add Item"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}

      {/* Inventory Table with Search/Filter in Header */}
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
                <th className="text-right">Converted Qty</th>
                <th>Unit</th>
                <th className="text-right">Avg. Cost</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="animate-fade-in">
                  <td className="font-medium">{item.name}</td>
                  <td className="text-right text-muted-foreground">{parseFloat(item.opening_qty || "0").toLocaleString()}</td>
                  <td className="text-right font-medium">{parseFloat(item.total_qty || "0").toLocaleString()}</td>
                  <td className="text-right text-muted-foreground">{parseFloat(item.converted_qty || "0").toLocaleString()}</td>
                  <td className="text-sm">{item.unit}</td>
                  <td className="text-right font-medium text-success">₹{parseFloat(item.avg_cost || "0").toLocaleString()}</td>
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
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => { setItemToDelete(item); setDeleteDialogOpen(true); }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {!isLoading && items.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">No items found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.totalRecords)} of {pagination.totalRecords} results
            </p>
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
          { key: "unit", label: "Unit", placeholder: "e.g. Meter, Kilogram" },
          { key: "low_stock", label: "Low Stock Only", placeholder: "true or false" },
        ]}
        initialDateRange={dateRange}
        initialKeyValues={keyValues}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{itemToDelete?.name}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
