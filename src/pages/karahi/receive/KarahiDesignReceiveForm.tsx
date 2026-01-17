import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowLeft, CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface LineItem {
  id: string;
  design_id: string;
  isMalaiInclude: string;
  machine_id: string;
  noOfSheets: string;
  unitPrice: string;
  designQty: string;
  total: number;
}

const createEmptyLineItem = (): LineItem => ({
  id: crypto.randomUUID(),
  design_id: "",
  isMalaiInclude: "yes",
  machine_id: "",
  noOfSheets: "",
  unitPrice: "",
  designQty: "",
  total: 0,
});

export default function KarahiDesignReceiveForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  
  const [supplier, setSupplier] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [invoiceNo, setInvoiceNo] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([createEmptyLineItem()]);

  // Dropdown Data State
  const [vendors, setVendors] = useState<any[]>([]);
  const [designs, setDesigns] = useState<any[]>([]);
  const [machines, setMachines] = useState<any[]>([]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      const token = localStorage.getItem("auth_token");
      const headers = { Authorization: `Bearer ${token}` };
      const API_URL = import.meta.env.VITE_API_URL;

      try {
        const [vRes, dRes, mRes] = await Promise.all([
          fetch(`${API_URL}/contacts/vendors/embroidery`, { headers }),
          fetch(`${API_URL}/inventory/design/dropdown`, { headers }),
          fetch(`${API_URL}/setup/machine-dropdown`, { headers }),
        ]);

        const vData = await vRes.json();
        const dData = await dRes.json();
        const mData = await mRes.json();

        // Mapping based on your provided API responses
        setVendors(Array.isArray(vData) ? vData : vData.data || []);
        setDesigns(Array.isArray(dData) ? dData : dData.data || []);
        // Machine API has a "data" property wrapper
        setMachines(mData.data || []);
        
      } catch (error) {
        console.error("Dropdown fetch error:", error);
        toast.error("Failed to load dropdown data");
      }
    };

    fetchDropdowns();
  }, []);

  const calculateTotal = (item: LineItem): number => {
    const qty = parseFloat(item.designQty) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    return qty * price;
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          updated.total = calculateTotal(updated);
          return updated;
        }
        return item;
      })
    );
  };

  const addLineItem = () => {
    setLineItems((prev) => [...prev, createEmptyLineItem()]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const grandTotal = lineItems.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = async () => {
    if (!supplier || !date || !invoiceNo) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("auth_token");
      const payload = {
        vendor_id: supplier,
        date: format(date, "yyyy-MM-dd"),
        invoice_no: invoiceNo,
        items: lineItems.map(({ id, total, ...rest }) => ({
            ...rest,
            design_id: parseInt(rest.design_id),
            machine_id: parseInt(rest.machine_id)
        })),
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/karahi/receive/design/store`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success !== false) {
        toast.success("Design receive entry saved successfully");
        navigate("/karahi/design-receive");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditMode ? "Edit Design Receive" : "Receive Design"}
          </h1>
          <p className="text-muted-foreground">
            {isEditMode ? "Update design receive entry" : "Create a new design receive entry"}
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Supplier Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Supplier *</Label>
                <SearchableSelect
                  options={vendors.map((v) => ({
                    value: v.id.toString(),
                    label: v.name,
                  }))}
                  value={supplier}
                  onValueChange={setSupplier}
                  placeholder="Select supplier"
                  searchPlaceholder="Search suppliers..."
                />
              </div>

              <div className="space-y-2">
                <Label>Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Invoice No *</Label>
                <Input
                  placeholder="Enter invoice number"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Design Items</CardTitle>
            <Button size="sm" onClick={addLineItem}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Design</th>
                    <th>Is Malai Include</th>
                    <th>Machine</th>
                    <th>No of Sheets</th>
                    <th>Unit Price</th>
                    <th>Design Qty</th>
                    <th className="text-right">Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <SearchableSelect
                          options={designs.map((d) => ({
                            value: d.id.toString(),
                            label: d.name,
                          }))}
                          value={item.design_id}
                          onValueChange={(value) => updateLineItem(item.id, "design_id", value)}
                          placeholder="Select"
                          searchPlaceholder="Search designs..."
                          triggerClassName="w-40"
                        />
                      </td>
                      <td>
                        <Select
                          value={item.isMalaiInclude}
                          onValueChange={(value) => updateLineItem(item.id, "isMalaiInclude", value)}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-card">
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td>
                        <SearchableSelect
                          options={machines.map((m) => ({
                            value: m.id.toString(),
                            label: m.name,
                          }))}
                          value={item.machine_id}
                          onValueChange={(value) => updateLineItem(item.id, "machine_id", value)}
                          placeholder="Select"
                          searchPlaceholder="Search machines..."
                          triggerClassName="w-40"
                        />
                      </td>
                      <td>
                        <Input
                          type="number"
                          className="w-24"
                          value={item.noOfSheets}
                          onChange={(e) => updateLineItem(item.id, "noOfSheets", e.target.value)}
                        />
                      </td>
                      <td>
                        <Input
                          type="number"
                          className="w-24"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(item.id, "unitPrice", e.target.value)}
                        />
                      </td>
                      <td>
                        <Input
                          type="number"
                          className="w-24"
                          value={item.designQty}
                          onChange={(e) => updateLineItem(item.id, "designQty", e.target.value)}
                        />
                      </td>
                      <td className="text-right font-medium">
                        Rs. {item.total.toLocaleString()}
                      </td>
                      <td>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => removeLineItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={6} className="text-right font-semibold">Grand Total:</td>
                    <td className="text-right font-bold text-success">
                      Rs. {grandTotal.toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Entry</Button>
        </div>
      </div>
    </div>
  );
}