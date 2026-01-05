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
} from "@/components/ui/table";
import { FileText, Filter } from "lucide-react";

// Mock vendors data
const vendors = [
  { id: "1", name: "ABC Suppliers" },
  { id: "2", name: "XYZ Trading" },
  { id: "3", name: "Global Materials" },
  { id: "4", name: "Quality Fabrics" },
];

// Mock products data (vendor-wise)
const products: { [vendorId: string]: { id: string; name: string }[] } = {
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

// Mock receive data
const receiveData = [
  { id: "1", reference: "KR-2024-001", date: "2024-01-16", slipNo: "RCV-001", vendorId: "1", vendor: "ABC Suppliers", productId: "1", product: "Raw Cotton", qty: 45 },
  { id: "2", reference: "KR-2024-002", date: "2024-01-19", slipNo: "RCV-002", vendorId: "1", vendor: "ABC Suppliers", productId: "2", product: "Polyester Thread", qty: 90 },
  { id: "3", reference: "KR-2024-003", date: "2024-01-21", slipNo: "RCV-003", vendorId: "2", vendor: "XYZ Trading", productId: "3", product: "Silk Fabric", qty: 20 },
  { id: "4", reference: "KR-2024-004", date: "2024-01-23", slipNo: "RCV-004", vendorId: "2", vendor: "XYZ Trading", productId: "4", product: "Wool Yarn", qty: 35 },
  { id: "5", reference: "KR-2024-005", date: "2024-01-26", slipNo: "RCV-005", vendorId: "3", vendor: "Global Materials", productId: "5", product: "Linen Material", qty: 55 },
  { id: "6", reference: "KR-2024-006", date: "2024-02-02", slipNo: "RCV-006", vendorId: "3", vendor: "Global Materials", productId: "6", product: "Denim Fabric", qty: 30 },
  { id: "7", reference: "KR-2024-007", date: "2024-02-06", slipNo: "RCV-007", vendorId: "4", vendor: "Quality Fabrics", productId: "7", product: "Cotton Blend", qty: 75 },
  { id: "8", reference: "KR-2024-008", date: "2024-02-11", slipNo: "RCV-008", vendorId: "4", vendor: "Quality Fabrics", productId: "8", product: "Synthetic Fiber", qty: 40 },
];

export default function KataeReceiveReport() {
  const [selectedVendor, setSelectedVendor] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [filteredData, setFilteredData] = useState(receiveData);

  // Get products based on selected vendor
  const availableProducts = useMemo(() => {
    if (!selectedVendor || selectedVendor === "all") return [];
    return products[selectedVendor] || [];
  }, [selectedVendor]);

  // Reset product selection when vendor changes
  const handleVendorChange = (value: string) => {
    setSelectedVendor(value);
    setSelectedProduct("");
  };

  // Handle filter
  const handleFilter = () => {
    let result = [...receiveData];

    if (selectedVendor && selectedVendor !== "all") {
      result = result.filter((item) => item.vendorId === selectedVendor);
    }

    if (selectedProduct && selectedProduct !== "all") {
      result = result.filter((item) => item.productId === selectedProduct);
    }

    if (fromDate) {
      result = result.filter((item) => item.date >= fromDate);
    }

    if (toDate) {
      result = result.filter((item) => item.date <= toDate);
    }

    setFilteredData(result);
  };

  // Calculate product totals for summary table
  const productSummary = useMemo(() => {
    const summary: { [key: string]: { reference: string; product: string; totalIssued: number } } = {};
    
    filteredData.forEach((item) => {
      if (summary[item.productId]) {
        summary[item.productId].totalIssued += item.qty;
      } else {
        summary[item.productId] = {
          reference: item.reference,
          product: item.product,
          totalIssued: item.qty,
        };
      }
    });

    return Object.values(summary);
  }, [filteredData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Katae Receive Report</h1>
          <p className="text-muted-foreground mt-1">
            Filter and view katae receive transactions
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

            {/* Product Selection (filtered by vendor) */}
            <div className="space-y-2">
              <Label htmlFor="product">Product</Label>
              <Select
                value={selectedProduct}
                onValueChange={setSelectedProduct}
                disabled={!selectedVendor || selectedVendor === "all"}
              >
                <SelectTrigger id="product">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {availableProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
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

      {/* Detail Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Receive Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Slip No</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No receive records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.reference}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.slipNo}</TableCell>
                      <TableCell>{item.vendor}</TableCell>
                      <TableCell>{item.product}</TableCell>
                      <TableCell className="text-right">{item.qty.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Product Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Total Issued</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productSummary.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No summary data available
                    </TableCell>
                  </TableRow>
                ) : (
                  productSummary.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.reference}</TableCell>
                      <TableCell>{item.product}</TableCell>
                      <TableCell className="text-right">{item.totalIssued.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
