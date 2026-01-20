import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Plus, 
  Pencil, 
  BookOpen, 
  Search, 
  Filter, 
  Loader2 
} from "lucide-react";
import { toast } from "sonner";
import { useSetPageHeader } from "@/hooks/usePageHeader";

interface DesignReceiveEntry {
  id: number;
  tdate: string;
  vendor: string;
  invoice: string;
  amount: string;
  kv: number;
}

export default function KarahiDesignReceive() {
  useSetPageHeader("Karahi Design Receive", "Manage karahi design receive entries");
  const navigate = useNavigate();
  const [data, setData] = useState<DesignReceiveEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch listing data from API
  const fetchListing = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/karahi/receive/listing`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      
      // Based on your response: { data: [...] }
      setData(result.data || []);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load design receive entries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListing();
  }, []);

  const filteredData = data.filter(
    (entry) =>
      entry.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.invoice?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">Design Receive List</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search vendor or invoice..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button className="gap-2" onClick={() => navigate("/karahi/design-receive/new")}>
              <Plus className="w-4 h-4" />
              Receive Design
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Vendor</th>
                <th>Invoice</th>
                <th className="text-right">Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="h-24 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="h-24 text-center text-muted-foreground">
                    No entries found.
                  </td>
                </tr>
              ) : (
                filteredData.map((entry) => (
                  <tr key={entry.id} className="animate-fade-in">
                    {/* Using 'tdate' from API */}
                    <td>{entry.tdate}</td>
                    <td className="font-medium">{entry.vendor}</td>
                    <td>{entry.invoice}</td>
                    <td className="text-right font-medium text-success">
                      {/* Trimming decimals: 2500.000000 -> 2,500 */}
                      Rs. {parseFloat(entry.amount).toLocaleString()}
                    </td>
                    <td>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card">
                          <DropdownMenuItem onClick={() => navigate(`/karahi/design-receive/edit/${entry.id}`)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/karahi/design-receive-ledger/${entry.id}`)}>
                            <BookOpen className="w-4 h-4 mr-2" />
                            Design Received Ledger
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredData.length} entries
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}