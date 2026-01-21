import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSetPageHeader } from "@/hooks/usePageHeader";
import { format } from "date-fns";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Filter,
  Printer,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FilterDialog, DateRange, FilterValue } from "@/components/filters/FilterDialog";
import { ExportButtons, formatDate, formatCurrency } from "@/components/ExportButtons";

interface LedgerEntry {
  record: string | null;
  narration: string;
  reference_no: string;
  tdate: string;
  debit: string;
  credit: string;
  balance: string;
}

interface ContactInfo {
  id: number;
  name: string;
  phone: string;
  type: string;
}

export default function RcLedger() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [ledgerData, setLedgerData] = useState<LedgerEntry[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  
  useSetPageHeader(contactInfo?.name || "Customer Ledger", `Ledger for ${contactInfo?.type || "customer"}`);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined });
  const [keyValues, setKeyValues] = useState<FilterValue[]>([]);

  const fetchLedger = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const url = new URL(`${import.meta.env.VITE_API_URL}/contacts/receiveables/ledger/${id}`);
      
      if (searchQuery) url.searchParams.append("search", searchQuery);
      if (dateRange.from) url.searchParams.append("from_date", format(dateRange.from, "yyyy-MM-dd"));
      if (dateRange.to) url.searchParams.append("to_date", format(dateRange.to, "yyyy-MM-dd"));
      keyValues.forEach((kv) => {
        if (kv.key && kv.value) url.searchParams.append(kv.key, kv.value);
      });

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (response.ok) {
        setLedgerData(result.data);
        setContactInfo(result.info);
      } else {
        toast.error(result.message || "Failed to fetch ledger");
      }
    } catch (error) {
      console.error("Ledger Fetch Error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [id, searchQuery, dateRange, keyValues]);

  useEffect(() => {
    if (id) {
      const timer = setTimeout(() => {
        fetchLedger();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [id, fetchLedger]);

  const handleApplyFilters = (filters: { dateRange: DateRange; keyValues: FilterValue[] }) => {
    setDateRange(filters.dateRange);
    setKeyValues(filters.keyValues);
  };

  const hasActiveFilters = !!dateRange.from || !!dateRange.to || keyValues.length > 0;

  const totalDebit = ledgerData.reduce((acc, e) => acc + parseFloat(e.debit || "0"), 0);
  const totalCredit = ledgerData.reduce((acc, e) => acc + parseFloat(e.credit || "0"), 0);
  const currentBalance = ledgerData.length > 0 
    ? parseFloat(ledgerData[ledgerData.length - 1].balance) 
    : 0;

  if (isLoading && ledgerData.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
            <Printer className="w-4 h-4" /> Print
          </Button>
          <ExportButtons
            config={{
              filename: `receiveable-ledger-${id}-${new Date().toISOString().split('T')[0]}`,
              title: contactInfo?.name || "Customer Ledger",
              subtitle: `${contactInfo?.type || "Customer"} Ledger - Generated on ${new Date().toLocaleDateString('en-IN')}`,
              columns: [
                { key: "date", header: "Date", width: 12 },
                { key: "reference_no", header: "Reference", width: 15 },
                { key: "narration", header: "Description", width: 25 },
                { key: "debit", header: "Debit", width: 12 },
                { key: "credit", header: "Credit", width: 12 },
                { key: "balance", header: "Balance", width: 12 },
              ],
              data: ledgerData.map((entry) => ({
                ...entry,
                date: formatDate(entry.tdate),
                debit: parseFloat(entry.debit) > 0 ? formatCurrency(entry.debit) : "-",
                credit: parseFloat(entry.credit) > 0 ? formatCurrency(entry.credit) : "-",
                balance: formatCurrency(Math.abs(parseFloat(entry.balance))) + (parseFloat(entry.balance) < 0 ? " Dr" : " Cr"),
              })),
              totals: {
                narration: "Totals",
                debit: formatCurrency(totalDebit),
                credit: formatCurrency(totalCredit),
                balance: formatCurrency(Math.abs(currentBalance)),
              },
            }}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/10">
              <ArrowUpRight className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Debit</p>
              <p className="text-2xl font-bold text-destructive">
                ₹{totalDebit.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <ArrowDownLeft className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Credit</p>
              <p className="text-2xl font-bold text-success">
                ₹{totalCredit.toLocaleString("en-IN")}
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
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className={cn(
                "text-2xl font-bold",
                currentBalance < 0 ? "text-destructive" : "text-success"
              )}>
                ₹{Math.abs(currentBalance).toLocaleString("en-IN")}
                <span className="text-xs ml-1 uppercase">
                  {currentBalance < 0 ? "(Dr)" : "(Cr)"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search narration or reference..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        <Button
          variant="outline"
          className={cn("gap-2", hasActiveFilters && "border-primary text-primary")}
          onClick={() => setFilterDialogOpen(true)}
        >
          <Filter className="w-4 h-4" />
          Filter
          {hasActiveFilters && <Badge variant="secondary" className="ml-1 h-5 px-1.5">Active</Badge>}
        </Button>
      </div>

      {/* Ledger Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="p-4 text-sm font-semibold">Date</th>
                <th className="p-4 text-sm font-semibold">Reference</th>
                <th className="p-4 text-sm font-semibold">Description</th>
                <th className="p-4 text-sm font-semibold text-right">Debit</th>
                <th className="p-4 text-sm font-semibold text-right">Credit</th>
                <th className="p-4 text-sm font-semibold text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ledgerData.map((entry, index) => (
                <tr key={index} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-sm text-muted-foreground">
                    {new Date(entry.tdate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => entry.record && window.open(entry.record, '_blank')}
                      className={cn(
                        "font-mono text-xs uppercase transition-colors",
                        entry.record 
                          ? "text-primary hover:underline cursor-pointer font-medium" 
                          : "text-muted-foreground cursor-default"
                      )}
                      disabled={!entry.record}
                    >
                      {entry.reference_no}
                    </button>
                  </td>
                  <td className="p-4 text-sm font-medium">{entry.narration}</td>
                  <td className="p-4 text-right">
                    {parseFloat(entry.debit) > 0 ? (
                      <span className="text-destructive font-medium">
                        ₹{parseFloat(entry.debit).toLocaleString("en-IN")}
                      </span>
                    ) : "-"}
                  </td>
                  <td className="p-4 text-right">
                    {parseFloat(entry.credit) > 0 ? (
                      <span className="text-success font-medium">
                        ₹{parseFloat(entry.credit).toLocaleString("en-IN")}
                      </span>
                    ) : "-"}
                  </td>
                  <td className="p-4 text-right font-bold text-sm">
                    ₹{Math.abs(parseFloat(entry.balance)).toLocaleString("en-IN")}
                    <span className="text-[10px] ml-1">
                      {parseFloat(entry.balance) < 0 ? "Dr" : "Cr"}
                    </span>
                  </td>
                </tr>
              ))}
              {!isLoading && ledgerData.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No entries found
                  </td>
                </tr>
              )}
            </tbody>
            {ledgerData.length > 0 && (
              <tfoot>
                <tr className="bg-muted/30 font-bold border-t border-border">
                  <td colSpan={3} className="p-4 text-right text-sm">Totals</td>
                  <td className="p-4 text-right text-destructive">
                    ₹{totalDebit.toLocaleString("en-IN")}
                  </td>
                  <td className="p-4 text-right text-success">
                    ₹{totalCredit.toLocaleString("en-IN")}
                  </td>
                  <td className="p-4 text-right">
                    ₹{Math.abs(currentBalance).toLocaleString("en-IN")}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-border bg-card flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{ledgerData.length}</span> results
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Dialog */}
      <FilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        onApply={handleApplyFilters}
        showDateRange={true}
        filterFields={[
          { key: "reference_no", label: "Reference No.", placeholder: "e.g. INV-001" },
          { key: "type", label: "Transaction Type", placeholder: "debit or credit" },
        ]}
        initialDateRange={dateRange}
        initialKeyValues={keyValues}
      />
    </div>
  );
}
