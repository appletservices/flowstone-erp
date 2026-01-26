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
import { SearchableSelect } from "@/components/ui/searchable-select";
import { usePageHeader } from "@/hooks/usePageHeader";

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
  const { setHeaderInfo } = usePageHeader();
  
  // Set page header on mount
  useState(() => {
    setHeaderInfo({ title: "Raw Inventory", subtitle: "Manage raw materials and stock levels" });
  });
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RawInventoryItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<RawInventoryItem | null>(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingEdit, setIsFetchingEdit] = useState(false);
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
      
      // Select endpoint based on whether we are editing or creating
      const endpoint = editingItem 
        ? `${import.meta.env.VITE_API_URL}/inventory/raw/update` 
        : `${import.meta.env.VITE_API_URL}/inventory/raw/store`;

      const bodyPayload = {
        name: formData.name,
        unit_id: formData.unit_id,
        date: formData.date,
        opening_qty: formData.opening_qty,
        per_unit_cost: formData.per_unit_cost || "0",
        ...(editingItem && { id: editingItem.id }) // Include ID only if updating
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyPayload),
      });

      const result = await response.json();
      
      if (result.status || response.ok) {
        toast.success(editingItem ? "Item updated successfully" : "Item added successfully");
      resetForm();
  await refresh(); // ensure refetch
      } else {
        toast.error(result.message || "Failed to save item");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("An error occurred while saving the item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/inventory/delete`, {
        method: "delete",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: itemToDelete.id }),
      });

      const result = await response.json();

      if (result.status || response.ok) {
        toast.success("Item deleted successfully");
        refresh();
      } else {
        toast.error(result.message || "Failed to delete item");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete item");
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
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

const handleEdit = async (item: RawInventoryItem) => {
    setIsFetchingEdit(true);
    setEditingItem(item);
    
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/inventory/raw/edit/${item.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      const result = await response.json();

      if (result) {
        // Only update the form data with trimmed values
        setFormData({
          name: result.name || "",
          unit_id: result.unit_id ? String(result.unit_id) : "",
          date: new Date().toISOString().split('T')[0], 
          opening_qty: result.opening_qty ? parseFloat(result.opening_qty).toString() : "",
          per_unit_cost: result.perunitcost ? parseFloat(result.perunitcost).toString() : "",
        });
        setDialogOpen(true);
      }
    } catch (error) {
      console.error("Error fetching item details:", error);
      toast.error("Failed to load item details");
    } finally {
      setIsFetchingEdit(false);
    }
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
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) resetForm();
      }}>
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
                <SearchableSelect
                  options={units.map((unit) => ({
                    value: String(unit.id),
                    label: unit.name,
                  }))}
                  value={formData.unit_id}
                  onValueChange={(value) => setFormData({ ...formData, unit_id: value })}
                  placeholder="Select unit"
                  searchPlaceholder="Search units..."
                  isLoading={isLoadingUnits}
                />
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
            <Button className="gap-2" onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4" />
              Add Item
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

        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.totalRecords)} of {pagination.totalRecords} results
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={previousPage} disabled={currentPage === 1}>
              Previous
            </Button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum = pagination.totalPages <= 5 ? i + 1 : (currentPage <= 3 ? i + 1 : (currentPage >= pagination.totalPages - 2 ? pagination.totalPages - 4 + i : currentPage - 2 + i));
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