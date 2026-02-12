import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  type: "in" | "out";
  description: string;
  account: string;
  amount: string;
  date: string;
}

const transactions: Transaction[] = [
  {
    id: "1",
    type: "in",
    description: "Purchase Payment Received",
    account: "ABC Textiles",
    amount: "1,25,000",
    date: "Today, 2:30 PM",
  },
  {
    id: "2",
    type: "out",
    description: "Raw Material Purchase",
    account: "XYZ Suppliers",
    amount: "45,000",
    date: "Today, 11:15 AM",
  },
  {
    id: "3",
    type: "in",
    description: "Sales Invoice #1089",
    account: "Fashion Hub Ltd",
    amount: "2,50,000",
    date: "Yesterday",
  },
  {
    id: "4",
    type: "out",
    description: "Vendor Payment",
    account: "Karahi Vendor - Raju",
    amount: "18,500",
    date: "Yesterday",
  },
  {
    id: "5",
    type: "in",
    description: "Finished Goods Sale",
    account: "Elite Garments",
    amount: "3,75,000",
    date: "2 days ago",
  },
];

export function RecentTransactions() {
  return (
    <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title">Recent Transactions</h3>
        <button className="text-sm text-primary hover:underline">View All</button>
      </div>

      <div className="space-y-3">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div
              className={cn(
                "p-2 rounded-full",
                tx.type === "in" ? "bg-success/10" : "bg-destructive/10"
              )}
            >
              {tx.type === "in" ? (
                <ArrowDownLeft className="w-4 h-4 text-success" />
              ) : (
                <ArrowUpRight className="w-4 h-4 text-destructive" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{tx.description}</p>
              <p className="text-xs text-muted-foreground">{tx.account}</p>
            </div>
            <div className="text-right">
              <p
                className={cn(
                  "font-semibold text-sm",
                  tx.type === "in" ? "text-success" : "text-foreground"
                )}
              >
                {tx.type === "in" ? "+" : "-"}{tx.amount}
              </p>
              <p className="text-xs text-muted-foreground">{tx.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
