import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Filter,
  Download,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// --- Types for Dynamic API Response ---
interface LedgerEntry {
  id: number;
  unit: number;
  name: string;
  in: string;
  out: string;
  reference_no: string;
  narration: string;
  entry_id: number;
  updated_at: string;
  total_cost: string;
  running: string;
  running_amount: string;
}



export default function Ledger() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();

  // State for dynamic data
  const [ledgerData, setLedgerData] = useState<LedgerEntry[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);

  // --- Dynamic API Fetching Logic ---
  useEffect(() => {
    const fetchLedger = async () => {
      setLoading(true);
      try {

         const token = localStorage.getItem("auth_token"); 
          const response = await fetch(`${import.meta.env.VITE_API_URL}/inventory/ledger/${id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`, 
            },
          });

          const result = await response.json();
        
        setLedgerData(result.data);
        setTotalRecords(result.recordsTotal);
      } catch (error) {
        console.error("Error fetching ledger data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchLedger();
  }, [id]);

  // Calculations based on dynamic data
  const totalIn = ledgerData.reduce((acc, curr) => acc + parseFloat(curr.in), 0);
  const totalOut = ledgerData.reduce((acc, curr) => acc + parseFloat(curr.out), 0);
  const currentBalance = ledgerData.length > 0 
    ? parseFloat(ledgerData[ledgerData.length - 1].running_amount) 
    : 0;

  if (loading) {
    return <div className="p-10 text-center">Loading ledger details...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {ledgerData[0]?.name || "Inventory Ledger"}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="capitalize">{type || 'Inventory'}</Badge>
              <span className="text-sm text-muted-foreground">ID: {id}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards - Calculated Dynamically */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <ArrowDownLeft className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total In</p>
              <p className="text-2xl font-bold text-success">
                {totalIn.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/10">
              <ArrowUpRight className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Out</p>
              <p className="text-2xl font-bold text-destructive">
                {totalOut.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Running Balance</p>
              <p className={cn(
                "text-2xl font-bold",
                currentBalance < 0 ? "text-destructive" : "text-success"
              )}>
                {currentBalance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Filter by date range..." className="pl-10" />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Ledger Table - Populated Dynamically */}
      <div className="bg-card rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="data-table w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="p-4">Date</th>
                <th className="p-4">Reference</th>
                <th className="p-4">Description</th>
                <th className="p-4 text-right">In</th>
                <th className="p-4 text-right">Out</th>
                <th className="p-4 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {ledgerData.map((entry) => (
                <tr key={entry.id} className="border-b border-border hover:bg-muted/5 animate-fade-in">
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(entry.updated_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-sm text-muted-foreground">
                      {entry.reference_no}
                    </span>
                  </td>
                  <td className="p-4 font-medium capitalize">
                    {entry.narration.replace(/-/g, ' ')}
                  </td>
                  <td className="p-4 text-right text-success font-medium">
                    {parseFloat(entry.in) > 0 ? parseFloat(entry.in).toLocaleString() : "-"}
                  </td>
                  <td className="p-4 text-right text-destructive font-medium">
                    {parseFloat(entry.out) > 0 ? parseFloat(entry.out).toLocaleString() : "-"}
                  </td>
                  <td className="p-4 text-right font-semibold">
                    {parseFloat(entry.running_amount).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/50 font-semibold">
                <td colSpan={3} className="p-4 text-right">Totals</td>
                <td className="p-4 text-right text-success">{totalIn.toLocaleString()}</td>
                <td className="p-4 text-right text-destructive">{totalOut.toLocaleString()}</td>
                <td className="p-4 text-right">{currentBalance.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}