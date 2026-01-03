import { useState } from "react";
import {
  ChevronRight,
  Search,
  Filter,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  Printer,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
// import { exportToExcel, exportToPdf } from "@/lib/exportUtils";

interface LedgerEntry {
  id: string;
  date: string;
  voucherNo: string;
  voucherType: "journal" | "payment" | "receipt" | "contra" | "sale" | "purchase";
  particulars: string;
  debit: number;
  credit: number;
  balance: number;
  narration?: string;
}

const accounts = [
  { id: "1101", name: "Cash in Hand", type: "asset" },
  { id: "1102", name: "Bank - SBI Current", type: "asset" },
  { id: "1111", name: "Inventory - Paddy", type: "asset" },
  { id: "1112", name: "Inventory - Rice", type: "asset" },
  { id: "2101", name: "Trade Payables", type: "liability" },
  { id: "4101", name: "Sales - Rice", type: "income" },
  { id: "5201", name: "Wages & Salaries", type: "expense" },
];

const ledgerData: LedgerEntry[] = [
  {
    id: "1",
    date: "2024-01-01",
    voucherNo: "OB-001",
    voucherType: "journal",
    particulars: "Opening Balance",
    debit: 125000,
    credit: 0,
    balance: 125000,
  },
  {
    id: "2",
    date: "2024-01-05",
    voucherNo: "RV-001",
    voucherType: "receipt",
    particulars: "Received from M/s Sharma Traders",
    debit: 85000,
    credit: 0,
    balance: 210000,
    narration: "Against Invoice SI-2024-0015",
  },
  {
    id: "3",
    date: "2024-01-08",
    voucherNo: "PV-001",
    voucherType: "payment",
    particulars: "Paid to M/s Paddy Suppliers",
    debit: 0,
    credit: 45000,
    balance: 165000,
    narration: "Against Purchase PI-2024-0023",
  },
  {
    id: "4",
    date: "2024-01-10",
    voucherNo: "RV-002",
    voucherType: "receipt",
    particulars: "Received from M/s Gujarat Cotton Mills",
    debit: 120000,
    credit: 0,
    balance: 285000,
    narration: "Part payment for Cotton Lint",
  },
  {
    id: "5",
    date: "2024-01-12",
    voucherNo: "PV-002",
    voucherType: "payment",
    particulars: "Wages Payment - January Week 1",
    debit: 0,
    credit: 35000,
    balance: 250000,
    narration: "Factory wages for 15 workers",
  },
  {
    id: "6",
    date: "2024-01-15",
    voucherNo: "PV-003",
    voucherType: "payment",
    particulars: "Electricity Bill Payment",
    debit: 0,
    credit: 28000,
    balance: 222000,
    narration: "EB Bill for December 2023",
  },
  {
    id: "7",
    date: "2024-01-18",
    voucherNo: "RV-003",
    voucherType: "receipt",
    particulars: "Received from M/s Rice Mart",
    debit: 65000,
    credit: 0,
    balance: 287000,
    narration: "Full payment SI-2024-0018",
  },
  {
    id: "8",
    date: "2024-01-20",
    voucherNo: "CV-001",
    voucherType: "contra",
    particulars: "Cash Deposited to Bank",
    debit: 0,
    credit: 150000,
    balance: 137000,
    narration: "Deposited to SBI Current A/c",
  },
  {
    id: "9",
    date: "2024-01-22",
    voucherNo: "PV-004",
    voucherType: "payment",
    particulars: "Transport Charges",
    debit: 0,
    credit: 12000,
    balance: 125000,
    narration: "Freight for cotton delivery",
  },
  {
    id: "10",
    date: "2024-01-25",
    voucherNo: "RV-004",
    voucherType: "receipt",
    particulars: "Received from M/s Bran Exports",
    debit: 25000,
    credit: 0,
    balance: 150000,
    narration: "Bran sale payment",
  },
];

const voucherTypeConfig = {
  journal: { label: "Journal", color: "bg-muted text-muted-foreground" },
  payment: { label: "Payment", color: "bg-destructive/10 text-destructive" },
  receipt: { label: "Receipt", color: "bg-success/10 text-success" },
  contra: { label: "Contra", color: "bg-warning/10 text-warning" },
  sale: { label: "Sale", color: "bg-primary/10 text-primary" },
  purchase: { label: "Purchase", color: "bg-secondary/10 text-secondary" },
};

export default function AccountLedger() {
  const [selectedAccount, setSelectedAccount] = useState("1101");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  const currentAccount = accounts.find((a) => a.id === selectedAccount);

  const filteredData = ledgerData.filter((entry) => {
    const matchesSearch =
      entry.particulars.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.voucherNo.toLowerCase().includes(searchQuery.toLowerCase());
    
    const entryDate = new Date(entry.date);
    const matchesDateFrom = !dateFrom || entryDate >= dateFrom;
    const matchesDateTo = !dateTo || entryDate <= dateTo;

    return matchesSearch && matchesDateFrom && matchesDateTo;
  });

  const totals = filteredData.reduce(
    (acc, entry) => ({
      debit: acc.debit + entry.debit,
      credit: acc.credit + entry.credit,
    }),
    { debit: 0, credit: 0 }
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const exportConfig = {
    title: `Ledger - ${currentAccount?.name || selectedAccount}`,
    columns: [
      { header: "Date", accessor: "date" },
      { header: "Voucher No", accessor: "voucherNo" },
      { header: "Type", accessor: "type" },
      { header: "Particulars", accessor: "particulars" },
      { header: "Debit", accessor: "debit", format: (v: number) => v > 0 ? formatCurrency(v) : "-" },
      { header: "Credit", accessor: "credit", format: (v: number) => v > 0 ? formatCurrency(v) : "-" },
      { header: "Balance", accessor: "balance", format: (v: number) => formatCurrency(v) },
    ],
    data: filteredData.map((entry) => ({
      date: format(new Date(entry.date), "dd MMM yyyy"),
      voucherNo: entry.voucherNo,
      type: voucherTypeConfig[entry.voucherType].label,
      particulars: entry.particulars,
      debit: entry.debit,
      credit: entry.credit,
      balance: entry.balance,
    })),
    summary: [
      { label: "Total Debit", value: formatCurrency(totals.debit) },
      { label: "Total Credit", value: formatCurrency(totals.credit) },
      { label: "Closing Balance", value: formatCurrency(filteredData[filteredData.length - 1]?.balance || 0) },
    ],
  };

//   const handleExportExcel = () => exportToExcel(exportConfig);
//   const handleExportPdf = () => exportToPdf(exportConfig);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payment Report</h1>
          <p className="text-muted-foreground mt-1">
            Filter and view payment transactions
          </p>
        </div>
        <CreditCard className="h-8 w-8 text-primary" />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{currentAccount?.name}</div>
            <p className="text-sm text-muted-foreground">Code: {selectedAccount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-success" />
              Total Debit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-success">{formatCurrency(totals.debit)}</div>
            <p className="text-sm text-muted-foreground">{filteredData.filter(e => e.debit > 0).length} entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowDownLeft className="h-4 w-4 text-destructive" />
              Total Credit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-destructive">{formatCurrency(totals.credit)}</div>
            <p className="text-sm text-muted-foreground">{filteredData.filter(e => e.credit > 0).length} entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Closing Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {formatCurrency(filteredData[filteredData.length - 1]?.balance || 0)}
            </div>
            <p className="text-sm text-muted-foreground">
              {totals.debit > totals.credit ? "Debit" : "Credit"} Balance
            </p>
          </CardContent>
        </Card>
      </div>

      
      {/* Account Selector & Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="w-80">
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.id} - {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search voucher or particulars..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              {dateFrom ? format(dateFrom, "dd MMM yyyy") : "From Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent mode="single" selected={dateFrom} onSelect={setDateFrom} />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              {dateTo ? format(dateTo, "dd MMM yyyy") : "To Date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent mode="single" selected={dateTo} onSelect={setDateTo} />
          </PopoverContent>
        </Popover>

        {(dateFrom || dateTo || searchQuery) && (
          <Button
            variant="ghost"
            onClick={() => {
              setDateFrom(undefined);
              setDateTo(undefined);
              setSearchQuery("");
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Ledger Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[100px]">Date</TableHead>
                <TableHead className="w-[100px]">Voucher No</TableHead>
                <TableHead className="w-[100px]">Type</TableHead>
                <TableHead>Particulars</TableHead>
                <TableHead className="text-right w-[120px]">Debit</TableHead>
                <TableHead className="text-right w-[120px]">Credit</TableHead>
                <TableHead className="text-right w-[140px]">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((entry) => {
                const typeConfig = voucherTypeConfig[entry.voucherType];
                return (
                  <TableRow key={entry.id} className="group hover:bg-muted/30">
                    <TableCell className="font-mono text-sm">
                      {format(new Date(entry.date), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button variant="link" className="p-0 h-auto font-mono text-sm">
                        {entry.voucherNo}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn("text-xs", typeConfig.color)}>
                        {typeConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{entry.particulars}</div>
                      {entry.narration && (
                        <div className="text-xs text-muted-foreground mt-0.5">{entry.narration}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {entry.debit > 0 ? (
                        <span className="text-success font-medium">{formatCurrency(entry.debit)}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {entry.credit > 0 ? (
                        <span className="text-destructive font-medium">{formatCurrency(entry.credit)}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {formatCurrency(entry.balance)}
                    </TableCell>
                  </TableRow>
                );
              })}

              {/* Totals Row */}
              <TableRow className="bg-muted/50 font-bold">
                <TableCell colSpan={4} className="text-right">
                  Total
                </TableCell>
                <TableCell className="text-right font-mono text-success">
                  {formatCurrency(totals.debit)}
                </TableCell>
                <TableCell className="text-right font-mono text-destructive">
                  {formatCurrency(totals.credit)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {formatCurrency(filteredData[filteredData.length - 1]?.balance || 0)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
