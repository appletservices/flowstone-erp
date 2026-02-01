import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { usePageHeader } from "@/hooks/usePageHeader";
import { useBackendSearch } from "@/hooks/useBackendSearch";
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
import { Skeleton } from "@/components/ui/skeleton";

interface CollectiveRecord {
  id: number;
  date: string;
  reference_no: string;
  karigar: string;
  product: string;
  issued: number;
  lcharges: number;
  final_cost: number;
}

export default function ProductionCollective() {
  const navigate = useNavigate();
  const { setHeaderInfo } = usePageHeader();

  useEffect(() => {
    setHeaderInfo({ title: "Production Collective", subtitle: "View and manage production collective records" });
  }, [setHeaderInfo]);

  const {
    data,
    isLoading,
    searchQuery,
    setSearchQuery,
    pagination,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    nextPage,
    previousPage,
  } = useBackendSearch<CollectiveRecord>({
    endpoint: "/production/collective",
    pageSize: 10,
  });

  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
        </div>
        <Button onClick={() => navigate("/production/collective/new")}>
          <Plus className="w-4 h-4 mr-2" />
          Create
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Reference No</TableHead>
              <TableHead>Karigar</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Issued</TableHead>
              <TableHead className="text-right">L.Charges</TableHead>
              <TableHead className="text-right">Final Cost</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              data.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.reference_no}</TableCell>
                  <TableCell>{record.karigar}</TableCell>
                  <TableCell>{record.product}</TableCell>
                  <TableCell className="text-right">{record.issued}</TableCell>
                  <TableCell className="text-right">{record.lcharges}</TableCell>
                  <TableCell className="text-right">{record.final_cost}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(Number(v))}>
            <SelectTrigger className="w-[70px]">
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {pagination.totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={previousPage} disabled={currentPage <= 1}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={nextPage} disabled={currentPage >= pagination.totalPages}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
