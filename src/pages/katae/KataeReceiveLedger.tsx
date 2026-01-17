import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Filter } from "lucide-react";

interface LedgerEntry {
  id: string;
  date: string;
  receivedQty: number;
  receivedQtyCost: number;
  reference: string;
}

const mockLedgerData: LedgerEntry[] = [
  { id: "1", date: "2024-01-15", receivedQty: 50, receivedQtyCost: 7500, reference: "REF-001" },
  { id: "2", date: "2024-01-16", receivedQty: 30, receivedQtyCost: 5400, reference: "REF-002" },
  { id: "3", date: "2024-01-17", receivedQty: 40, receivedQtyCost: 5400, reference: "REF-003" },
  { id: "4", date: "2024-01-18", receivedQty: 25, receivedQtyCost: 3750, reference: "REF-004" },
  { id: "5", date: "2024-01-19", receivedQty: 60, receivedQtyCost: 7200, reference: "REF-005" },
];

export default function KataeReceiveLedger() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = mockLedgerData.filter(
    (entry) => entry.reference.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalReceivedQty = filteredData.reduce((sum, entry) => sum + entry.receivedQty, 0);
  const totalReceivedCost = filteredData.reduce((sum, entry) => sum + entry.receivedQtyCost, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Katae Receive Ledger</h1>
          <p className="text-muted-foreground">Ledger for entry #{id}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">Total Received Qty</p>
          <p className="text-2xl font-bold text-foreground">{totalReceivedQty.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">Total Received Cost</p>
          <p className="text-2xl font-bold text-success">Rs. {totalReceivedCost.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">Ledger Details</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search reference..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th className="text-right">Received Qty</th>
                <th className="text-right">Received Qty Cost</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((entry) => (
                <tr key={entry.id} className="animate-fade-in">
                  <td>{entry.date}</td>
                  <td className="text-right">{entry.receivedQty.toLocaleString()}</td>
                  <td className="text-right font-medium text-success">
                    Rs. {entry.receivedQtyCost.toLocaleString()}
                  </td>
                  <td className="font-medium">{entry.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredData.length} of {mockLedgerData.length} entries
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
