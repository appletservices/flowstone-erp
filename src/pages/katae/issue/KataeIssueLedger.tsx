import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, Search, TrendingUp, 
  TrendingDown, Wallet, Loader2 
} from "lucide-react";

// Matches your specific API response fields
interface LedgerEntry {
  id: number;
  kv: number;
  amount: string;
  product: string;
  issue: string;
  received: string;
  tdate: string;
}

export default function KataeIssueLedger() {
  const navigate = useNavigate();
  const { v, p } = useParams(); // v = vendor id (kv), p = product id
  
  const [ledgerData, setLedgerData] = useState<LedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchLedger = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("auth_token");
        // Updated endpoint to match your requirement
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/katae/issue/ledger/${v}/${p}`,
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

  // Calculate totals and running balances locally
  const processedData = useMemo(() => {
    let balance = 0;
    // We sort by date ascending to calculate the running balance correctly, 
    // then reverse for the display (newest first)
    return [...ledgerData]
      .sort((a, b) => new Date(a.tdate).getTime() - new Date(b.tdate).getTime())
      .map((entry) => {
        const issueVal = parseFloat(entry.issue || "0");
        const receivedVal = parseFloat(entry.received || "0");
        balance = balance + issueVal - receivedVal;
        return { ...entry, running_balance: balance };
      })
      
  }, [ledgerData]);

  const filteredData = processedData.filter(
    (entry) =>
      entry.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tdate.includes(searchQuery)
  );

  const totalIssued = ledgerData.reduce((sum, entry) => sum + parseFloat(entry.issue), 0);
  const totalReceived = ledgerData.reduce((sum, entry) => sum + parseFloat(entry.received), 0);
  const currentBalance = totalIssued - totalReceived;

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
            <h1 className="text-3xl font-bold tracking-tight">Katae Issue Ledger</h1>
            <p className="text-muted-foreground">
              {ledgerData[0] ? `Product: ${ledgerData[0].product}` : "No records found"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/10">
              <TrendingUp className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Issued</p>
              <p className="text-2xl font-bold">{totalIssued.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <TrendingDown className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Received</p>
              <p className="text-2xl font-bold">{totalReceived.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Balance</p>
              <p className="text-2xl font-bold">{currentBalance.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

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
                <th>Product</th>
                <th className="text-right">Issued</th>
                <th className="text-right">Received</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((entry, index) => (
                <tr key={`${entry.id}-${index}`}>
                  <td>{entry.tdate}</td>
                  <td>{entry.product}</td>
                  <td className="text-right text-destructive font-medium">
                    {parseFloat(entry.issue) > 0 ? parseFloat(entry.issue).toFixed(2) : "-"}
                  </td>
                  <td className="text-right text-success font-medium">
                    {parseFloat(entry.received) > 0 ? parseFloat(entry.received).toFixed(2) : "-"}
                  </td>
                  <td className="text-right font-bold">
                    {entry.amount.toLocaleString()}
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