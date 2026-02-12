import { useState, useEffect } from "react";
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
import { FileText, Filter, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Vendor {
  id: string;
  name: string;
}

interface InventoryItem {
  id: string;
  name: string;
}

interface PurchaseReportRecord {
  track_id: number;
  tdate: string;
  unitprice: string;
  amount: string;
  quantity: string;
  vendor: string;
  product: string;
}

export default function PurchaseReport() {
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredData, setFilteredData] = useState<PurchaseReportRecord[]>([]);

  // Filter States
  const [selectedVendor, setSelectedVendor] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<string>("all");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const token = localStorage.getItem("auth_token");
  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Fetch Dropdown Data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [vendorRes, itemRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/contacts/vendors/all-dropdown`, { headers }),
          fetch(`${import.meta.env.VITE_API_URL}/inventory/dropdown`, { headers })
        ]);

        if (vendorRes.ok) setVendors(await vendorRes.json());
        if (itemRes.ok) setItems(await itemRes.json());
      } catch (error) {
        toast.error("Failed to load filter options");
      }
    };
    fetchInitialData();
  }, []);

  // Handle Filter API Call
  const handleFilter = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        vendor: selectedVendor,
        item: selectedItem,
        fromDate: fromDate,
        toDate: toDate,
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/reports/purchase?${params.toString()}`,
        { headers }
      );

      if (!response.ok) throw new Error("Failed to fetch report");

      const data = await response.json();
      setFilteredData(data);
    } catch (error) {
      toast.error("Error generating report");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const totalQuantity = filteredData.reduce((sum, item) => sum + parseFloat(item.quantity || "0"), 0);
  const totalAmount = filteredData.reduce((sum, item) => sum + parseFloat(item.amount || "0"), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Purchase Report</h1>
          <p className="text-muted-foreground mt-1">
            Filter and view purchase transactions from the system
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
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                <SelectTrigger id="vendor">
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">All Vendors</SelectItem>
                  {vendors.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item">Item</Label>
              <Select value={selectedItem} onValueChange={setSelectedItem}>
                <SelectTrigger id="item">
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">All Items</SelectItem>
                  {items.map((i) => (
                    <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
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

            <Button onClick={handleFilter} disabled={loading} className="flex items-center gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Filter className="h-4 w-4" />}
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
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {loading ? "Loading records..." : "No purchase records found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow key={item.track_id}>
                      <TableCell>{item.tdate}</TableCell>
                      <TableCell>{item.vendor}</TableCell>
                      <TableCell className="font-medium">{item.product}</TableCell>
                      <TableCell className="text-right">{parseFloat(item.quantity).toLocaleString()}</TableCell>
                      <TableCell className="text-right">{parseFloat(item.unitprice).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              {filteredData.length > 0 && (
                <TableFooter>
                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell colSpan={3} className="text-right">Grand Total</TableCell>
                    <TableCell className="text-right">{totalQuantity.toLocaleString()}</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right text-primary">
                      {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
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