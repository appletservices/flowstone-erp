import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Palette,
  CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DesignItem {
  id: string;
  name: string;
  product: string;
  designCode: string;
  openingQty: number;
  totalQty: number;
  avgCost: number;
  unit: string;
}

const products = [
  { value: "carpet", label: "Carpet" },
  { value: "rug", label: "Rug" },
  { value: "mat", label: "Mat" },
  { value: "runner", label: "Runner" },
  { value: "tapestry", label: "Tapestry" },
];

const units = [
  { value: "pcs", label: "Pieces" },
  { value: "sqm", label: "Square Meter" },
  { value: "sqft", label: "Square Feet" },
  { value: "meter", label: "Meter" },
];

const designItems: DesignItem[] = [
  {
    id: "1",
    name: "Traditional Floral",
    product: "carpet",
    designCode: "DSN-001",
    openingQty: 50,
    totalQty: 120,
    avgCost: 2500,
    unit: "pcs",
  },
  {
    id: "2",
    name: "Modern Geometric",
    product: "rug",
    designCode: "DSN-002",
    openingQty: 30,
    totalQty: 85,
    avgCost: 1800,
    unit: "pcs",
  },
  {
    id: "3",
    name: "Vintage Pattern",
    product: "tapestry",
    designCode: "DSN-003",
    openingQty: 15,
    totalQty: 45,
    avgCost: 3200,
    unit: "sqm",
  },
  {
    id: "4",
    name: "Minimalist Lines",
    product: "runner",
    designCode: "DSN-004",
    openingQty: 25,
    totalQty: 60,
    avgCost: 1200,
    unit: "meter",
  },
  {
    id: "5",
    name: "Abstract Art",
    product: "mat",
    designCode: "DSN-005",
    openingQty: 100,
    totalQty: 250,
    avgCost: 450,
    unit: "pcs",
  },
];

interface FormData {
  name: string;
  product: string;
  designCode: string;
  openingQuantity: string;
  perUnitCost: string;
  date: Date | undefined;
}

const emptyFormData: FormData = {
  name: "",
  product: "",
  designCode: "",
  openingQuantity: "",
  perUnitCost: "",
  date: undefined,
};

export default function DesignInventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(emptyFormData);

  const filteredItems = designItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.designCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = designItems.length;
  const totalValue = designItems.reduce((acc, item) => acc + item.totalQty * item.avgCost, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.product || !formData.designCode) {
      toast.error("Please fill in required fields");
      return;
    }

    toast.success("Design item added successfully");
    setDialogOpen(false);
    setFormData(emptyFormData);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setFormData(emptyFormData);
    }
  };

  const getProductName = (value: string) => {
    return products.find((p) => p.value === value)?.label || value;
  };

  const getUnitName = (value: string) => {
    return units.find((u) => u.value === value)?.label || value;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Design Inventory</h1>
          <p className="text-muted-foreground">
            Manage design patterns and inventory
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Design
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-card">
            <DialogHeader>
              <DialogTitle>Add Design Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter design name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Product Dropdown */}
                <div className="space-y-2">
                  <Label htmlFor="product">Product *</Label>
                  <Select
                    value={formData.product}
                    onValueChange={(value) =>
                      setFormData({ ...formData, product: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent className="bg-card">
                      {products.map((product) => (
                        <SelectItem key={product.value} value={product.value}>
                          {product.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Design Code */}
                <div className="space-y-2">
                  <Label htmlFor="designCode">Design Code *</Label>
                  <Input
                    id="designCode"
                    placeholder="Enter design code"
                    value={formData.designCode}
                    onChange={(e) =>
                      setFormData({ ...formData, designCode: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Opening Quantity */}
                <div className="space-y-2">
                  <Label htmlFor="openingQuantity">Opening Quantity</Label>
                  <Input
                    id="openingQuantity"
                    type="number"
                    placeholder="Enter quantity"
                    value={formData.openingQuantity}
                    onChange={(e) =>
                      setFormData({ ...formData, openingQuantity: e.target.value })
                    }
                  />
                </div>

                {/* Per Unit Cost */}
                <div className="space-y-2">
                  <Label htmlFor="perUnitCost">Per Unit Cost</Label>
                  <Input
                    id="perUnitCost"
                    type="number"
                    placeholder="Enter cost"
                    value={formData.perUnitCost}
                    onChange={(e) =>
                      setFormData({ ...formData, perUnitCost: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => setFormData({ ...formData, date })}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-muted">
              <Palette className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Designs</p>
              <p className="text-2xl font-bold">{totalItems}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <Palette className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Product Types</p>
              <p className="text-2xl font-bold">
                {new Set(designItems.map((d) => d.product)).size}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <Palette className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold">Rs. {totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">All Designs</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search designs..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Product</th>
                <th>Opening Qty</th>
                <th>Total Qty</th>
                <th>Avg Cost</th>
                <th>Unit</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="animate-fade-in">
                  <td className="font-medium">{item.name}</td>
                  <td>
                    <span className="text-sm capitalize">
                      {getProductName(item.product)}
                    </span>
                  </td>
                  <td className="text-muted-foreground">{item.openingQty}</td>
                  <td className="font-medium">{item.totalQty}</td>
                  <td className="font-medium text-success">
                    Rs. {item.avgCost.toLocaleString()}
                  </td>
                  <td className="text-sm text-muted-foreground">
                    {getUnitName(item.unit)}
                  </td>
                  <td>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Design</DropdownMenuItem>
                        <DropdownMenuItem>Update Stock</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
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
            Showing {filteredItems.length} of {designItems.length} designs
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <span className="text-muted-foreground">...</span>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
