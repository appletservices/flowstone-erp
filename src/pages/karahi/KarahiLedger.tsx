import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Filter, TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface LedgerEntry {
  id: string;
  date: string;
  description: string;
  issued: number;
  received: number;
  balance: number;
}

const mockLedgerData: LedgerEntry[] = [
  { id: "1", date: "2024-01-15", description: "Opening Balance", issued: 0, received: 500, balance: 500 },
  { id: "2", date: "2024-01-18", description: "Issued to Production", issued: 150, received: 0, balance: 350 },
  { id: "3", date: "2024-01-20", description: "New Stock Received", issued: 0, received: 200, balance: 550 },
  { id: "4", date: "2024-01-25", description: "Issued to Production", issued: 100, received: 0, balance: 450 },
  { id: "5", date: "2024-02-01", description: "Returned from Production", issued: 0, received: 25, balance: 475 },
  { id: "6", date: "2024-02-05", description: "Issued to Production", issued: 75, received: 0, balance: 400 },
  { id: "7", date: "2024-02-10", description: "New Stock Received", issued: 0, received: 150, balance: 550 },
  { id: "8", date: "2024-02-15", description: "Issued to Production", issued: 80, received: 0, balance: 470 },
  { id: "9", date: "2024-02-20", description: "Returned from Production", issued: 0, received: 30, balance: 500 },
  { id: "10", date: "2024-02-25", description: "Issued to Production", issued: 100, received: 0, balance: 400 },
];

const ITEMS_PER_PAGE = 5;

export default function KarahiLedger() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const item = location.state?.item;

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search query
  const filteredData = mockLedgerData.filter(
    (entry) =>
      entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.date.includes(searchQuery)
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const totalIssued = mockLedgerData.reduce((sum, entry) => sum + entry.issued, 0);
  const totalReceived = mockLedgerData.reduce((sum, entry) => sum + entry.received, 0);
  const currentBalance = mockLedgerData[mockLedgerData.length - 1]?.balance || 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisible = 3;

    for (let i = 1; i <= Math.min(maxVisible, totalPages); i++) {
      buttons.push(
        <Button
          key={i}
          variant="outline"
          size="sm"
          className={currentPage === i ? "bg-primary text-primary-foreground" : ""}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }

    if (totalPages > maxVisible) {
      buttons.push(
        <span key="ellipsis" className="text-muted-foreground">...</span>
      );
    }

    return buttons;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/karahi/list")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Karahi Ledger</h1>
            <p className="text-muted-foreground">
              {item ? `${item.vendor} - ${item.product}` : `Ledger #${id}`}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Received</p>
              <p className="text-2xl font-bold">{totalReceived.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/10">
              <TrendingDown className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Issued</p>
              <p className="text-2xl font-bold">{totalIssued.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="text-2xl font-bold">{currentBalance.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">Ledger Entries</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search entries..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
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
                <th>Description</th>
                <th className="text-right">Issued</th>
                <th className="text-right">Received</th>
                <th className="text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((entry) => (
                <tr key={entry.id} className="animate-fade-in">
                  <td>{entry.date}</td>
                  <td>{entry.description}</td>
                  <td className="text-right text-destructive">
                    {entry.issued > 0 ? entry.issued.toLocaleString() : "-"}
                  </td>
                  <td className="text-right text-success">
                    {entry.received > 0 ? entry.received.toLocaleString() : "-"}
                  </td>
                  <td className="text-right font-medium">
                    {entry.balance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {paginatedData.length} of {filteredData.length} entries
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </Button>
            {renderPaginationButtons()}
            <Button 
              variant="outline" 
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Footer Summary */}
      <div className="rounded-xl border border-border bg-muted/50 p-4">
        <div className="flex justify-end gap-8">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Issued</p>
            <p className="text-lg font-semibold text-destructive">{totalIssued.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Received</p>
            <p className="text-lg font-semibold text-success">{totalReceived.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Net Balance</p>
            <p className="text-lg font-bold text-primary">{currentBalance.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
