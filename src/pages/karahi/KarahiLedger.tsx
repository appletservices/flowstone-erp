import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

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
];

export default function KarahiLedger() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const item = location.state?.item;

  const totalIssued = mockLedgerData.reduce((sum, entry) => sum + entry.issued, 0);
  const totalReceived = mockLedgerData.reduce((sum, entry) => sum + entry.received, 0);
  const currentBalance = mockLedgerData[mockLedgerData.length - 1]?.balance || 0;

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
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Received</p>
          <p className="text-2xl font-bold text-green-600">{totalReceived.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Issued</p>
          <p className="text-2xl font-bold text-red-600">{totalIssued.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Current Balance</p>
          <p className="text-2xl font-bold text-primary">{currentBalance.toLocaleString()}</p>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Issued</TableHead>
              <TableHead className="text-right">Received</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockLedgerData.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.date}</TableCell>
                <TableCell>{entry.description}</TableCell>
                <TableCell className="text-right text-red-600">
                  {entry.issued > 0 ? entry.issued.toLocaleString() : "-"}
                </TableCell>
                <TableCell className="text-right text-green-600">
                  {entry.received > 0 ? entry.received.toLocaleString() : "-"}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {entry.balance.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer Summary */}
      <div className="rounded-lg border border-border bg-muted/50 p-4">
        <div className="flex justify-end gap-8">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Issued</p>
            <p className="text-lg font-semibold text-red-600">{totalIssued.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Received</p>
            <p className="text-lg font-semibold text-green-600">{totalReceived.toLocaleString()}</p>
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
