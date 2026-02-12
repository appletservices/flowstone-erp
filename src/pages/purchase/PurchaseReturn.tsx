import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSetPageHeader } from "@/hooks/usePageHeader";
import {
  RotateCcw,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  FileText,
  CheckCircle,
  Clock,
  Eye,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Updated Interface to match your API response
interface PurchaseReturnData {
  id: number;
  date: string;
  type: string;
  t_charges: string;
  grand_total: string;
  vendor: string;
  vendor_type: string;
  reference_no: string;
  items: number;
}

interface ApiResponse {
  data: PurchaseReturnData[];
  recordsTotal: number;
  recordsFiltered: number;
}

export default function PurchaseReturn() {
  useSetPageHeader("Purchase Returns", "Manage purchase returns and refunds");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PurchaseReturnData[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 12, // Placeholder values as per your requirement
    approved: 8,
    completed: 45,
  });

  const fetchPurchaseReturns = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/purchase/return/list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch");

      const result: ApiResponse = await response.json();
      setData(result.data);
      setStats((prev) => ({
        ...prev,
        total: result.recordsTotal,
      }));
    } catch (error) {
      toast.error("Error loading purchase returns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseReturns();
  }, []);

  return (
    <div className="space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-muted">
              <RotateCcw className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Returns</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold">{stats.approved}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Returns Table */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">All Purchase Returns</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search returns..." className="pl-10" />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button className="gap-2" onClick={() => navigate("/purchase-return/new")}>
              <Plus className="w-4 h-4" />
              Create  Purchase return
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Return Number</th>
                  <th>Vendor</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>T-Charges</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.map((pr) => (
                  <tr key={pr.id} className="animate-fade-in">
                    <td>
                      <span className="font-mono text-sm font-medium text-primary">
                        {pr.reference_no}
                      </span>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium">{pr.vendor}</p>
                        <span
                          className={cn(
                            "chip text-[10px] px-2 py-0.5",
                            pr.vendor_type.toLowerCase().includes("karahi")
                              ? "chip-primary"
                              : "chip-secondary"
                          )}
                        >
                          {pr.vendor_type}
                        </span>
                      </div>
                    </td>
                    <td>{pr.items} items</td>
                    <td className="font-semibold">
                      {Number(pr.grand_total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td>{Number(pr.t_charges).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="text-muted-foreground">{pr.date}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => navigate(`/purchase-return/${pr.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card">
                            <DropdownMenuItem onClick={() => navigate(`/purchase-return/${pr.id}`)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>Print Return</DropdownMenuItem>
                            <DropdownMenuItem className="text-primary">
                              Restore
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {data.length} of {stats.total} returns
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}