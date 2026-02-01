import { useState, useEffect } from "react";
import { useSetPageHeader } from "@/hooks/usePageHeader";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Download,
  TrendingUp,
  Plus
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

interface SaleRecord {
  id: number;
  date: string;
  status: string;
  t_charges: string;
  saleType: string;
  total_amount: string;
  customer: string;
  items: number;
  reference_no: string;
}

interface ApiResponse {
  data: SaleRecord[];
  recordsTotal: number;
  recordsFiltered: number;
}

export default function SaleReturn() {
  const navigate = useNavigate();
  useSetPageHeader("Sales & Invoices", "Manage sales invoices and revenue tracking");
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("auth_token");

  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/sale/return/list`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const result: ApiResponse = await response.json();
          setSales(result.data || []);
          setTotalRecords(result.recordsTotal || 0);
        } else {
          console.error("Failed to fetch sales list");
          toast.error("Failed to load sales data.");
        }
      } catch (error) {
        console.error("Error fetching sales:", error);
        toast.error("Error loading sales data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, [API_BASE_URL, token]);


  return (
    <div className="space-y-6">

      {/* Stats - Simplified for now as API doesn't provide breakdown yet */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Sales Count</p>
              <p className="text-2xl font-bold">
                {totalRecords}
              </p>
            </div>
          </div>
        </div>
        {/* Placeholders for other stats to maintain layout if desired, or remove. 
            Keeping layout but static/zero for now to avoid confusion. */}
      </div>

      {/* Invoices Table */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">All Invoices</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search invoices..." className="pl-10" />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button className="gap-2" onClick={() => navigate("/sales/create-return")}>
              <Plus className="w-4 h-4" />
              Create sale return
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Invoice #</th>
                <th>Sell-Type</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Items</th>
                <th>T-Charges</th>
                <th>Total Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center p-4">Loading sales data...</td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center p-4">No records found.</td>
                </tr>
              ) : (
                sales.map((invoice) => (
                  <tr key={invoice.id} className="animate-fade-in">
                    <td className="text-muted-foreground">{invoice.date}</td>
                    <td>
                      <span className="font-mono text-sm font-medium text-primary">
                        {invoice.reference_no}
                      </span>
                    </td>

                    <td>
                      <span className="uppercase text-xs font-bold px-2 py-1 rounded bg-secondary text-secondary-foreground">
                        {invoice.saleType}
                      </span>
                    </td>
                    <td className="font-medium">{invoice.customer}</td>
                    <td>
                      <span className="capitalize text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                        {invoice.status}
                      </span>
                    </td>
                    <td>{invoice.items} items</td>
                    <td className="font-semibold">{invoice.t_charges}</td>
                    <td className="font-semibold">{invoice.total_amount}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card">
                            <DropdownMenuItem>View Invoice</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/sales/return/edit/${invoice.id}`)}>Edit Invoice</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(`${import.meta.env.VITE_API_URL_PRINT}/print/return/sale/${invoice.id}`, "_blank")}>Print Invoice</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {sales.length} of {totalRecords} invoices
          </p>
          {/* Pagination controls can be added here later */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
