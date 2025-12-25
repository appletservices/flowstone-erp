import { useState } from "react";
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

interface Account {
  id: string;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  balance: number;
  balanceType: "Dr" | "Cr";
  children?: Account[];
}

const accountTypeConfig = {
  asset: { label: "Asset", color: "text-primary", bg: "bg-primary/10", icon: Wallet },
  liability: { label: "Liability", color: "text-destructive", bg: "bg-destructive/10", icon: CreditCard },
  equity: { label: "Equity", color: "text-secondary", bg: "bg-secondary/10", icon: TrendingUp },
  revenue: { label: "Revenue", color: "text-success", bg: "bg-success/10", icon: DollarSign },
  expense: { label: "Expense", color: "text-warning", bg: "bg-warning/10", icon: FileText },
};

const accounts: Account[] = [
  {
    id: "1",
    code: "1000",
    name: "Assets",
    type: "asset",
    balance: 2485000,
    balanceType: "Dr",
    children: [
      {
        id: "1.1",
        code: "1100",
        name: "Current Assets",
        type: "asset",
        balance: 1842000,
        balanceType: "Dr",
        children: [
          { id: "1.1.1", code: "1110", name: "Cash in Hand", type: "asset", balance: 125000, balanceType: "Dr" },
          { id: "1.1.2", code: "1120", name: "Bank Accounts", type: "asset", balance: 875000, balanceType: "Dr" },
          { id: "1.1.3", code: "1130", name: "Accounts Receivable", type: "asset", balance: 425000, balanceType: "Dr" },
          { id: "1.1.4", code: "1140", name: "Inventory", type: "asset", balance: 417000, balanceType: "Dr" },
        ],
      },
      {
        id: "1.2",
        code: "1200",
        name: "Fixed Assets",
        type: "asset",
        balance: 643000,
        balanceType: "Dr",
        children: [
          { id: "1.2.1", code: "1210", name: "Machinery & Equipment", type: "asset", balance: 450000, balanceType: "Dr" },
          { id: "1.2.2", code: "1220", name: "Furniture & Fixtures", type: "asset", balance: 123000, balanceType: "Dr" },
          { id: "1.2.3", code: "1230", name: "Vehicles", type: "asset", balance: 70000, balanceType: "Dr" },
        ],
      },
    ],
  },
  {
    id: "2",
    code: "2000",
    name: "Liabilities",
    type: "liability",
    balance: 425000,
    balanceType: "Cr",
    children: [
      {
        id: "2.1",
        code: "2100",
        name: "Current Liabilities",
        type: "liability",
        balance: 325000,
        balanceType: "Cr",
        children: [
          { id: "2.1.1", code: "2110", name: "Accounts Payable", type: "liability", balance: 225000, balanceType: "Cr" },
          { id: "2.1.2", code: "2120", name: "Accrued Expenses", type: "liability", balance: 100000, balanceType: "Cr" },
        ],
      },
      {
        id: "2.2",
        code: "2200",
        name: "Long-term Liabilities",
        type: "liability",
        balance: 100000,
        balanceType: "Cr",
        children: [
          { id: "2.2.1", code: "2210", name: "Bank Loan", type: "liability", balance: 100000, balanceType: "Cr" },
        ],
      },
    ],
  },
  {
    id: "3",
    code: "3000",
    name: "Equity",
    type: "equity",
    balance: 1560000,
    balanceType: "Cr",
    children: [
      { id: "3.1", code: "3100", name: "Owner's Capital", type: "equity", balance: 1200000, balanceType: "Cr" },
      { id: "3.2", code: "3200", name: "Retained Earnings", type: "equity", balance: 360000, balanceType: "Cr" },
    ],
  },
  {
    id: "4",
    code: "4000",
    name: "Revenue",
    type: "revenue",
    balance: 3250000,
    balanceType: "Cr",
    children: [
      { id: "4.1", code: "4100", name: "Sales Revenue", type: "revenue", balance: 3000000, balanceType: "Cr" },
      { id: "4.2", code: "4200", name: "Service Revenue", type: "revenue", balance: 250000, balanceType: "Cr" },
    ],
  },
  {
    id: "5",
    code: "5000",
    name: "Expenses",
    type: "expense",
    balance: 1750000,
    balanceType: "Dr",
    children: [
      { id: "5.1", code: "5100", name: "Cost of Goods Sold", type: "expense", balance: 1200000, balanceType: "Dr" },
      { id: "5.2", code: "5200", name: "Operating Expenses", type: "expense", balance: 400000, balanceType: "Dr" },
      { id: "5.3", code: "5300", name: "Administrative Expenses", type: "expense", balance: 150000, balanceType: "Dr" },
    ],
  },
];

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
        {/* Expand/Collapse */}
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

        {/* Icon */}
        <div className={cn("p-1.5 rounded-lg", config.bg)}>
          <Icon className={cn("w-4 h-4", config.color)} />
        </div>

        {/* Code & Name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">{account.code}</span>
            <span className={cn("font-medium", level === 0 && "text-lg")}>{account.name}</span>
          </div>
        </div>

        {/* Type Badge */}
        <span className={cn("chip text-xs", config.bg, config.color)}>
          {config.label}
        </span>

        {/* Balance */}
        <div className="text-right min-w-[120px]">
          <span className="font-semibold">{formatCurrency(account.balance)}</span>
          <span className={cn(
            "ml-1 text-xs",
            account.balanceType === "Dr" ? "text-primary" : "text-secondary"
          )}>
            {account.balanceType}
          </span>
        </div>

        {/* Actions */}
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

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="border-l border-border ml-8">
          {account.children!.map((child) => (
            <AccountNode key={child.id} account={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChartOfAccounts() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Chart of Accounts</h1>
          <p className="text-muted-foreground">
            Manage your complete account hierarchy with balances
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Account
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search accounts by name or code..."
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Account Type Summary */}
      <div className="grid grid-cols-5 gap-4">
        {Object.entries(accountTypeConfig).map(([type, config]) => {
          const Icon = config.icon;
          const account = accounts.find((a) => a.type === type);
          return (
            <div
              key={type}
              className="bg-card rounded-xl border border-border p-4 flex items-center gap-3"
            >
              <div className={cn("p-2.5 rounded-xl", config.bg)}>
                <Icon className={cn("w-5 h-5", config.color)} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{config.label}</p>
                <p className="font-semibold">
                  {account ? formatCurrency(account.balance) : "₹0"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Account Tree */}
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
            <AccountNode key={account.id} account={account} level={0} />
          ))}
        </div>
      </div>
    </div>
  );
}
