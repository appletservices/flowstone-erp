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
  openingQty: number;
  totalQty: number;
  convertedQty: number;
  unit: string;
  averageCost: number;
}

const units = ["Meter", "Feet", "Kilogram", "Gram", "Piece", "Dozen", "Spool"];

const initialItems: RawInventoryItem[] = [
  {
    id: "1",
    name: "Cotton Fabric Premium",
    openingQty: 500,
    totalQty: 850,
    convertedQty: 150,
    unit: "Meter",
    averageCost: 120,
  },
  {
    id: "2",
    name: "Silk Thread Gold",
    openingQty: 100,
    totalQty: 45,
    convertedQty: 55,
    unit: "Spool",
    averageCost: 250,
  },
  {
    id: "3",
    name: "Polyester Blend",
    openingQty: 300,
    totalQty: 420,
    convertedQty: 80,
    unit: "Meter",
    averageCost: 85,
  },
  {
    id: "4",
    name: "Wool Yarn",
    openingQty: 200,
    totalQty: 180,
    convertedQty: 70,
    unit: "Kilogram",
    averageCost: 450,
  },
  {
    id: "5",
    name: "Linen Fabric",
    openingQty: 150,
    totalQty: 220,
    convertedQty: 30,
    unit: "Meter",
    averageCost: 180,
  },
  {
    id: "6",
    name: "Embroidery Thread",
    openingQty: 500,
    totalQty: 380,
    convertedQty: 220,
    unit: "Spool",
    averageCost: 35,
  },
  {
    id: "7",
    name: "Cotton Thread White",
    openingQty: 1000,
    totalQty: 890,
    convertedQty: 310,
    unit: "Spool",
    averageCost: 25,
  },
  {
    id: "8",
    name: "Denim Fabric",
    openingQty: 400,
    totalQty: 520,
    convertedQty: 80,
    unit: "Meter",
    averageCost: 150,
  },
];

export default function RawInventory() {
  const navigate = useNavigate();
  const [items, setItems] = useState<RawInventoryItem[]>(initialItems);
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

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalValue = items.reduce((acc, item) => acc + item.totalQty * item.averageCost, 0);
  const totalItems = items.length;

  const handleSubmit = () => {
    if (!formData.name || !formData.unit || !formData.openingQty) {
      toast.error("Please fill in required fields");
      return;
    }

    if (editingItem) {
      setItems(items.map(i => 
        i.id === editingItem.id 
          ? {
              ...i,
              name: formData.name,
              openingQty: parseFloat(formData.openingQty) || 0,
              totalQty: parseFloat(formData.totalQty) || 0,
              convertedQty: parseFloat(formData.convertedQty) || 0,
              unit: formData.unit,
              averageCost: parseFloat(formData.averageCost) || 0,
            }
          : i
      ));
      toast.success("Item updated successfully");
    } else {
      setItems([...items, {
        id: Date.now().toString(),
        name: formData.name,
        openingQty: parseFloat(formData.openingQty) || 0,
        totalQty: parseFloat(formData.totalQty) || parseFloat(formData.openingQty) || 0,
        convertedQty: parseFloat(formData.convertedQty) || 0,
        unit: formData.unit,
        averageCost: parseFloat(formData.averageCost) || 0,
      }]);
      toast.success("Item added successfully");
    }

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
      openingQty: item.openingQty.toString(),
      totalQty: item.totalQty.toString(),
      convertedQty: item.convertedQty.toString(),
      unit: item.unit,
      averageCost: item.averageCost.toString(),
    });
    setDialogOpen(true);
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    setItems(items.filter(i => i.id !== itemToDelete.id));
    setDeleteDialogOpen(false);
    setItemToDelete(null);
    toast.success("Item deleted successfully");
  };

  const openDeleteDialog = (item: RawInventoryItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Raw Inventory</h1>
          <p className="text-muted-foreground">
            Manage raw materials and stock levels
          </p>
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
                    placeholder="0"
                    value={formData.openingQty}
                    onChange={(e) => setFormData({ ...formData, openingQty: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Qty</Label>
                  <Input
                    type="number"
                    placeholder="0"
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
                    placeholder="0"
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
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Average Cost (₹)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
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
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
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
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
              <p className="text-2xl font-bold">
                {items.filter(i => i.totalQty < i.openingQty * 0.2).length}
              </p>
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
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Inventory Table */}
      <div className="bg-card rounded-xl border border-border">
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
                <th className="text-right">Total Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="animate-fade-in">
                  <td className="font-medium">{item.name}</td>
                  <td className="text-right">{item.openingQty.toLocaleString()}</td>
                  <td className="text-right font-medium">{item.totalQty.toLocaleString()}</td>
                  <td className="text-right text-muted-foreground">{item.convertedQty.toLocaleString()}</td>
                  <td>{item.unit}</td>
                  <td className="text-right">₹{item.averageCost.toLocaleString()}</td>
                  <td className="text-right font-semibold">
                    ₹{(item.totalQty * item.averageCost).toLocaleString("en-IN")}
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
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/ledger/inventory/${item.id}`)}>
                          <BookOpen className="w-4 h-4 mr-2" />
                          View Ledger
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => openDeleteDialog(item)}
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
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredItems.length} of {items.length} items
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}