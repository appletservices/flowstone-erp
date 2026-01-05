import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Pencil, BookOpen, Search, Filter } from "lucide-react";

interface DesignReceiveEntry {
  id: string;
  date: string;
  vendor: string;
  invoice: string;
  amount: number;
}

const mockData: DesignReceiveEntry[] = [
  { id: "1", date: "2024-01-15", vendor: "Vendor A", invoice: "INV-001", amount: 15000 },
  { id: "2", date: "2024-01-18", vendor: "Vendor B", invoice: "INV-002", amount: 22500 },
  { id: "3", date: "2024-01-20", vendor: "Vendor C", invoice: "INV-003", amount: 18000 },
  { id: "4", date: "2024-01-22", vendor: "Vendor A", invoice: "INV-004", amount: 31000 },
  { id: "5", date: "2024-01-25", vendor: "Vendor B", invoice: "INV-005", amount: 12750 },
];

export default function KarahiDesignReceive() {
  const navigate = useNavigate();
  const [data] = useState<DesignReceiveEntry[]>(mockData);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = data.filter(
    (entry) =>
      entry.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.invoice.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (id: string) => {
    navigate(`/karahi/design-receive/edit/${id}`);
  };

  const handleViewLedger = (id: string) => {
    navigate(`/karahi/design-receive-ledger/${id}`);
  };

  const handleReceiveDesign = () => {
    navigate("/karahi/design-receive/new");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Karahi Design Receive</h1>
          <p className="text-muted-foreground">Manage karahi design receive entries</p>
        </div>
        <Button onClick={handleReceiveDesign}>
          <Plus className="w-4 h-4 mr-2" />
          Receive Design
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">Design Receive List</h3>
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
              {filteredData.map((entry) => (
                <tr key={entry.id} className="animate-fade-in">
                  <td>{entry.date}</td>
                  <td className="font-medium">{entry.vendor}</td>
                  <td>{entry.invoice}</td>
                  <td className="text-right font-medium text-success">
                    Rs. {entry.amount.toLocaleString()}
                  </td>
                  <td>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card">
                        <DropdownMenuItem onClick={() => handleEdit(entry.id)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewLedger(entry.id)}>
                          <BookOpen className="w-4 h-4 mr-2" />
                          Design Received Ledger
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
