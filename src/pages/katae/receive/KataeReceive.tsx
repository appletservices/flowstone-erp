import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, ChevronRight } from "lucide-react";
import { useSetPageHeader } from "@/hooks/usePageHeader";

interface KataeReceiveEntry {
  id: string;
  vendor: string;
  design: string;
  received: number;
}

const mockData: KataeReceiveEntry[] = [
  { id: "1", vendor: "Vendor A", design: "Design Pattern 1", received: 150 },
  { id: "2", vendor: "Vendor B", design: "Design Pattern 2", received: 225 },
  { id: "3", vendor: "Vendor C", design: "Design Pattern 3", received: 180 },
  { id: "4", vendor: "Vendor A", design: "Design Pattern 4", received: 310 },
  { id: "5", vendor: "Vendor B", design: "Design Pattern 5", received: 127 },
];

export default function KataeReceive() {
  useSetPageHeader("Katae Receive", "Manage katae receive entries");
  const navigate = useNavigate();
  const [data] = useState<KataeReceiveEntry[]>(mockData);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = data.filter(
    (entry) =>
      entry.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.design.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewLedger = (id: string) => {
    navigate(`/katae/receive-ledger/${id}`);
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
                placeholder="Search..."
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
                <th>Design</th>
                <th className="text-right">Received</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((entry) => (
                <tr key={entry.id} className="animate-fade-in">
                  <td className="font-medium">{entry.vendor}</td>
                  <td>{entry.design}</td>
                  <td className="text-right font-medium text-success">
                    {entry.received.toLocaleString()}
                  </td>
                  <td>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleViewLedger(entry.id)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
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
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
