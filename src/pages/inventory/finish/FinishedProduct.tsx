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
  Minus,
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

interface FinishedProductItem {
  id: string;
  name: string;
  date: string;
  openingQty: number;
  openingCost: number;
  totalQty: number;
  unit: string;
  averageCost: number;
  items: { inventoryId: string; inventoryName: string; quantity: number }[];
}

interface ItemRow {
  id: string;
  inventoryId: string;
  quantity: string;
}

// Sample inventory items for selection
const inventoryItems = [
  { id: "1", name: "Cotton Fabric Premium", unit: "Meter" },
  { id: "2", name: "Silk Thread Gold", unit: "Spool" },
  { id: "3", name: "Polyester Blend", unit: "Meter" },
  { id: "4", name: "Wool Yarn", unit: "Kilogram" },
  { id: "5", name: "Linen Fabric", unit: "Meter" },
  { id: "6", name: "Embroidery Thread", unit: "Spool" },
  { id: "7", name: "Cotton Thread White", unit: "Spool" },
  { id: "8", name: "Denim Fabric", unit: "Meter" },
];

const initialProducts: FinishedProductItem[] = [
  {
    id: "1",
    name: "Premium Cotton Shirt",
    date: "2024-01-15",
    openingQty: 100,
    openingCost: 450,
    totalQty: 150,
    unit: "Piece",
    averageCost: 480,
    items: [
      { inventoryId: "1", inventoryName: "Cotton Fabric Premium", quantity: 2 },
      { inventoryId: "7", inventoryName: "Cotton Thread White", quantity: 1 },
    ],
  },
  {
    id: "2",
    name: "Silk Embroidered Kurta",
    date: "2024-01-20",
    openingQty: 50,
    openingCost: 1200,
    totalQty: 75,
    unit: "Piece",
    averageCost: 1350,
    items: [
      { inventoryId: "2", inventoryName: "Silk Thread Gold", quantity: 3 },
      { inventoryId: "6", inventoryName: "Embroidery Thread", quantity: 5 },
    ],
  },
  {
    id: "3",
    name: "Denim Jeans Classic",
    date: "2024-02-01",
    openingQty: 200,
    openingCost: 650,
    totalQty: 280,
    unit: "Piece",
    averageCost: 680,
    items: [
      { inventoryId: "8", inventoryName: "Denim Fabric", quantity: 1.5 },
      { inventoryId: "7", inventoryName: "Cotton Thread White", quantity: 2 },
    ],
  },
  {
    id: "4",
    name: "Wool Sweater",
    date: "2024-02-10",
    openingQty: 80,
    openingCost: 850,
    totalQty: 95,
    unit: "Piece",
    averageCost: 920,
    items: [
      { inventoryId: "4", inventoryName: "Wool Yarn", quantity: 0.5 },
    ],
  },
  {
    id: "5",
    name: "Linen Summer Dress",
    date: "2024-02-15",
    openingQty: 60,
    openingCost: 780,
    totalQty: 85,
    unit: "Piece",
    averageCost: 820,
    items: [
      { inventoryId: "5", inventoryName: "Linen Fabric", quantity: 2.5 },
      { inventoryId: "6", inventoryName: "Embroidery Thread", quantity: 2 },
    ],
  },
];

export default function FinishedProduct() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<FinishedProductItem[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FinishedProductItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<FinishedProductItem | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    openingQty: "",
    openingCost: "",
  });
  
  const [itemRows, setItemRows] = useState<ItemRow[]>([
    { id: "1", inventoryId: "", quantity: "" }
  ]);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalValue = products.reduce((acc, p) => acc + p.totalQty * p.averageCost, 0);
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

  const handleSubmit = () => {
    if (!formData.name || !formData.date || !formData.openingQty || !formData.openingCost) {
      toast.error("Please fill in all required fields");
      return;
    }

    const validItems = itemRows.filter(row => row.inventoryId && row.quantity);
    if (validItems.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    const items = validItems.map(row => {
      const inv = inventoryItems.find(i => i.id === row.inventoryId);
      return {
        inventoryId: row.inventoryId,
        inventoryName: inv?.name || "",
        quantity: parseFloat(row.quantity) || 0,
      };
    });

    if (editingProduct) {
      setProducts(products.map(p => 
        p.id === editingProduct.id 
          ? {
              ...p,
              name: formData.name,
              date: formData.date,
              openingQty: parseFloat(formData.openingQty) || 0,
              openingCost: parseFloat(formData.openingCost) || 0,
              items,
            }
          : p
      ));
      toast.success("Product updated successfully");
    } else {
      const newProduct: FinishedProductItem = {
        id: Date.now().toString(),
        name: formData.name,
        date: formData.date,
        openingQty: parseFloat(formData.openingQty) || 0,
        openingCost: parseFloat(formData.openingCost) || 0,
        totalQty: parseFloat(formData.openingQty) || 0,
        unit: "Piece",
        averageCost: parseFloat(formData.openingCost) || 0,
        items,
      };
      setProducts([...products, newProduct]);
      toast.success("Product added successfully");
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      date: "",
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
      openingQty: product.openingQty.toString(),
      openingCost: product.openingCost.toString(),
    });
    setItemRows(
      product.items.map((item, idx) => ({
        id: idx.toString(),
        inventoryId: item.inventoryId,
        quantity: item.quantity.toString(),
      }))
    );
    setDialogOpen(true);
  };

  const handleDelete = () => {
    if (!productToDelete) return;
    setProducts(products.filter(p => p.id !== productToDelete.id));
    setDeleteDialogOpen(false);
    setProductToDelete(null);
    toast.success("Product deleted successfully");
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
                            {inventoryItems.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name} ({item.unit})
                              </SelectItem>
                            ))}
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

              <Button onClick={handleSubmit} className="w-full">
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
              <p className="text-2xl font-bold">{totalProducts}</p>
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
                {products.filter(p => p.totalQty < p.openingQty * 0.2).length}
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
            placeholder="Search products by name..." 
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

      {/* Products Table */}
      <div className="bg-card rounded-xl border border-border">
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
              {filteredProducts.map((product) => (
                <tr key={product.id} className="animate-fade-in">
                  <td className="font-medium">{product.name}</td>
                  <td className="text-right">{product.openingQty.toLocaleString()}</td>
                  <td className="text-right font-medium">{product.totalQty.toLocaleString()}</td>
                  <td>{product.unit}</td>
                  <td className="text-right">₹{product.averageCost.toLocaleString()}</td>
                  <td className="text-right font-semibold">
                    ₹{(product.totalQty * product.averageCost).toLocaleString("en-IN")}
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
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredProducts.length} of {products.length} products
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
              1
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
