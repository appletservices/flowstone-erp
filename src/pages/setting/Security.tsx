import { useState } from "react";
import { Search, Filter, Shield, Activity, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBackendSearch } from "@/hooks/useBackendSearch";
import { FilterDialog, DateRange, FilterValue } from "@/components/filters/FilterDialog";

interface DataItem {
  key: string;
  value: string;
}

interface SecurityLog {
  action: string;
  user: string;
  data: string;
  last_activity_time: string;
  reference_no: string;
  table: string;
  tdate: string;
  feature: string;
}

const Security = () => {
  const [filterOpen, setFilterOpen] = useState(false);

  const {
    data: logs,
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
  } = useBackendSearch<SecurityLog>({
    endpoint: "/system/useractivity/list",
    pageSize: 10,
  });

  const parseActivityData = (jsonString: string): DataItem[] => {
    try {
      const parsed = JSON.parse(jsonString);
      return Object.entries(parsed).map(([key, value]) => ({
        key: key.replace(/_/g, " ").toUpperCase(),
        value: typeof value === "object" ? JSON.stringify(value) : String(value),
      }));
    } catch (e) {
      return [{ key: "INFO", value: "Standard entry" }];
    }
  };

  const filterFields = [
    { key: "action", label: "Action", placeholder: "e.g. create, update, delete" },
    { key: "feature", label: "Feature", placeholder: "e.g. katae-inventory" },
    { key: "user", label: "User", placeholder: "e.g. Admin" },
  ];

  const handleApplyFilters = (filters: { dateRange: DateRange; keyValues: FilterValue[] }) => {
    applyFilters(filters);
  };

  // Pagination button rendering
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    const totalPages = pagination.totalPages;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <Button
            key={i}
            variant={currentPage === i ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentPage(i)}
            className="w-8 h-8"
          >
            {i}
          </Button>
        );
      }
    } else {
      buttons.push(
        <Button key={1} variant={currentPage === 1 ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(1)} className="w-8 h-8">1</Button>
      );
      if (currentPage > 3) {
        buttons.push(<span key="ellipsis1" className="px-2 text-muted-foreground">...</span>);
      }
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        buttons.push(
          <Button key={i} variant={currentPage === i ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(i)} className="w-8 h-8">{i}</Button>
        );
      }
      if (currentPage < totalPages - 2) {
        buttons.push(<span key="ellipsis2" className="px-2 text-muted-foreground">...</span>);
      }
      buttons.push(
        <Button key={totalPages} variant={currentPage === totalPages ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(totalPages)} className="w-8 h-8">{totalPages}</Button>
      );
    }
    return buttons;
  };

  if (isLoading && logs.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const startIndex = (currentPage - 1) * pageSize;

  return (
    <div className="space-y-6">
      {/* Header & Summary Cards */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Security Logs</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Logs</p>
              <p className="text-2xl font-bold">{pagination.totalRecords}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Unique Users</p>
              <p className="text-2xl font-bold">{new Set(logs.map((l) => l.user)).size}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Activity className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Features</p>
              <p className="text-2xl font-bold">{new Set(logs.map((l) => l.feature)).size}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex flex-1 gap-2 w-full max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by reference, user, feature..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setFilterOpen(true)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filter
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                !
              </Badge>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Per page:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(v) => setPageSize(Number(v))}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Date & Time</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Feature</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Data Payload</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log, idx) => (
              <TableRow key={idx}>
                <TableCell className="text-xs">
                  <div>{log.tdate}</div>
                  <div className="text-muted-foreground font-mono">
                    {log.last_activity_time.split(" ")[1]}
                  </div>
                </TableCell>
                <TableCell className="font-medium text-xs">{log.reference_no}</TableCell>
                <TableCell className="text-sm">{log.user}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      log.action === "create"
                        ? "bg-green-500/20 text-green-700 dark:text-green-400"
                        : log.action === "delete"
                        ? "bg-red-500/20 text-red-700 dark:text-red-400"
                        : "bg-blue-500/20 text-blue-700 dark:text-blue-400"
                    }`}
                  >
                    {log.action}
                  </span>
                </TableCell>
                <TableCell className="text-xs capitalize">
                  {log.feature.replace(/-/g, " ")}
                </TableCell>
                <TableCell className="font-medium text-xs">{log.table}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5 max-w-[400px]">
                    {parseActivityData(log.data)
                      .slice(0, 5)
                      .map((item, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted/50 text-[10px]"
                        >
                          <span className="font-semibold text-muted-foreground">
                            {item.key}:
                          </span>
                          <span className="truncate max-w-[80px]" title={item.value}>
                            {item.value}
                          </span>
                        </span>
                      ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        <p className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(startIndex + pageSize, pagination.totalRecords)} of{" "}
          {pagination.totalRecords} entries
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={previousPage}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">{renderPaginationButtons()}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={nextPage}
            disabled={currentPage === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Filter Dialog */}
      <FilterDialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
        onApply={handleApplyFilters}
        showDateRange={true}
        filterFields={filterFields}
        initialDateRange={dateRange}
        initialKeyValues={keyValues}
      />
    </div>
  );
};

export default Security;
