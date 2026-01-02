import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save, Loader2 } from "lucide-react";
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

interface OrderItem {
  id: string;
  itemId: string;
  unit: string;
  conversion: string;
  quantity: string;
  perUnitCost: string;
  amount: string;
}

const inventoryTypes = [
  { id: "inventory", name: "Raw Material" },
  { id: "finish", name: "Finish Goods" },
  { id: "design", name: "Design Material " },
];

export default function PurchaseOrderForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("auth_token");

  const [formData, setFormData] = useState({
    vendor: "",
    date: new Date().toISOString().split("T")[0],
    tCharges: "",
    inventoryType: "",
  });

  const [items, setItems] = useState<OrderItem[]>([
    { id: "1", itemId: "", unit: "", conversion: "", quantity: "", perUnitCost: "", amount: "" },
  ]);

  const [vendors, setVendors] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  });

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        const vendorRes = await fetch(`${API_BASE_URL}/contacts/vendors/all-dropdown`, {
          headers: getHeaders(),
        });
        const vendorData = await vendorRes.json();
        setVendors(vendorData);

        if (isEditMode && id) {
          const response = await fetch(`${API_BASE_URL}/purchase/getbyid/${id}`, {
            method: "GET",
            headers: getHeaders(),
          });
          const result = await response.json();

          setFormData({
            vendor: String(result.purchase.vendor),
            date: result.purchase.tdate,
            tCharges: result.purchase.t_charges,
            inventoryType: result.purchase.inventory_type,
          });

          const mappedItems = await Promise.all(
            result.items.map(async (item: any, idx: number) => {
              const unitRes = await fetch(`${API_BASE_URL}/inventory/unit/${item.itemId}`, {
                headers: getHeaders(),
              });
              const unitData = await unitRes.json();
              return {
                id: `existing-${idx}`,
                itemId: String(item.itemId),
                unit: unitData.unit || "",
                conversion: item.conversion,
                quantity: item.quantity,
                perUnitCost: item.perUnitCost,
                amount: item.amount,
              };
            })
          );
          setItems(mappedItems);
        }
      } catch (error) {
        toast.error("Error loading data");
      } finally {
        setIsLoading(false);
      }
    };
    initializeData();
  }, [id, isEditMode]);

  useEffect(() => {
    const fetchInventoryItems = async () => {
      if (!formData.inventoryType) return;
      setIsLoadingItems(true);
      try {
        const response = await fetch(`${API_BASE_URL}/inventory/type/${formData.inventoryType}`, {
          headers: getHeaders(),
        });
        const data = await response.json();
        setInventoryItems(data);
      } catch (error) {
        toast.error("Failed to load items");
      } finally {
        setIsLoadingItems(false);
      }
    };
    fetchInventoryItems();
  }, [formData.inventoryType]);

  const handleAddItem = () => {
    setItems([...items, { id: Date.now().toString(), itemId: "", unit: "", conversion: "", quantity: "", perUnitCost: "", amount: "" }]);
  };

  const handleRemoveItem = (rowId: string) => {
    if (items.length > 1) setItems(items.filter((i) => i.id !== rowId));
  };

  const handleItemChange = async (rowId: string, field: keyof OrderItem, value: string) => {
    const updatedItems = await Promise.all(items.map(async (item) => {
      if (item.id === rowId) {
        let updatedItem = { ...item, [field]: value };
        if (field === "itemId" && value) {
          try {
            const res = await fetch(`${API_BASE_URL}/inventory/unit/${value}`, { headers: getHeaders() });
            const unitData = await res.json();
            updatedItem.unit = unitData.unit;
            updatedItem.conversion = unitData.conversion;
          } catch (e) { console.error(e); }
        }
        if (["perUnitCost", "quantity", "itemId"].includes(field)) {
          updatedItem.amount = (Number(updatedItem.perUnitCost || 0) * Number(updatedItem.quantity || 0)).toFixed(2);
        }
        return updatedItem;
      }
      return item;
    }));
    setItems(updatedItems);
  };

  const calculateTotal = () => items.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0).toFixed(2);
  const calculateGrandTotal = () => (parseFloat(calculateTotal()) + (parseFloat(formData.tCharges) || 0)).toFixed(2);

  const handleSubmit = async () => {
    const payload = {
      vendor: formData.vendor,
      tdate: formData.date,
      t_charges: formData.tCharges,
      inventory_type: formData.inventoryType,
      items: items.map(({ itemId, conversion, quantity, perUnitCost, amount }) => ({
        itemId, conversion, quantity, perUnitCost, amount
      })),
      grand_total: calculateGrandTotal()
    };

    try {
      const url = isEditMode ? `${API_BASE_URL}/purchase/update/${id}` : `${API_BASE_URL}/purchase/store`;
      const response = await fetch(url, {
        method: isEditMode ? 'PUT':'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(`Purchase order ${isEditMode ? 'updated' : 'created'}`);
        navigate("/inventory/purchase");
      }
    } catch (error) { toast.error("Save failed"); }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/inventory/purchase")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{isEditMode ? 'Edit Purchase Order' : 'Create Purchase Order'}</h1>
            <p className="text-muted-foreground">{isEditMode ? 'Update purchase order details' : 'Add a new purchase order'}</p>
          </div>
        </div>
        <Button className="gap-2" onClick={handleSubmit}>
          <Save className="w-4 h-4" />
          {isEditMode ? 'Update Order' : 'Save Order'}
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold mb-4">Order Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Vendor</Label>
            <Select value={formData.vendor} onValueChange={(v) => setFormData({ ...formData, vendor: v })}>
              <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
              <SelectContent className="bg-card">
                {vendors.map((v: any) => <SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>T-Charges</Label>
            <Input type="number" placeholder="0.00" value={formData.tCharges} onChange={(e) => setFormData({ ...formData, tCharges: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Inventory Type</Label>
            <Select value={formData.inventoryType} onValueChange={(v) => setFormData({ ...formData, inventoryType: v })}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent className="bg-card">
                {inventoryTypes.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">Order Items</h3>
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleAddItem}>
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/50 border-b border-border">
              <tr className="text-sm font-medium text-muted-foreground">
                <th className="p-4">Item</th>
                <th className="p-4">Unit</th>
                <th className="p-4">Conversion</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Per Unit Cost</th>
                <th className="p-4">Amount</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="p-4">
                    <Select disabled={!formData.inventoryType || isLoadingItems} value={item.itemId} onValueChange={(v) => handleItemChange(item.id, "itemId", v)}>
                      <SelectTrigger className="min-w-[200px]">
                        {isLoadingItems ? <Loader2 className="w-4 h-4 animate-spin" /> : <SelectValue placeholder="Select item" />}
                      </SelectTrigger>
                      <SelectContent className="bg-card">
                        {inventoryItems.map((inv: any) => <SelectItem key={inv.id} value={String(inv.id)}>{inv.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-4"><Input readOnly value={item.unit} placeholder="Unit" className="w-[100px] bg-muted" /></td>
                  <td className="p-4"><Input readOnly value={item.conversion} placeholder="Conv" className="w-[100px] bg-muted" /></td>
                  <td className="p-4"><Input type="number" placeholder="0" value={item.quantity} onChange={(e) => handleItemChange(item.id, "quantity", e.target.value)} className="w-[100px]" /></td>
                  <td className="p-4"><Input type="number" placeholder="0" value={item.perUnitCost} onChange={(e) => handleItemChange(item.id, "perUnitCost", e.target.value)} className="w-[100px]" /></td>
                  <td className="p-4 font-medium">₹{item.amount || "0.00"}</td>
                  <td className="p-4">
                    <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => handleRemoveItem(item.id)} disabled={items.length === 1}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-border bg-muted/20">
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">Total Items Amount:</span>
              <span className="font-semibold w-32 text-right">₹{calculateTotal()}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">Transport Charges:</span>
              <span className="font-semibold w-32 text-right">₹{parseFloat(formData.tCharges || "0").toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-4 pt-2 border-t border-border mt-2">
              <span className="font-bold">Grand Total:</span>
              <span className="text-xl font-bold text-primary w-32 text-right">₹{calculateGrandTotal()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}