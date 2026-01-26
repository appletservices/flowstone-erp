import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Search,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  BookOpen,
  Loader2
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

interface LedgerEntry {
  edate: string;
  reference_no: string;
  type: string;
  account: string;
  narration: string;
  debit: string;
  credit: string;
}

interface AccountOption {
  id: number;
  name: string;
}

export default function AccountLedger() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<LedgerEntry[]>([]);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  const voucherTypeConfig: any = {
    journal: { label: "Journal", color: "bg-muted text-muted-foreground" },
    payment: { label: "Payment", color: "bg-destructive/10 text-destructive" },
    receipt: { label: "Receipt", color: "bg-success/10 text-success" },
    contra: { label: "Contra", color: "bg-warning/10 text-warning" },
    issue: { label: "Issue", color: "bg-blue-100 text-blue-700" },
    receive: { label: "Receive", color: "bg-emerald-100 text-emerald-700" },
    opening: { label: "Opening", color: "bg-purple-100 text-purple-700" },
  };

  // Fetch Dropdown Options
  useEffect(() => {
    const fetchDropdown = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/account/child/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` }
        });
        const result = await response.json();
        setAccounts(result.data || result);
      } catch (e) { console.error("Dropdown error", e); }
    };
    fetchDropdown();
  }, []);

  // Fetch Ledger Data
  useEffect(() => {
    const fetchLedger = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/reports/account/ledger/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` }
        });
        const result = await response.json();
        setData(result.data || []);
      } catch (e) { console.error("Fetch error", e); }
      finally { setIsLoading(false); }
    };
    fetchLedger();
  }, [id]);

  const filteredData = data.filter((entry) => {
    const matchesSearch =
      entry.narration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.reference_no.toLowerCase().includes(searchQuery.toLowerCase());
    
    const entryDate = new Date(entry.edate);
    const matchesDateFrom = !dateFrom || entryDate >= dateFrom;
    const matchesDateTo = !dateTo || entryDate <= dateTo;

    return matchesSearch && matchesDateFrom && matchesDateTo;
  });

  // Calculate totals and running balance
  let runningBalance = 0;
  const processedRows = filteredData.map(entry => {
    runningBalance += (parseFloat(entry.debit) - parseFloat(entry.credit));
    return { ...entry, balance: runningBalance };
  });

  const totals = filteredData.reduce(
    (acc, entry) => ({
      debit: acc.debit + parseFloat(entry.debit),
      credit: acc.credit + parseFloat(entry.credit),
    }),
    { debit: 0, credit: 0 }
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const currentAccountName = accounts.find(a => a.id.toString() === id)?.name || "Account";

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
            <div className="text-lg font-bold">{currentAccountName}</div>
            <p className="text-sm text-muted-foreground">Code: {id}</p>
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
            <p className="text-sm text-muted-foreground">{filteredData.filter(e => parseFloat(e.debit) > 0).length} entries</p>
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
            <p className="text-sm text-muted-foreground">{filteredData.filter(e => parseFloat(e.credit) > 0).length} entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Closing Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {formatCurrency(processedRows[processedRows.length - 1]?.balance || 0)}
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
          <Select value={id} onValueChange={(val) => navigate(`/account/ledger/${val}`)}>
            <SelectTrigger>
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id.toString()}>
                  {account.id} - {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search reference or narration..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead className="w-[150px]">Reference No</TableHead>
                <TableHead className="w-[120px]">Type</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Narration</TableHead>
                <TableHead className="text-right w-[140px]">Debit</TableHead>
                <TableHead className="text-right w-[140px]">Credit</TableHead>
                <TableHead className="text-right w-[150px]">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-20"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></TableCell>
                </TableRow>
              ) : processedRows.map((entry, index) => {
                const config = voucherTypeConfig[entry.type] || { label: entry.type, color: "bg-muted text-muted-foreground" };
                return (
                  <TableRow key={index} className="group hover:bg-muted/30">
                    <TableCell className="font-mono text-sm">
                      {format(new Date(entry.edate), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">{entry.reference_no}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn("text-xs capitalize", config.color)}>
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{entry.account}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">{entry.narration}</div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {parseFloat(entry.debit) > 0 ? (
                        <span className="text-success font-medium">{formatCurrency(parseFloat(entry.debit))}</span>
                      ) : <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {parseFloat(entry.credit) > 0 ? (
                        <span className="text-destructive font-medium">{formatCurrency(parseFloat(entry.credit))}</span>
                      ) : <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {formatCurrency(entry.balance)}
                    </TableCell>
                  </TableRow>
                );
              })}

              {!isLoading && processedRows.length > 0 && (
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell colSpan={5} className="text-right">Total</TableCell>
                  <TableCell className="text-right font-mono text-success">{formatCurrency(totals.debit)}</TableCell>
                  <TableCell className="text-right font-mono text-destructive">{formatCurrency(totals.credit)}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(processedRows[processedRows.length - 1]?.balance || 0)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}