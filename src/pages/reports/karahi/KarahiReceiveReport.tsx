import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
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
import { FileText, Filter, Loader2 } from "lucide-react";

export default function KarahiReceiveReport() {
  const [selectedVendor, setSelectedVendor] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // Lists for Dropdowns
  const [vendors, setVendors] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  
  // API Data States
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [productSummary, setProductSummary] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Dropdown Data on Mount
  useEffect(() => {
    const fetchDropdowns = async () => {
      const token = localStorage.getItem("auth_token");
      const headers = { Authorization: `Bearer ${token}` };

      try {
        // Fetch Vendors
        const vendorRes = await fetch(`${import.meta.env.VITE_API_URL}/contacts/dropdown`, { headers });
        const vendorData = await vendorRes.json();
        if (vendorData) setVendors(vendorData);

        // Fetch Products
        const productRes = await fetch(`${import.meta.env.VITE_API_URL}/inventory/dropdown`, { headers });
        const productData = await productRes.json();
        if (productData) setProducts(productData);
      } catch (error) {
        console.error("Error loading dropdowns:", error);
      }
    };

    fetchDropdowns();
  }, []);

  const handleVendorChange = (value: string) => {
    setSelectedVendor(value);
    // Note: Kept selectedProduct logic as requested
  };

  const handleFilter = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const queryParams = new URLSearchParams();
      if (fromDate) queryParams.append("fromDate", fromDate);
      if (toDate) queryParams.append("toDate", toDate);
      if (selectedVendor && selectedVendor !== "all") queryParams.append("vendorId", selectedVendor);
      if (selectedProduct && selectedProduct !== "all") queryParams.append("productId", selectedProduct);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/reports/receive/karahi?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const result = await response.json();
      if (response.ok && result.success !== false) {
        setFilteredData(result.data || []);
        setProductSummary(result.summary || []);
      } else {
        toast.error(result.message || "Failed to issue material");
      }
    } catch (error) {
      toast.error("An error occurred while saving");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Karahi Receive Report</h1>
          <p className="text-muted-foreground mt-1">
            Filter and view karahi receive transactions
          </p>
        </div>
        <FileText className="h-8 w-8 text-primary" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            {/* Vendor Selection from API */}
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Select value={selectedVendor} onValueChange={handleVendorChange}>
                <SelectTrigger id="vendor">
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {vendors.map((v) => (
                    <SelectItem key={v.id} value={v.id.toString()}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Product Selection from API */}
            <div className="space-y-2">
              <Label htmlFor="product">Product</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger id="product">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromDate">From Date</Label>
              <Input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="toDate">To Date</Label>
              <Input
                id="toDate"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <Button onClick={handleFilter} disabled={isLoading} className="flex items-center gap-2">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Filter className="h-4 w-4" />}
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

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
                  <TableHead>Vendor</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {isLoading ? "Loading..." : "No issue records found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow key={item.track_id}>
                      <TableCell className="font-medium">{item.reference_no}</TableCell>
                      <TableCell>{item.tdate}</TableCell>
                      <TableCell>{item.vendor}</TableCell>
                      <TableCell>{item.product}</TableCell>
                      <TableCell className="text-right">
                        {parseFloat(item.quantity).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Product Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S/NO</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Total Received</TableHead>
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
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{item.product}</TableCell>
                      <TableCell className="text-right font-bold">
                        {parseFloat(item.totalIssued).toLocaleString()}
                      </TableCell>
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