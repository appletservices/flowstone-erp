import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface ReturnItem {
  id: string;
  itemId: string;
  unit: string;
  conversion: string;
  quantity: string;
  perUnitCost: string;
  amount: string;
}

interface InventoryItem {
  id: string;
  name: string;
  unit: string;
}

interface PurchaseReturnData {
  id: string;
  vendor: string;
  date: string;
  tCharges: string;
  inventoryType: string;
  items: ReturnItem[];
}

const vendors = [
  { id: "1", name: "ABC Textiles", type: "karahi" },
  { id: "2", name: "XYZ Suppliers", type: "katae" },
  { id: "3", name: "Raju Karahi Works", type: "karahi" },
  { id: "4", name: "Shyam Katae Services", type: "katae" },
  { id: "5", name: "Krishna Karahi", type: "karahi" },
];

const inventoryTypes = [
  { id: "raw", name: "Raw Material" },
  { id: "finished", name: "Finished Goods" },
  { id: "packaging", name: "Packaging" },
  { id: "consumable", name: "Consumable" },
];

const inventoryItems: InventoryItem[] = [
  { id: "1", name: "Cotton Fabric - Blue", unit: "Meter" },
  { id: "2", name: "Silk Thread - Gold", unit: "Spool" },
  { id: "3", name: "Embroidery Beads", unit: "Packet" },
  { id: "4", name: "Zari Border", unit: "Meter" },
  { id: "5", name: "Button Set - Pearl", unit: "Set" },
  { id: "6", name: "Lining Fabric", unit: "Meter" },
  { id: "7", name: "Thread Roll", unit: "Piece" },
];

// Sample existing returns for edit mode (replace with API call)
const existingReturns: Record<string, PurchaseReturnData> = {
  "1": {
    id: "1",
    vendor: "1",
    date: "2024-12-24",
    tCharges: "1200",
    inventoryType: "raw",
    items: [
      { id: "1", itemId: "1", unit: "Meter", conversion: "50", quantity: "50", perUnitCost: "250", amount: "12500" },
      { id: "2", itemId: "2", unit: "Spool", conversion: "25", quantity: "25", perUnitCost: "150", amount: "3750" },
    ],
  },
  "2": {
    id: "2",
    vendor: "2",
    date: "2024-12-23",
    tCharges: "600",
    inventoryType: "finished",
    items: [
      { id: "1", itemId: "4", unit: "Meter", conversion: "20", quantity: "20", perUnitCost: "500", amount: "10000" },
    ],
  },
};

