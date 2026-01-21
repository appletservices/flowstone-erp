import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSetPageHeader } from "@/hooks/usePageHeader";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  Printer,
  Loader2,
  Calendar,
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
import { cn } from "@/lib/utils";
import { useBackendSearch } from "@/hooks/useBackendSearch";
import { FilterDialog } from "@/components/filters/FilterDialog";
import { ExportButtons, formatDate } from "@/components/ExportButtons";

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
    pagination,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    nextPage,
    previousPage,
    summary,
  } = useBackendSearch<LedgerEntry>({
    endpoint: `/inventory/ledger/${id}`,
    pageSize: 10,
  });

  // Calculations based on dynamic data
  const totalIn = ledgerData.reduce((acc, curr) => acc + parseFloat(curr.in || "0"), 0);
  const totalOut = ledgerData.reduce((acc, curr) => acc + parseFloat(curr.out || "0"), 0);
  const currentBalance = ledgerData.length > 0 
    ? parseFloat(ledgerData[ledgerData.length - 1].running_amount || "0") 
    : 0;

  const itemName = ledgerData.length > 0 ? ledgerData[0]?.name : "Inventory Ledger";
  
  useSetPageHeader(itemName, `${type || 'Inventory'} ledger - ID: ${id}`);

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
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <ExportButtons
            config={{
              filename: `ledger-${id}-${new Date().toISOString().split('T')[0]}`,
              title: itemName,
              subtitle: `${type || 'Inventory'} Ledger - Generated on ${new Date().toLocaleDateString('en-IN')}`,
              columns: [
                { key: "date", header: "Date", width: 12 },
                { key: "reference_no", header: "Reference", width: 15 },
                { key: "narration", header: "Description", width: 25 },
                { key: "in", header: "In", width: 12 },
                { key: "out", header: "Out", width: 12 },
                { key: "running_amount", header: "Balance", width: 12 },
              ],
              data: ledgerData.map((entry) => ({
                ...entry,
                date: formatDate(entry.updated_at),
                in: parseFloat(entry.in || "0") > 0 ? parseFloat(entry.in).toLocaleString() : "-",
                out: parseFloat(entry.out || "0") > 0 ? parseFloat(entry.out).toLocaleString() : "-",
                running_amount: parseFloat(entry.running_amount || "0").toLocaleString(),
              })),
              totals: {
                narration: "Totals",
                in: totalIn.toLocaleString(),
                out: totalOut.toLocaleString(),
                running_amount: currentBalance.toLocaleString(),
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

      {/* Table Card */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">Ledger Entries</h3>
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
                placeholder="Search entries..." 
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
                <th>Reference</th>
                <th>Description</th>
                <th className="text-right">In</th>
                <th className="text-right">Out</th>
                <th className="text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {ledgerData.map((entry) => (
                <tr key={entry.id} className="animate-fade-in">
                  <td className="text-sm text-muted-foreground">
                    {new Date(entry.updated_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    <span className="font-mono text-sm text-muted-foreground">
                      {entry.reference_no}
                    </span>
                  </td>
                  <td className="font-medium capitalize">
                    {entry.narration?.replace(/-/g, ' ') || '-'}
                  </td>
                  <td className="text-right text-success font-medium">
                    {parseFloat(entry.in || "0") > 0 ? parseFloat(entry.in).toLocaleString() : "-"}
                  </td>
                  <td className="text-right text-destructive font-medium">
                    {parseFloat(entry.out || "0") > 0 ? parseFloat(entry.out).toLocaleString() : "-"}
                  </td>
                  <td className="text-right font-semibold">
                    {parseFloat(entry.running_amount || "0").toLocaleString()}
                  </td>
                </tr>
              ))}
              {!isLoading && ledgerData.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">No entries found</td>
                </tr>
              )}
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
              if (pageNum < 1 || pageNum > pagination.totalPages) return null;
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
          { key: "type", label: "Type", placeholder: "e.g. in, out" },
        ]}
        initialDateRange={dateRange}
        initialKeyValues={keyValues}
      />
    </div>
  );
}
