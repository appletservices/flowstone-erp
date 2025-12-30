import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Scissors,
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

// --- API Response Data ---
const apiResponse = {
  data: [
    {
      id: 22,
      name: "ASTAR TOKERY LARGE 35 GSM",
      opening_qty: "218.00000000",
      converted_qty: "218.00000000",
      total_qty: "218.00000000",
      opening_cost: "109000.000000",
      avg_cost: "109000.000000",
      unit: "Pcs",
    },
    {
      id: 23,
      name: "ASTAR INDAIN SMALL 25 GSM",
      opening_qty: "200.00000000",
      converted_qty: "200.00000000",
      total_qty: "200.00000000",
      opening_cost: "100000.000000",
      avg_cost: "100000.000000",
      unit: "Pcs",
    },
  ],
  recordsTotal: 2,
  recordsFiltered: 2,
  draw: null,
};

const products = [
  "Silk Saree",
  "Cotton Saree",
  "Embroidered Suit",
  "Designer Lehenga",
  "Printed Dupatta",
  "Woolen Shawl",
  "Linen Kurta",
];

export default function FinishInventory() {
  const navigate = useNavigate();
  const [items, setItems] = useState(apiResponse.data);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    product: "",
    date: "",
    openingBalance: "",
    openingCost: "",
    quantity: "",
  });

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Dynamic Summary Calculations
  const totalValue = items.reduce(
    (acc, item) => acc + parseFloat(item.total_qty) * parseFloat(item.avg_cost),
    0
  );
  const totalItems = items.length;

  const handleSubmit = () => {
    if (!formData.name || !formData.product) {
      toast.error("Please fill in required fields");
      return;
    }
    toast.success(editingItem ? "Item updated successfully" : "Item added successfully");
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      product: "",
      date: "",
      openingBalance: "",
      openingCost: "",
      quantity: "",
    });
    setEditingItem(null);
    setDialogOpen(false);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      product: products[0],
      date: "",
      openingBalance: item.opening_cost,
      openingCost: item.avg_cost,
      quantity: item.total_qty,
    });
    setDialogOpen(true);
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    setItems(items.filter((i) => i.id !== itemToDelete.id));
    setDeleteDialogOpen(false);
    setItemToDelete(null);
    toast.success("Item deleted successfully");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Katae Product</h1>
          <p className="text-muted-foreground">Manage katae products and stock levels</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Add Item
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
                  <Label>Product *</Label>
                  <Select onValueChange={(v) => setFormData({ ...formData, product: v })}>
                    <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                    <SelectContent className="bg-card">
                      {products.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                </div>
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
              <Scissors className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">{totalItems}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10">
              <Scissors className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold">Rs. {totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/10">
              <Scissors className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
              <p className="text-2xl font-bold">
                {items.filter(i => parseFloat(i.total_qty) < 50).length}
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
            placeholder="Search items..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2"><Filter className="w-4 h-4" /> Filter</Button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="p-4 text-xs font-bold uppercase text-muted-foreground">Name</th>
                <th className="p-4 text-xs font-bold uppercase text-muted-foreground text-right">Opening-Qty </th>
                <th className="p-4 text-xs font-bold uppercase text-muted-foreground text-right">Total-Qty </th>
                <th className="p-4 text-xs font-bold uppercase text-muted-foreground">Unit</th>
                <th className="p-4 text-xs font-bold uppercase text-muted-foreground text-right">Average Cost</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-b border-border hover:bg-muted/5 transition-colors">
                  <td className="p-4 font-medium">{item.name}</td>
                  <td className="p-4 text-right">{parseFloat(item.opening_qty).toLocaleString()}</td>
                  <td className="p-4 text-right font-bold">{parseFloat(item.total_qty).toLocaleString()}</td>
                  
                  <td className="p-4 text-sm">{item.unit}</td>
                  <td className="p-4 text-right">Rs. {parseFloat(item.avg_cost).toLocaleString()}</td>
                
                  <td className="p-4 text-right">
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
            </tbody>
          </table>
        </div>
      </div>

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