import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Filter,
  Download,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface InvLedgerEntry {
  id: string;
  date: string;
  description: string;
  type: "debit" | "credit";
  amount: number;
  balance: number;
  reference: string;
}

const mockLedgerEntries: InvLedgerEntry[] = [
  {
    id: "1",
    date: "2024-01-19",
    description: "Opening Balance",
    type: "credit",
    amount: 45000,
    balance: 45000,
    reference: "OB-001",
  },
  {
    id: "2",
    date: "2024-01-18",
    description: "Purchase - Cotton Fabric",
    type: "debit",
    amount: 25000,
    balance: 70000,
    reference: "PUR-2401-001",
  },
  {
    id: "3",
    date: "2024-01-20",
    description: "Payment Received",
    type: "credit",
    amount: 30000,
    balance: 40000,
    reference: "PAY-2401-015",
  },
  {
    id: "4",
    date: "2024-01-22",
    description: "Purchase - Silk Thread",
    type: "debit",
    amount: 12500,
    balance: 52500,
    reference: "PUR-2401-002",
  },
  {
    id: "5",
    date: "2024-01-25",
    description: "Payment Received",
    type: "credit",
    amount: 20000,
    balance: 32500,
    reference: "PAY-2401-018",
  },
  {
    id: "6",
    date: "2024-01-28",
    description: "Purchase - Embroidery Materials",
    type: "debit",
    amount: 18000,
    balance: 50500,
    reference: "PUR-2401-003",
  },
  {
    id: "7",
    date: "2024-02-01",
    description: "Payment Received",
    type: "credit",
    amount: 25000,
    balance: 25500,
    reference: "PAY-2402-001",
  },
  {
    id: "8",
    date: "2024-02-05",
    description: "Purchase - Raw Materials",
    type: "debit",
    amount: 35000,
    balance: 60500,
    reference: "PUR-2402-001",
  },
];

const contactInfo = {
  vendor: {
    "1": { name: "Raju Karahi Works", type: "Karahi Vendor", phone: "+91 98765 43210" },
    "2": { name: "Shyam Katae Services", type: "Katae Vendor", phone: "+91 87654 32109" },
    "3": { name: "Krishna Karahi", type: "Karahi Vendor", phone: "+91 76543 21098" },
  },
  customer: {
    "1": { name: "Textile House Mumbai", type: "Wholesale Customer", phone: "+91 98123 45678" },
    "2": { name: "Fabric World", type: "Retail Customer", phone: "+91 97234 56789" },
  },
};

export default function InvLedger() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();

  const contact = type && id 
    ? contactInfo[type as keyof typeof contactInfo]?.[id as keyof (typeof contactInfo)["vendor"]] 
    : null;

  const totalDebit = mockLedgerEntries
    .filter((e) => e.type === "debit")
    .reduce((acc, e) => acc + e.amount, 0);
  
  const totalCredit = mockLedgerEntries
    .filter((e) => e.type === "credit")
    .reduce((acc, e) => acc + e.amount, 0);
  
  const currentBalance = mockLedgerEntries[mockLedgerEntries.length - 1]?.balance || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {contact?.name || "Ledger"}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {contact && (
                <>
                  <Badge variant="secondary">{contact.type}</Badge>
                  <span className="text-sm text-muted-foreground">{contact.phone}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/10">
              <ArrowUpRight className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Debit</p>
              <p className="text-2xl font-bold text-destructive">
                ₹{totalDebit.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <ArrowDownLeft className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Credit</p>
              <p className="text-2xl font-bold text-success">
                ₹{totalCredit.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className={cn(
                "text-2xl font-bold",
                currentBalance > 0 ? "text-warning" : "text-success"
              )}>
                ₹{currentBalance.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Filter by date range..." className="pl-10" />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Ledger Table */}
      <div className="bg-card rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Reference</th>
                <th>Description</th>
                <th className="text-right">Debit</th>
                <th className="text-right">Credit</th>
                <th className="text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {mockLedgerEntries.map((entry) => (
                <tr key={entry.id} className="animate-fade-in">
                  <td className="text-sm text-muted-foreground">
                    {new Date(entry.date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    <span className="font-mono text-sm text-muted-foreground">
                      {entry.reference}
                    </span>
                  </td>
                  <td className="font-medium">{entry.description}</td>
                  <td className="text-right">
                    {entry.type === "debit" ? (
                      <span className="text-destructive font-medium">
                        ₹{entry.amount.toLocaleString("en-IN")}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="text-right">
                    {entry.type === "credit" ? (
                      <span className="text-success font-medium">
                        ₹{entry.amount.toLocaleString("en-IN")}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="text-right font-semibold">
                    ₹{entry.balance.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/50 font-semibold">
                <td colSpan={3} className="text-right">Totals</td>
                <td className="text-right text-destructive">
                  ₹{totalDebit.toLocaleString("en-IN")}
                </td>
                <td className="text-right text-success">
                  ₹{totalCredit.toLocaleString("en-IN")}
                </td>
                <td className="text-right">
                  ₹{currentBalance.toLocaleString("en-IN")}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}