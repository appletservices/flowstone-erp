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
  Loader2,
  Calendar,
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

interface UnitOption {
  id: number;
  name: string;
}

export default function RawInventory() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RawInventoryItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<RawInventoryItem | null>(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [units, setUnits] = useState<UnitOption[]>([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    unit_id: "",
    date: new Date().toISOString().split('T')[0],
    opening_qty: "",
    per_unit_cost: "",
  });

  // Fetch units from API
  useEffect(() => {
    const fetchUnits = async () => {
      setIsLoadingUnits(true);
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/setup/units-dropdown`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await response.json();
        if (result.status && result.data) {
          setUnits(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch units:", error);
      } finally {
        setIsLoadingUnits(false);
      }
    };
    fetchUnits();
  }, []);

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
    if (!formData.name || !formData.unit_id || !formData.opening_qty || !formData.date) {
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
          unit_id: formData.unit_id,
          date: formData.date,
          opening_qty: formData.opening_qty,
          per_unit_cost: formData.per_unit_cost || "0",
        }),
      });

      const result = await response.json();
      
      if (result.status || response.ok) {
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
      unit_id: "",
      date: new Date().toISOString().split('T')[0],
      opening_qty: "",
      per_unit_cost: "",
    });
    setEditingItem(null);
    setDialogOpen(false);
  };

  const handleEdit = (item: RawInventoryItem) => {
    setEditingItem(item);
    // Find unit id from units list by name
    const unitMatch = units.find(u => u.name === item.unit);
    setFormData({
      name: item.name,
      unit_id: unitMatch ? String(unitMatch.id) : "",
      date: new Date().toISOString().split('T')[0],
      opening_qty: item.opening_qty,
      per_unit_cost: item.avg_cost,
    });
    setDialogOpen(true);
  };

  const handleDelete = () => {
    toast.success("Item deleted successfully");
    setDeleteDialogOpen(false);
    refresh();
  };

   if (isLoading && items.length === 0) {
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
                  <Label>Unit *</Label>
                  <Select
                    value={formData.unit_id}
                    onValueChange={(value) => setFormData({ ...formData, unit_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingUnits ? "Loading..." : "Select unit"} />
                    </SelectTrigger>
                    <SelectContent className="bg-card">
                      {units.map((unit) => (
                        <SelectItem key={unit.id} value={String(unit.id)}>{unit.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="date"
                      className="pl-10"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Opening Qty *</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.opening_qty}
                    onChange={(e) => setFormData({ ...formData, opening_qty: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Per Unit Cost (₹)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.per_unit_cost}
                    onChange={(e) => setFormData({ ...formData, per_unit_cost: e.target.value })}
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

      {/* Summary Cards */}

      {/* Inventory Table with Search/Filter in Header */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">All Items</h3>
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
