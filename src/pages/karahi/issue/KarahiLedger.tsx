import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Search, Filter, TrendingUp,
  TrendingDown, Wallet, Loader2, Printer
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBackendSearch } from "@/hooks/useBackendSearch";
import { FilterDialog } from "@/components/filters/FilterDialog";
import { useSetPageHeader } from "@/hooks/usePageHeader";
import { ExportButtons, formatDate, formatCurrency } from "@/components/ExportButtons";

interface LedgerEntry {
  id: number;
  kv: number;
  vendor: string;
  amount: string;
  product: string;
  reference_no: string,
  issue: string;
  received: string;
  tdate: string;
  running_balance: number;
}

export default function KarahiLedger() {
  const navigate = useNavigate();
  const { v, p } = useParams();
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  const {
    data: ledgerData,
    isLoading,
    searchQuery,
    setSearchQuery,
    dateRange,
    keyValues,
    applyFilters,
    hasActiveFilters,
    summary,
    pagination,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    nextPage,
    previousPage,
  } = useBackendSearch<LedgerEntry>({
    endpoint: `/karahi/issued-ledger/${v}/${p}`,
    pageSize: 10,
  });

  // Set page header
  const vendorProduct = ledgerData[0] ? `${ledgerData[0].vendor} - ${ledgerData[0].product}` : "Loading...";
  useSetPageHeader("Karahi Ledger", vendorProduct);

  // Derived state for summary
  const totalIssued = summary?.total_issued || ledgerData.reduce((sum, entry) => sum + parseFloat(entry.issue || "0"), 0);
  const totalReceived = summary?.total_received || ledgerData.reduce((sum, entry) => sum + parseFloat(entry.received || "0"), 0);
  const currentBalance = summary?.current_balance || ledgerData[0]?.running_balance || 0;

  if (isLoading && ledgerData.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
            <Printer className="w-4 h-4" /> Print
          </Button>
          <ExportButtons
            config={{
              filename: `karahi-ledger-${v}-${p}-${new Date().toISOString().split('T')[0]}`,
              title: vendorProduct,
              subtitle: `Karahi Ledger - Generated on ${new Date().toLocaleDateString('en-IN')}`,
              columns: [
                { key: "date", header: "Date", width: 12 },
                { key: "reference", header: "Reference No", width: 15 },
                { key: "issue", header: "Issue Qty", width: 12 },
                { key: "amount", header: "Amount", width: 12 },
              ],
              data: ledgerData.map((entry) => ({
                date: entry.tdate,
                reference: entry.id,
                issue: parseFloat(entry.issue) > 0 ? parseFloat(entry.issue).toLocaleString() : "-",
                amount: parseFloat(entry.amount) > 0 ? formatCurrency(entry.amount) : "-",
              })),
              totals: {
                date: "Totals",
                issue: totalIssued.toLocaleString(),
                amount: formatCurrency(ledgerData.reduce((sum, e) => sum + parseFloat(e.amount || "0"), 0)),
              },
            }}
          />
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
          <div className="flex items-center gap-4">
            <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card">
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="25">25 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
                <SelectItem value="100">100 / page</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            <Button
              variant="outline"
              size="sm"
              className={cn("gap-2", hasActiveFilters && "border-primary text-primary")}
              onClick={() => setFilterDialogOpen(true)}
            >
              <Filter className="w-4 h-4" />
              Filter
              {hasActiveFilters && <Badge variant="secondary" className="ml-1 h-5 px-1.5">Active</Badge>}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Reference No</th>
                <th className="text-right">Issue Qty</th>
                <th className="text-right">Received Qty</th>
                <th className="text-right">Amount</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {ledgerData.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.tdate}</td>
                  <td className="font-mono text-sm">{entry.reference_no}</td>
                  <td className="text-right">
                    {parseFloat(entry.issue) > 0 ? parseFloat(entry.issue).toLocaleString() : "-"}
                  </td>
                  <td className="text-right">
                    {parseFloat(entry.received) > 0 ? parseFloat(entry.received).toLocaleString() : "-"}
                  </td>
                  <td className="text-right">
                    {parseFloat(entry.amount) > 0 ? `${parseFloat(entry.amount).toLocaleString()}` : "-"}
                  </td>
                  <td className="text-center">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </td>
                </tr>
              ))}
              {!isLoading && ledgerData.length === 0 && (
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
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.totalRecords)} of {pagination.totalRecords} results
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={previousPage} disabled={currentPage === 1}>
              Previous
            </Button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum = pagination.totalPages <= 5 ? i + 1 : (currentPage <= 3 ? i + 1 : (currentPage >= pagination.totalPages - 2 ? pagination.totalPages - 4 + i : currentPage - 2 + i));
              return (
                <Button
                  key={pageNum}
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className={currentPage === pageNum ? "bg-primary text-primary-foreground" : ""}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button variant="outline" size="sm" onClick={nextPage} disabled={currentPage === pagination.totalPages}>
              Next
            </Button>
          </div>
        </div>
      </div>

      <FilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        onApply={applyFilters}
        showDateRange={true}
        filterFields={[
          { key: "reference_no", label: "Reference No", placeholder: "e.g. REF-001" },
        ]}
        initialDateRange={dateRange}
        initialKeyValues={keyValues}
      />
    </div>
  );
}
