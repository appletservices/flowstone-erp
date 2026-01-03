import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Search, Filter, Send } from "lucide-react";

interface KarahiItem {
  id: string;
  vendor: string;
  product: string;
  available: number;
}

const mockData: KarahiItem[] = [
  { id: "1", vendor: "Vendor A", product: "Karahi Item 1", available: 150 },
  { id: "2", vendor: "Vendor B", product: "Karahi Item 2", available: 200 },
  { id: "3", vendor: "Vendor A", product: "Karahi Item 3", available: 75 },
  { id: "4", vendor: "Vendor C", product: "Karahi Item 4", available: 320 },
  { id: "5", vendor: "Vendor B", product: "Karahi Item 5", available: 180 },
  { id: "6", vendor: "Vendor D", product: "Karahi Item 6", available: 90 },
];

const vendors = ["All", "Vendor A", "Vendor B", "Vendor C", "Vendor D"];

export default function KarahiList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = mockData.filter((item) => {
    const matchesSearch =
      item.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVendor =
      selectedVendor === "All" || item.vendor === selectedVendor;
    return matchesSearch && matchesVendor;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleNavigateToLedger = (item: KarahiItem) => {
    navigate(`/karahi/ledger/${item.id}`, { state: { item } });
  };

  const handleNavigateToIssueMaterial = () => {
    navigate("/karahi/issue-material");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Karahi List</h1>
          <p className="text-muted-foreground">
            View and manage karahi items
          </p>
        </div>
        <Button onClick={handleNavigateToIssueMaterial}>
          <Send className="mr-2 h-4 w-4" />
          Issue Karahi Material
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by vendor or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedVendor} onValueChange={setSelectedVendor}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by vendor" />
            </SelectTrigger>
            <SelectContent>
              {vendors.map((vendor) => (
                <SelectItem key={vendor} value={vendor}>
                  {vendor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Available</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.vendor}</TableCell>
                  <TableCell>{item.product}</TableCell>
                  <TableCell className="text-right">{item.available}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleNavigateToLedger(item)}
                      className="hover:bg-primary/10"
                      title="View Karahi Ledger"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No items found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
