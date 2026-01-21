import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, ChevronRight, Loader2 } from "lucide-react";
import { useSetPageHeader } from "@/hooks/usePageHeader";

interface KataeReceiveEntry {
  kv: number;
  vendor: string;
  vid: number;
  items: string;
  pid: number;
  received: string;
}

export default function KataeReceive() {
  useSetPageHeader("Katae Receive", "Manage katae receive entries");
  const navigate = useNavigate();
  
  const [data, setData] = useState<KataeReceiveEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/katae/receive/listing`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();
        if (result.data) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch katae receive listing:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = data.filter(
    (entry) =>
      entry.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.items.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewLedger = (vid: number, pid: number) => {
    // Navigate using the vendor ID and product ID from the API
    navigate(`/katae/receive-ledger/${vid}/${pid}`);
  };

  const handleReceiveKatae = () => {
    navigate("/katae/receive/new");
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">Katae Receive List</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search vendor or product..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button className="gap-2" onClick={handleReceiveKatae}>
              <Plus className="w-4 h-4" />
              Receive Katae
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vendor</th>
                <th>Product/Design</th>
                <th className="text-right">Total Received</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((entry, idx) => (
                  <tr key={`${entry.vid}-${entry.pid}-${idx}`} className="animate-fade-in">
                    <td className="font-medium">{entry.vendor}</td>
                    <td>{entry.items}</td>
                    <td className="text-right font-medium text-success">
                      {parseFloat(entry.received).toLocaleString()}
                    </td>
                    <td>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleViewLedger(entry.vid, entry.pid)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-muted-foreground">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredData.length} of {data.length} entries
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
              1
            </Button>
            <Button variant="outline" size="sm" disabled={filteredData.length < 10}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}