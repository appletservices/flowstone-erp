import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, Search, Filter, TrendingUp, 
  TrendingDown, Wallet, Loader2 
} from "lucide-react";

// Updated interface to match your API response
interface LedgerEntry {
  id: number;
  kv: number;
  vendor: string;
  amount: string;
  product: string;
  issue: string;
  received: string;
  tdate: string;
  running_balance: number;
}

export default function KataeIssueLedger() {
  const navigate = useNavigate();
  // Capture v (vendor) and p (product) from the route /karahi/issued-ledger/:v/:p
  const { v, p } = useParams();
  
  const [ledgerData, setLedgerData] = useState<LedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Fetch data from API
  useEffect(() => {
    const fetchLedger = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/katae/issued-ledger/${v}/${p}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const result = await response.json();
        if (result.data) {
          setLedgerData(result.data);
        }
      } catch (error) {
        console.error("Error fetching ledger:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (v && p) fetchLedger();
  }, [v, p]);

  // Derived state for summary and filtering
  const filteredData = ledgerData.filter(
    (entry) =>
      entry.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tdate.includes(searchQuery)
  );

  const totalIssued = ledgerData.reduce((sum, entry) => sum + parseFloat(entry.issue), 0);
  const totalReceived = ledgerData.reduce((sum, entry) => sum + parseFloat(entry.received), 0);
  const currentBalance = ledgerData[0]?.running_balance || 0; // Using running_balance from API

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Katae issue Ledger</h1>
            <p className="text-muted-foreground">
              {ledgerData[0] ? `${ledgerData[0].vendor} - ${ledgerData[0].product}` : "No records found"}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Received</p>
              <p className="text-2xl font-bold">{totalReceived.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/10">
              <TrendingDown className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Issued</p>
              <p className="text-2xl font-bold">{totalIssued.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="text-2xl font-bold">{currentBalance.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">Transaction History</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by date..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Vendor</th>
                <th className="text-right">Issued</th>
                <th className="text-right">Received</th>
                <th className="text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.tdate}</td>
                  <td>{entry.vendor}</td>
                  <td className="text-right text-destructive">
                    {parseFloat(entry.issue) > 0 ? parseFloat(entry.issue).toLocaleString() : "-"}
                  </td>
                  <td className="text-right text-success">
                    {parseFloat(entry.received) > 0 ? parseFloat(entry.received).toLocaleString() : "-"}
                  </td>
                  <td className="text-right font-medium">
                    {entry.running_balance.toLocaleString()}
                  </td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">
                    No ledger entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages || 1}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}