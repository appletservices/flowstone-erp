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
import { Badge } from "@/components/ui/badge";
import { CreditCard, Filter, Download } from "lucide-react";

// Mock payment types
const paymentTypes = [
  { id: "cash", name: "Cash" },
  { id: "bank", name: "Bank Transfer" },
  { id: "cheque", name: "Cheque" },
  { id: "upi", name: "UPI" },
];

// Mock vendors/parties data
const parties = [
  { id: "1", name: "ABC Suppliers", type: "vendor" },
  { id: "2", name: "XYZ Trading", type: "vendor" },
  { id: "3", name: "Global Materials", type: "vendor" },
  { id: "4", name: "Quality Fabrics", type: "vendor" },
  { id: "5", name: "John Doe", type: "customer" },
  { id: "6", name: "Jane Smith", type: "customer" },
];

// Mock payment data
const paymentData = [
  { id: "1", referenceNo: "PAY-2024-001", date: "2024-01-15", partyId: "1", party: "ABC Suppliers", partyType: "vendor", paymentType: "bank", description: "Payment for PO-2024-001", amount: 5000, status: "completed" },
  { id: "2", referenceNo: "PAY-2024-002", date: "2024-01-18", partyId: "2", party: "XYZ Trading", partyType: "vendor", paymentType: "cheque", description: "Advance payment", amount: 10000, status: "completed" },
  { id: "3", referenceNo: "PAY-2024-003", date: "2024-01-20", partyId: "5", party: "John Doe", partyType: "customer", paymentType: "cash", description: "Receipt for SO-2024-001", amount: 7500, status: "completed" },
  { id: "4", referenceNo: "PAY-2024-004", date: "2024-01-22", partyId: "3", party: "Global Materials", partyType: "vendor", paymentType: "upi", description: "Payment for materials", amount: 15000, status: "pending" },
  { id: "5", referenceNo: "PAY-2024-005", date: "2024-01-25", partyId: "4", party: "Quality Fabrics", partyType: "vendor", paymentType: "bank", description: "Final settlement", amount: 25000, status: "completed" },
  { id: "6", referenceNo: "PAY-2024-006", date: "2024-02-01", partyId: "6", party: "Jane Smith", partyType: "customer", paymentType: "upi", description: "Receipt for order", amount: 8500, status: "completed" },
  { id: "7", referenceNo: "PAY-2024-007", date: "2024-02-05", partyId: "1", party: "ABC Suppliers", partyType: "vendor", paymentType: "cheque", description: "Partial payment", amount: 12000, status: "pending" },
  { id: "8", referenceNo: "PAY-2024-008", date: "2024-02-10", partyId: "2", party: "XYZ Trading", partyType: "vendor", paymentType: "bank", description: "Monthly settlement", amount: 18000, status: "completed" },
];

export default function PaymentReport() {
  const [selectedParty, setSelectedParty] = useState<string>("");
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedPartyType, setSelectedPartyType] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [filteredData, setFilteredData] = useState(paymentData);

  // Filter parties based on party type
  const availableParties = useMemo(() => {
    if (!selectedPartyType || selectedPartyType === "all") return parties;
    return parties.filter((p) => p.type === selectedPartyType);
  }, [selectedPartyType]);

  // Reset party selection when party type changes
  const handlePartyTypeChange = (value: string) => {
    setSelectedPartyType(value);
    setSelectedParty("");
  };

  // Handle filter
  const handleFilter = () => {
    let result = [...paymentData];

    if (selectedPartyType && selectedPartyType !== "all") {
      result = result.filter((item) => item.partyType === selectedPartyType);
    }

    if (selectedParty && selectedParty !== "all") {
      result = result.filter((item) => item.partyId === selectedParty);
    }

    if (selectedPaymentType && selectedPaymentType !== "all") {
      result = result.filter((item) => item.paymentType === selectedPaymentType);
    }

    if (selectedStatus && selectedStatus !== "all") {
      result = result.filter((item) => item.status === selectedStatus);
    }

    if (fromDate) {
      result = result.filter((item) => item.date >= fromDate);
    }

    if (toDate) {
      result = result.filter((item) => item.date <= toDate);
    }

    setFilteredData(result);
  };

  // Clear filters
  const handleClearFilters = () => {
    setSelectedParty("");
    setSelectedPaymentType("");
    setSelectedStatus("");
    setSelectedPartyType("");
    setFromDate("");
    setToDate("");
    setFilteredData(paymentData);
  };

  // Calculate totals
  const totalAmount = filteredData.reduce((sum, item) => sum + item.amount, 0);
  const completedAmount = filteredData
    .filter((item) => item.status === "completed")
    .reduce((sum, item) => sum + item.amount, 0);
  const pendingAmount = filteredData
    .filter((item) => item.status === "pending")
    .reduce((sum, item) => sum + item.amount, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentTypeBadge = (type: string) => {
    const typeLabels: { [key: string]: string } = {
      cash: "Cash",
      bank: "Bank Transfer",
      cheque: "Cheque",
      upi: "UPI",
    };
    return <Badge variant="outline">{typeLabels[type] || type}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payment Report</h1>
          <p className="text-muted-foreground mt-1">
            Filter and view payment transactions
          </p>
        </div>
        <CreditCard className="h-8 w-8 text-primary" />
      </div>


      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Party Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="partyType">Party Type</Label>
              <Select value={selectedPartyType} onValueChange={handlePartyTypeChange}>
                <SelectTrigger id="partyType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Party Selection */}
            <div className="space-y-2">
              <Label htmlFor="party">Party</Label>
              <Select value={selectedParty} onValueChange={setSelectedParty}>
                <SelectTrigger id="party">
                  <SelectValue placeholder="Select party" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Parties</SelectItem>
                  {availableParties.map((party) => (
                    <SelectItem key={party.id} value={party.id}>
                      {party.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="paymentType">Payment Type</Label>
              <Select value={selectedPaymentType} onValueChange={setSelectedPaymentType}>
                <SelectTrigger id="paymentType">
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {paymentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Selection */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
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

            {/* Clear Button */}
            <Button variant="outline" onClick={handleClearFilters}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Payment Transactions</CardTitle>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No payment records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.referenceNo}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{item.party}</span>
                          <span className="text-xs text-muted-foreground capitalize">{item.partyType}</span>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{item.partyType}</TableCell>
                      <TableCell>{getPaymentTypeBadge(item.paymentType)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{item.description}</TableCell>
                      <TableCell className="text-right font-medium">{item.amount.toLocaleString()}</TableCell>

                    </TableRow>
                  ))
                )}
              </TableBody>
              {filteredData.length > 0 && (
                <TableFooter>
                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell colSpan={6} className="text-right">Total</TableCell>
                    <TableCell className="text-right">{totalAmount.toLocaleString()}</TableCell>
                    <TableCell></TableCell>
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
