import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { FileText, Filter } from "lucide-react";

// Mock vendors data
const vendors = [
  { id: "1", name: "ABC Suppliers" },
  { id: "2", name: "XYZ Trading" },
  { id: "3", name: "Global Materials" },
  { id: "4", name: "Quality Fabrics" },
];

// Mock items data (vendor-wise)
const items: { [vendorId: string]: { id: string; name: string }[] } = {
  "1": [
    { id: "1", name: "Raw Cotton" },
    { id: "2", name: "Polyester Thread" },
  ],
  "2": [
    { id: "3", name: "Silk Fabric" },
    { id: "4", name: "Wool Yarn" },
  ],
  "3": [
    { id: "5", name: "Linen Material" },
    { id: "6", name: "Denim Fabric" },
  ],
  "4": [
    { id: "7", name: "Cotton Blend" },
    { id: "8", name: "Synthetic Fiber" },
  ],
};

// Mock purchase data
const purchaseData = [
  { id: "1", referenceNo: "PO-2024-001", date: "2024-01-15", vendorId: "1", vendor: "ABC Suppliers", productId: "1", product: "Raw Cotton", quantity: 100, unitPrice: 50, amount: 5000 },
  { id: "2", referenceNo: "PO-2024-002", date: "2024-01-18", vendorId: "1", vendor: "ABC Suppliers", productId: "2", product: "Polyester Thread", quantity: 200, unitPrice: 25, amount: 5000 },
  { id: "3", referenceNo: "PO-2024-003", date: "2024-01-20", vendorId: "2", vendor: "XYZ Trading", productId: "3", product: "Silk Fabric", quantity: 50, unitPrice: 150, amount: 7500 },
  { id: "4", referenceNo: "PO-2024-004", date: "2024-01-22", vendorId: "2", vendor: "XYZ Trading", productId: "4", product: "Wool Yarn", quantity: 75, unitPrice: 80, amount: 6000 },
  { id: "5", referenceNo: "PO-2024-005", date: "2024-01-25", vendorId: "3", vendor: "Global Materials", productId: "5", product: "Linen Material", quantity: 120, unitPrice: 65, amount: 7800 },
  { id: "6", referenceNo: "PO-2024-006", date: "2024-02-01", vendorId: "3", vendor: "Global Materials", productId: "6", product: "Denim Fabric", quantity: 80, unitPrice: 90, amount: 7200 },
  { id: "7", referenceNo: "PO-2024-007", date: "2024-02-05", vendorId: "4", vendor: "Quality Fabrics", productId: "7", product: "Cotton Blend", quantity: 150, unitPrice: 45, amount: 6750 },
  { id: "8", referenceNo: "PO-2024-008", date: "2024-02-10", vendorId: "4", vendor: "Quality Fabrics", productId: "8", product: "Synthetic Fiber", quantity: 90, unitPrice: 55, amount: 4950 },
];

export default function PurchaseReport() {
  const [selectedVendor, setSelectedVendor] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [filteredData, setFilteredData] = useState(purchaseData);

  // Get items based on selected vendor
  const availableItems = useMemo(() => {
    if (!selectedVendor) return [];
    return items[selectedVendor] || [];
  }, [selectedVendor]);

  // Reset item selection when vendor changes
  const handleVendorChange = (value: string) => {
    setSelectedVendor(value);
    setSelectedItem("");
  };

  // Handle filter
  const handleFilter = () => {
    let result = [...purchaseData];

    if (selectedVendor) {
      result = result.filter((item) => item.vendorId === selectedVendor);
    }

    if (selectedItem) {
      result = result.filter((item) => item.productId === selectedItem);
    }

    if (fromDate) {
      result = result.filter((item) => item.date >= fromDate);
    }

    if (toDate) {
      result = result.filter((item) => item.date <= toDate);
    }

    setFilteredData(result);
  };

  // Calculate totals
  const totalQuantity = filteredData.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = filteredData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Purchase Report</h1>
          <p className="text-muted-foreground mt-1">
            Filter and view purchase transactions
          </p>
        </div>
        <FileText className="h-8 w-8 text-primary" />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            {/* Vendor Selection */}
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Select value={selectedVendor} onValueChange={handleVendorChange}>
                <SelectTrigger id="vendor">
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Item Selection (filtered by vendor) */}
            <div className="space-y-2">
              <Label htmlFor="item">Item</Label>
              <Select
                value={selectedItem}
                onValueChange={setSelectedItem}
                disabled={!selectedVendor || selectedVendor === "all"}
              >
                <SelectTrigger id="item">
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  {availableItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* From Date */}
            <div className="space-y-2">
              <Label htmlFor="fromDate">From Date</Label>
              <Input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            {/* To Date */}
            <div className="space-y-2">
              <Label htmlFor="toDate">To Date</Label>
              <Input
                id="toDate"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            {/* Filter Button */}
            <Button onClick={handleFilter} className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Purchase Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No purchase records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.referenceNo}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.vendor}</TableCell>
                      <TableCell>{item.product}</TableCell>
                      <TableCell className="text-right">{item.quantity.toLocaleString()}</TableCell>
                      <TableCell className="text-right">₹{item.unitPrice.toLocaleString()}</TableCell>
                      <TableCell className="text-right">₹{item.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              {filteredData.length > 0 && (
                <TableFooter>
                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell colSpan={4} className="text-right">Total</TableCell>
                    <TableCell className="text-right">{totalQuantity.toLocaleString()}</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right">₹{totalAmount.toLocaleString()}</TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
