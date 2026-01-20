import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Filter } from "lucide-react";
import { useSetPageHeader } from "@/hooks/usePageHeader";

interface LedgerEntry {
  id: string;
  date: string;
  design: string;
  receiveQty: number;
  designCost: number;
  materialCost: number;
  totalCost: number;
}

const mockLedgerData: LedgerEntry[] = [
  { id: "1", date: "2024-01-15", design: "Design A", receiveQty: 50, designCost: 100, materialCost: 50, totalCost: 7500 },
  { id: "2", date: "2024-01-16", design: "Design B", receiveQty: 30, designCost: 120, materialCost: 60, totalCost: 5400 },
  { id: "3", date: "2024-01-17", design: "Design C", receiveQty: 40, designCost: 90, materialCost: 45, totalCost: 5400 },
  { id: "4", date: "2024-01-18", design: "Design A", receiveQty: 25, designCost: 100, materialCost: 50, totalCost: 3750 },
  { id: "5", date: "2024-01-19", design: "Design D", receiveQty: 60, designCost: 80, materialCost: 40, totalCost: 7200 },
];

export default function KarahiDesignReceiveLedger() {
  const { id } = useParams();
  useSetPageHeader("Design Received Ledger", `Ledger for entry #${id}`);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = mockLedgerData.filter(
    (entry) => entry.design.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">Ledger Details</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search designs..."
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
                <th>Design</th>
                <th className="text-right">Receive Qty</th>
                <th className="text-right">Design Cost</th>
                <th className="text-right">Material Cost</th>
                <th className="text-right">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((entry) => (
                <tr key={entry.id} className="animate-fade-in">
                  <td>{entry.date}</td>
                  <td className="font-medium">{entry.design}</td>
                  <td className="text-right">{entry.receiveQty}</td>
                  <td className="text-right">Rs. {entry.designCost.toLocaleString()}</td>
                  <td className="text-right">Rs. {entry.materialCost.toLocaleString()}</td>
                  <td className="text-right font-medium text-success">
                    Rs. {entry.totalCost.toLocaleString()}
                  </td>
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
