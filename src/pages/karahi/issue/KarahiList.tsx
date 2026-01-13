import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Search, Filter, Send, Package, Users, Boxes, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Ensure the URL is constructed correctly
const API_BASE_URL = import.meta.env.VITE_API_URL;

interface KarahiItem {
  kv: number;
  vendor: string;
  vendor_id: number;
  product_id: number;
  product: string;
  available: string;
}

export default function KarahiList() {
  const navigate = useNavigate();
  const [items, setItems] = useState<KarahiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchListing = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      
      // Use standard fetch without "new URL" if it's causing issues
      const response = await fetch(`${API_BASE_URL}/karahi/issue/listing`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
      });

      const result = await response.json();
      
      if (response.ok) {
        // ROBUST CHECK: Handle both { data: [...] } and direct [...] arrays
        const dataArray = Array.isArray(result) ? result : result.data || [];
        setItems(dataArray);
      } else {
        toast.error(result.message || "Failed to load listing");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Connection error. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListing();
  }, []);

  // Filter Logic - Safely check for null/undefined strings
  const filteredData = items.filter((item) => {
    const vendorName = item.vendor?.toLowerCase() || "";
    const productName = item.product?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    
    const matchesSearch = vendorName.includes(search) || productName.includes(search);
    const matchesVendor = selectedVendor === "All" || item.vendor === selectedVendor;
    
    return matchesSearch && matchesVendor;
  });

  // Summary Logic
  const totalAvailable = items.reduce((sum, item) => sum + parseFloat(item.available || "0"), 0);
  const uniqueVendorsList = Array.from(new Set(items.map((item) => item.vendor).filter(Boolean)));

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Karahi Inventory</h1>
          <p className="text-muted-foreground text-sm">Real-time vendor stock levels</p>
        </div>
        <Button onClick={() => navigate("/karahi/issue-material")} className="gap-2">
          <Send className="w-4 h-4" /> Issue Material
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard icon={<Package />} label="Total Items" value={items.length} />
        <StatsCard icon={<Users />} label="Vendors" value={uniqueVendorsList.length} color="text-emerald-500" />
        <StatsCard icon={<Boxes />} label="Total Available" value={totalAvailable.toLocaleString()} color="text-orange-500" />
      </div>

      {/* Table & Filters */}
      <div className="bg-card rounded-xl border">
        <div className="p-4 border-b flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search vendor or product..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <Select value={selectedVendor} onValueChange={(v) => { setSelectedVendor(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="All Vendors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Vendors</SelectItem>
              {uniqueVendorsList.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="p-4 text-left font-semibold">Vendor</th>
                <th className="p-4 text-left font-semibold">Product</th>
                <th className="p-4 text-right font-semibold">Available</th>
                <th className="p-4 text-center font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <tr key={`${item.vendor_id}-${item.product_id}`} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium">{item.vendor}</td>
                    <td className="p-4">{item.product}</td>
                    <td className="p-4 text-right font-mono font-bold text-emerald-600">
                      {parseFloat(item.available).toFixed(2)}
                    </td>
                    <td className="p-4 text-center">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/karahi/issued-ledger/${item.vendor_id}/${item.product_id}`)}>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-muted-foreground">No data found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Page {currentPage} of {totalPages}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)}>Prev</Button>
              <Button size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-component for Stats
function StatsCard({ icon, label, value, color = "text-foreground" }: any) {
  return (
    <div className="bg-card p-5 rounded-xl border flex items-center gap-4">
      <div className="p-3 bg-muted rounded-lg">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground uppercase font-semibold">{label}</p>
        <p className={cn("text-2xl font-bold", color)}>{value}</p>
      </div>
    </div>
  );
}