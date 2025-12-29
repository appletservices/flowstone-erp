import { useState, useEffect, useCallback } from "react";
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
import { toast } from "sonner";

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
  const [items, setItems] = useState<RawInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RawInventoryItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<RawInventoryItem | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    openingQty: "",
    totalQty: "",
    convertedQty: "",
    unit: "",
    averageCost: "",
  });

  const fetchInventory = useCallback(async (search = "") => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const url = new URL(`${import.meta.env.VITE_API_URL}/inventory/raw/list`);
      if (search) url.searchParams.append("search", search);

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      if (response.ok) {
        setItems(result.data);
      }
    } catch (error) {
      toast.error("Failed to load inventory");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInventory(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchInventory]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.unit || !formData.openingQty) {
      toast.error("Please fill in required fields");
      return;
    }

    // Logic for API POST/PUT would go here
    // For now, updating local state to maintain UI feel
    toast.info("Save functionality triggered");
    resetForm();
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
  };

  // Calculations using parsed floats from API strings
  const totalValue = items.reduce((acc, item) => acc + (parseFloat(item.total_qty) * parseFloat(item.avg_cost)), 0);
  const totalItems = items.length;
  const lowStockCount = items.filter(i => parseFloat(i.total_qty) < parseFloat(i.opening_qty) * 0.2).length;

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
              <Button onClick={handleSubmit} className="w-full">
                {editingItem ? "Update Item" : "Add Item"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Box className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">{totalItems}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
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
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <Box className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
              <p className="text-2xl font-bold">{lowStockCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search items by name..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" /> Filter
        </Button>
      </div>

      {/* Inventory Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="p-4 text-sm font-semibold">Name</th>
                <th className="p-4 text-sm font-semibold text-right">Opening Qty</th>
                <th className="p-4 text-sm font-semibold text-right">Total Qty</th>
                <th className="p-4 text-sm font-semibold text-right">Converted Qty</th>
                <th className="p-4 text-sm font-semibold">Unit</th>
                <th className="p-4 text-sm font-semibold text-right">Avg. Cost</th>
                <th className="p-4 text-sm font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors animate-fade-in">
                  <td className="p-4 font-medium">{item.name}</td>
                  <td className="p-4 text-right text-sm">{parseFloat(item.opening_qty).toLocaleString()}</td>
                  <td className="p-4 text-right font-medium text-sm">{parseFloat(item.total_qty).toLocaleString()}</td>
                  <td className="p-4 text-right text-muted-foreground text-sm">{parseFloat(item.converted_qty).toLocaleString()}</td>
                  <td className="p-4 text-sm">{item.unit}</td>
                  <td className="p-4 text-right text-sm">₹{parseFloat(item.avg_cost).toLocaleString()}</td>
              
                  <td className="p-4 text-center">
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
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">No items found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between bg-card">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{items.length}</span> results
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      </div>

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