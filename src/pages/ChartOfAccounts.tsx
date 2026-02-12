import { useState, useEffect } from "react";
import { useSetPageHeader } from "@/hooks/usePageHeader";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Wallet,
  CreditCard,
  TrendingUp,
  DollarSign,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface Account {
  id?: string;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  balance: number;
  balanceType?: "Dr" | "Cr";
  children?: Account[];
}

const accountTypeConfig = {
  asset: { label: "Asset", color: "text-primary", bg: "bg-primary/10", icon: Wallet },
  liability: { label: "Liability", color: "text-destructive", bg: "bg-destructive/10", icon: CreditCard },
  equity: { label: "Equity", color: "text-secondary", bg: "bg-secondary/10", icon: TrendingUp },
  revenue: { label: "Revenue", color: "text-success", bg: "bg-success/10", icon: DollarSign },
  expense: { label: "Expense", color: "text-warning", bg: "bg-warning/10", icon: FileText },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface AccountNodeProps {
  account: Account;
  level: number;
}

function AccountNode({ account, level }: AccountNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren = account.children && account.children.length > 0;
  const config = accountTypeConfig[account.type];
  const Icon = config.icon;

  return (
    <div className="animate-fade-in">
      <div
        className={cn(
          "flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group",
          level === 0 && "bg-muted/30"
        )}
        style={{ paddingLeft: `${level * 24 + 16}px` }}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        <div className="w-5 flex-shrink-0">
          {hasChildren && (
            <button className="p-0.5 rounded hover:bg-muted">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          )}
        </div>

        <div className={cn("p-1.5 rounded-lg", config.bg)}>
          <Icon className={cn("w-4 h-4", config.color)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">{account.code}</span>
            <span className={cn("font-medium", level === 0 && "text-lg")}>{account.name}</span>
          </div>
        </div>

        <span className={cn("chip text-xs", config.bg, config.color)}>{config.label}</span>

        <div className="text-right min-w-[120px]">
          <span className="font-semibold">{formatCurrency(account.balance)}</span>
          {account.balanceType && (
            <span
              className={cn(
                "ml-1 text-xs",
                account.balanceType === "Dr" ? "text-primary" : "text-secondary"
              )}
            >
              {account.balanceType}
            </span>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card">
            <DropdownMenuItem>View Ledger</DropdownMenuItem>
            <DropdownMenuItem>Edit Account</DropdownMenuItem>
            <DropdownMenuItem>Add Child Account</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete Account</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {hasChildren && isExpanded && (
        <div className="border-l border-border ml-8">
          {account.children!.map((child) => (
            <AccountNode key={child.id || child.code} account={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChartOfAccounts() {
  useSetPageHeader("Chart of Accounts", "Manage your complete account hierarchy");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    async function fetchAccounts() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/chart-of-accounts`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error("Failed to fetch accounts");
        const data: Account[] = await res.json();

        // Normalize API data for UI
        const normalized: Account[] = data.map((acc) => ({
          ...acc,
          type: acc.type.toLowerCase() as Account["type"],
          children: acc.children?.map((child) => ({
            ...child,
            type: child.type.toLowerCase() as Account["type"],
            children: child.children ?? [],
          })) ?? [],
        }));

        setAccounts(normalized);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAccounts();
  }, [user]);

  if (loading) return <p>Loading Chart of Accounts...</p>;

  // Map top-level accounts for summary cards
  const summaryAccounts = accounts.reduce<Record<string, Account>>((acc, item) => {
    acc[item.type] = item;
    return acc;
  }, {});

  return (
    <div className="space-y-6">

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search accounts by name or code..." className="pl-10" />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {Object.entries(accountTypeConfig).map(([type, config]) => {
          const Icon = config.icon;
          const account = summaryAccounts[type];
          return (
            <div key={type} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
              <div className={cn("p-2.5 rounded-xl", config.bg)}>
                <Icon className={cn("w-5 h-5", config.color)} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{config.label}</p>
                <p className="font-semibold">
                  {account ? formatCurrency(account.balance) : "0"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">Account Hierarchy</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Dr = Debit Balance</span>
            <span>•</span>
            <span>Cr = Credit Balance</span>
          </div>
        </div>
        <div className="p-2">
          {accounts.map((account) => (
            <AccountNode key={account.type} account={account} level={0} />
          ))}
        </div>
      </div>
    </div>
  );
}
