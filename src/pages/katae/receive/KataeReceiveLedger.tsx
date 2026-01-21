import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { ArrowLeft, Search, Filter, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBackendSearch } from "@/hooks/useBackendSearch";
import { FilterDialog } from "@/components/filters/FilterDialog";
import { useSetPageHeader } from "@/hooks/usePageHeader";

interface LedgerEntry {
  id: string;
  date: string;
  receivedQty: number;
  receivedQtyCost: number;
  reference: string;
}

export default function KataeReceiveLedger() {
  const { id } = useParams();
  useSetPageHeader("Katae Receive Ledger", `Ledger for entry #${id}`);
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
    summary,
    pagination,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    nextPage,
    previousPage,
  } = useBackendSearch<LedgerEntry>({
    endpoint: `/katae/receive-ledger/${id}`,
    pageSize: 10,
  });

  const totalReceivedQty = summary?.total_received_qty || ledgerData.reduce((sum, entry) => sum + entry.receivedQty, 0);
  const totalReceivedCost = summary?.total_received_cost || ledgerData.reduce((sum, entry) => sum + entry.receivedQtyCost, 0);

  if (isLoading && ledgerData.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">Total Received Qty</p>
          <p className="text-2xl font-bold text-foreground">{totalReceivedQty.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">Total Received Cost</p>
          <p className="text-2xl font-bold text-success">Rs. {totalReceivedCost.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">Ledger Details</h3>
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
                placeholder="Search reference..."
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
                <th className="text-right">Received Qty</th>
                <th className="text-right">Received Qty Cost</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              {ledgerData.map((entry) => (
                <tr key={entry.id} className="animate-fade-in">
                  <td>{entry.date}</td>
                  <td className="text-right">{entry.receivedQty.toLocaleString()}</td>
                  <td className="text-right font-medium text-success">
                    Rs. {entry.receivedQtyCost.toLocaleString()}
                  </td>
                  <td className="font-medium">{entry.reference}</td>
                </tr>
              ))}
              {!isLoading && ledgerData.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted-foreground">
                    No entries found
                  </td>
                </tr>
              )}
            </tbody>
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
          { key: "reference", label: "Reference", placeholder: "e.g. REF-001" },
        ]}
        initialDateRange={dateRange}
        initialKeyValues={keyValues}
      />
    </div>
  );
}