export default function PurchaseReturnForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    vendor: "",
    date: "",
    tCharges: "",
    inventoryType: "",
  });

  const [items, setItems] = useState<ReturnItem[]>([
    { id: "1", itemId: "", unit: "", conversion: "", quantity: "", perUnitCost: "", amount: "" },
  ]);

  // Load existing return data in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const returnData = existingReturns[id];
      if (returnData) {
        setFormData({
          vendor: returnData.vendor,
          date: returnData.date,
          tCharges: returnData.tCharges,
          inventoryType: returnData.inventoryType,
        });
        setItems(returnData.items);
      }
    }
  }, [id, isEditMode]);


  const handleAddItem = () => {
    const newItem: ReturnItem = {
      id: Date.now().toString(),
      itemId: "",
      unit: "",
      conversion: "",
      quantity: "",
      perUnitCost: "",
      amount: "",
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const handleItemChange = (id: string, field: keyof ReturnItem, value: string) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // When item is selected, auto-fill the unit
          if (field === "itemId") {
            const selectedItem = inventoryItems.find((inv) => inv.id === value);
            if (selectedItem) {
              updatedItem.unit = selectedItem.unit;
            }
          }
          
          // Auto-calculate amount
          if (field === "perUnitCost" || field === "quantity") {
            const cost = parseFloat(updatedItem.perUnitCost) || 0;
            const qty = parseFloat(updatedItem.quantity) || 0;
            updatedItem.amount = (cost * qty).toFixed(2);
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2);
  };

  const calculateGrandTotal = () => {
    const itemsTotal = parseFloat(calculateTotal()) || 0;
    const tCharges = parseFloat(formData.tCharges) || 0;
    return (itemsTotal + tCharges).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare data for API
    const returnData = {
      id: isEditMode ? id : undefined,
      vendor_id: formData.vendor,
      date: formData.date,
      t_charges: parseFloat(formData.tCharges) || 0,
      inventory_type: formData.inventoryType,
      items: items.map((item) => ({
        item_id: item.itemId,
        unit: item.unit,
        conversion: item.conversion,
        quantity: parseFloat(item.quantity) || 0,
        per_unit_cost: parseFloat(item.perUnitCost) || 0,
        amount: parseFloat(item.amount) || 0,
      })),
      total: parseFloat(calculateTotal()),
      grand_total: parseFloat(calculateGrandTotal()),
    };

    try {
      // TODO: Replace with actual API call
      console.log(`${isEditMode ? 'Updating' : 'Submitting'} return data:`, returnData);
      toast.success(`Purchase return ${isEditMode ? 'updated' : 'created'} successfully!`);
      navigate("/purchase-return");
    } catch (error) {
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} purchase return`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/purchase-return")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEditMode ? 'Edit Purchase Return' : 'Create Purchase Return'}
            </h1>
            <p className="text-muted-foreground">
              {isEditMode ? 'Update purchase return details' : 'Add a new purchase return'}
            </p>
          </div>
        </div>
        <Button className="gap-2" onClick={handleSubmit}>
          <Save className="w-4 h-4" />
          {isEditMode ? 'Update Return' : 'Save Return'}
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Return Details */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Return Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Select
                value={formData.vendor}
                onValueChange={(value) => setFormData({ ...formData, vendor: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name} ({vendor.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tCharges">T-Charges</Label>
              <Input
                id="tCharges"
                type="number"
                placeholder="Enter T-Charges"
                value={formData.tCharges}
                onChange={(e) => setFormData({ ...formData, tCharges: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inventoryType">Inventory Type</Label>
              <Select
                value={formData.inventoryType}
                onValueChange={(value) => setFormData({ ...formData, inventoryType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  {inventoryTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Return Items */}
        <div className="bg-card rounded-xl border border-border">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold">Return Items</h3>
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleAddItem}>
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Unit</th>
                  <th>Conversion</th>
                  <th>Quantity</th>
                  <th>Per Unit Cost</th>
                  <th>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <Select
                        value={item.itemId}
                        onValueChange={(value) => handleItemChange(item.id, "itemId", value)}
                      >
                        <SelectTrigger className="min-w-[180px]">
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent className="bg-card">
                          {inventoryItems.map((invItem) => (
                            <SelectItem key={invItem.id} value={invItem.id}>
                              {invItem.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td>
                      <Input
                        readOnly
                        value={item.unit}
                        placeholder="Unit"
                        className="min-w-[100px] bg-muted"
                      />
                    </td>
                    <td>
                      <Input
                        type="text"
                        placeholder="Conversion"
                        value={item.conversion}
                        onChange={(e) => handleItemChange(item.id, "conversion", e.target.value)}
                        className="min-w-[100px]"
                      />
                    </td>
                    <td>
                      <Input
                        type="number"
                        placeholder="0"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, "quantity", e.target.value)}
                        className="min-w-[80px]"
                      />
                    </td>
                    <td>
                      <Input
                        type="number"
                        placeholder="0"
                        value={item.perUnitCost}
                        onChange={(e) => handleItemChange(item.id, "perUnitCost", e.target.value)}
                        className="min-w-[100px]"
                      />
                    </td>
                    <td>
                      <Input
                        readOnly
                        value={item.amount ? `₹${item.amount}` : ""}
                        className="min-w-[100px] bg-muted"
                      />
                    </td>
                    <td>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="p-4 border-t border-border">
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">Total:</span>
                <span className="text-lg font-semibold w-32 text-right">₹{calculateTotal()}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">T-Charges:</span>
                <span className="text-lg font-semibold w-32 text-right">₹{formData.tCharges || "0.00"}</span>
              </div>
              <div className="flex items-center gap-4 pt-2 border-t border-border">
                <span className="text-muted-foreground font-medium">Grand Total:</span>
                <span className="text-xl font-bold text-primary w-32 text-right">₹{calculateGrandTotal()}</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}