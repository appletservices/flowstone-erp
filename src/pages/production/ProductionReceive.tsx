import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ChevronRight, Search, Loader2, Filter } from "lucide-react";
import { usePageHeader } from "@/hooks/usePageHeader";
import { useBackendSearch } from "@/hooks/useBackendSearch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterDialog } from "@/components/filters/FilterDialog";

interface ReceiveRecord {
  id: number;
  edate: string;
  ref: string;
  karigar: string;
  product: string;
  issued: number;
  receive_qty: string;
  labour_charges: number;
  final_cost: number;
}

export default function ProductionReceive() {
  const navigate = useNavigate();
  const { setHeaderInfo } = usePageHeader();
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  useEffect(() => {
    setHeaderInfo({ title: "Production Receive", subtitle: "View and manage production receive records" });
  }, [setHeaderInfo]);

  const {
    data,
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
  } = useBackendSearch<ReceiveRecord>({
    endpoint: "/production/receive/list",
    pageSize: 10,
  });

  if (isLoading && data.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">All Records</h3>
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
                placeholder="Search records..."
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
            <Button className="gap-2" onClick={() => navigate("/production/receive/new")}>
              <Plus className="w-4 h-4" />
              Create
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Reference</th>
                <th>Karigar</th>
                <th>Product</th>
                <th className="text-right">Issued</th>
                <th className="text-right">Received</th>
                <th className="text-right">L.Charges</th>
                <th className="text-right">Final Cost</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.map((record) => (
                <tr
                  key={record.id}
                  className="animate-fade-in cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/production/receive/${record.id}`)}
                >
                  <td>{record.edate}</td>
                  <td className="font-medium">{record.ref}</td>
                  <td>{record.karigar}</td>
                  <td>{record.product}</td>
                  <td className="text-right">{record.issued}</td>
                  <td className="text-right">{parseFloat(record.receive_qty).toLocaleString()}</td>
                  <td className="text-right">{record.labour_charges}</td>
                  <td className="text-right font-medium text-success">₹{record.final_cost?.toLocaleString()}</td>
                  <td>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/ledger/production-receive/${record.id}`);
                      }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {!isLoading && data.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground">No records found</td>
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
          { key: "karigar", label: "Karigar", placeholder: "e.g. Worker name" },
          { key: "product", label: "Product", placeholder: "e.g. Product name" },
        ]}
        initialDateRange={dateRange}
        initialKeyValues={keyValues}
      />
    </div>
  );
}
