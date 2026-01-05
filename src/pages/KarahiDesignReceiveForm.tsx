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

const suppliers = [
  { value: "supplier-1", label: "Supplier A" },
  { value: "supplier-2", label: "Supplier B" },
  { value: "supplier-3", label: "Supplier C" },
];

const designs = [
  { value: "design-1", label: "Design A" },
  { value: "design-2", label: "Design B" },
  { value: "design-3", label: "Design C" },
  { value: "design-4", label: "Design D" },
];

const machines = [
  { value: "machine-1", label: "Machine 1" },
  { value: "machine-2", label: "Machine 2" },
  { value: "machine-3", label: "Machine 3" },
];

interface LineItem {
  id: string;
  design: string;
  isMalaiInclude: string;
  machine: string;
  noOfSheets: string;
  unitPrice: string;
  designQty: string;
  total: number;
}

const createEmptyLineItem = (): LineItem => ({
  id: crypto.randomUUID(),
  design: "",
  isMalaiInclude: "yes",
  machine: "",
  noOfSheets: "",
  unitPrice: "",
  designQty: "",
  total: 0,
});

// Mock data for editing - in real app this would come from API
const mockEntries: Record<string, { supplier: string; date: string; invoiceNo: string; lineItems: Omit<LineItem, 'id' | 'total'>[] }> = {
  "1": {
    supplier: "supplier-1",
    date: "2024-01-15",
    invoiceNo: "INV-001",
    lineItems: [
      { design: "design-1", isMalaiInclude: "yes", machine: "machine-1", noOfSheets: "10", unitPrice: "500", designQty: "20" },
      { design: "design-2", isMalaiInclude: "no", machine: "machine-2", noOfSheets: "5", unitPrice: "700", designQty: "15" },
    ]
  },
  "2": {
    supplier: "supplier-2",
    date: "2024-01-18",
    invoiceNo: "INV-002",
    lineItems: [
      { design: "design-3", isMalaiInclude: "yes", machine: "machine-1", noOfSheets: "8", unitPrice: "600", designQty: "25" },
    ]
  },
  "3": {
    supplier: "supplier-3",
    date: "2024-01-20",
    invoiceNo: "INV-003",
    lineItems: [
      { design: "design-1", isMalaiInclude: "yes", machine: "machine-3", noOfSheets: "12", unitPrice: "450", designQty: "30" },
    ]
  },
  "4": {
    supplier: "supplier-1",
    date: "2024-01-22",
    invoiceNo: "INV-004",
    lineItems: [
      { design: "design-4", isMalaiInclude: "no", machine: "machine-2", noOfSheets: "15", unitPrice: "550", designQty: "40" },
    ]
  },
  "5": {
    supplier: "supplier-2",
    date: "2024-01-25",
    invoiceNo: "INV-005",
    lineItems: [
      { design: "design-2", isMalaiInclude: "yes", machine: "machine-1", noOfSheets: "6", unitPrice: "800", designQty: "10" },
    ]
  },
};

export default function KarahiDesignReceiveForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  
  const [supplier, setSupplier] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [invoiceNo, setInvoiceNo] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([createEmptyLineItem()]);

  useEffect(() => {
    if (isEditMode && id && mockEntries[id]) {
      const entry = mockEntries[id];
      setSupplier(entry.supplier);
      setDate(new Date(entry.date));
      setInvoiceNo(entry.invoiceNo);
      setLineItems(
        entry.lineItems.map((item) => {
          const lineItem: LineItem = {
            id: crypto.randomUUID(),
            ...item,
            total: (parseFloat(item.designQty) || 0) * (parseFloat(item.unitPrice) || 0),
          };
          return lineItem;
        })
      );
    }
  }, [id, isEditMode]);

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
    if (lineItems.length === 1) {
      toast.error("At least one item is required");
      return;
    }
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const grandTotal = lineItems.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = () => {
    if (!supplier || !date || !invoiceNo) {
      toast.error("Please fill in all required fields");
      return;
    }

    const hasValidItems = lineItems.some(
      (item) => item.design && item.machine && item.designQty && item.unitPrice
    );

    if (!hasValidItems) {
      toast.error("Please add at least one valid item");
      return;
    }

    toast.success(isEditMode ? "Design receive entry updated successfully" : "Design receive entry saved successfully");
    navigate("/karahi/design-receive");
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
        {/* Header Card */}
        <Card>
          <CardHeader>
            <CardTitle>Supplier Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Supplier *</Label>
                <Select value={supplier} onValueChange={setSupplier}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    {suppliers.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                      className="pointer-events-auto"
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

        {/* Line Items Card */}
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
                        <Select
                          value={item.design}
                          onValueChange={(value) => updateLineItem(item.id, "design", value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="bg-card">
                            {designs.map((d) => (
                              <SelectItem key={d.value} value={d.value}>
                                {d.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <Select
                          value={item.machine}
                          onValueChange={(value) => updateLineItem(item.id, "machine", value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="bg-card">
                            {machines.map((m) => (
                              <SelectItem key={m.value} value={m.value}>
                                {m.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td>
                        <Input
                          type="number"
                          className="w-24"
                          placeholder="0"
                          value={item.noOfSheets}
                          onChange={(e) => updateLineItem(item.id, "noOfSheets", e.target.value)}
                        />
                      </td>
                      <td>
                        <Input
                          type="number"
                          className="w-24"
                          placeholder="0"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(item.id, "unitPrice", e.target.value)}
                        />
                      </td>
                      <td>
                        <Input
                          type="number"
                          className="w-24"
                          placeholder="0"
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
                          className="h-8 w-8 text-destructive hover:text-destructive"
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
                    <td colSpan={6} className="text-right font-semibold">
                      Grand Total:
                    </td>
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

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save</Button>
        </div>
      </div>
    </div>
  );
}
