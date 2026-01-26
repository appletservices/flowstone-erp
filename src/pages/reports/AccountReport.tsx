import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AccountEntry {
  id: number;
  account: string;
  type: string;
  code: string;
  credit: string;
  debit: string;
}

export default function AccountReport() {
  const navigate = useNavigate();
  const [data, setData] = useState<AccountEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Report Data
  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/reports/accounts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const result = await response.json();
      if (result.data) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Error fetching account report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const totals = data.reduce(
    (acc, entry) => ({
      debit: acc.debit + parseFloat(entry.debit || "0"),
      credit: acc.credit + parseFloat(entry.credit || "0"),
    }),
    { debit: 0, credit: 0 }
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "asset": return "bg-primary/10 text-primary";
      case "liability": return "bg-destructive/10 text-destructive";
      case "revenue": return "bg-success/10 text-success";
      case "expense": return "bg-warning/10 text-warning";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Accounts Report</h1>
          <p className="text-muted-foreground mt-1">
            Overview of all account balances and transactions
          </p>
        </div>
        <CreditCard className="h-8 w-8 text-primary" />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-success" />
              Total Debit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-success">{formatCurrency(totals.debit)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowDownLeft className="h-4 w-4 text-destructive" />
              Total Credit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-destructive">{formatCurrency(totals.credit)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {formatCurrency(Math.abs(totals.debit - totals.credit))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ledger Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[80px]">S/No</TableHead>
                <TableHead className="w-[120px]">Type</TableHead>
                <TableHead className="w-[120px]">Code</TableHead>
                <TableHead>Account</TableHead>
                <TableHead className="text-right w-[150px]">Debit</TableHead>
                <TableHead className="text-right w-[150px]">Credit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="text-muted-foreground text-sm">Loading accounts...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    No account records found.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((entry, index) => (
                  <TableRow 
                    key={entry.id} 
                    className="group hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/account/ledger/${entry.id}`)}
                  >
                    <TableCell className="font-medium text-sm">{index + 1}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn("text-xs capitalize", getTypeColor(entry.type))}>
                        {entry.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{entry.code}</TableCell>
                    <TableCell className="font-medium text-sm text-primary group-hover:underline">
                      {entry.account}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {parseFloat(entry.debit) > 0 ? (
                        <span className="text-success">{formatCurrency(parseFloat(entry.debit))}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {parseFloat(entry.credit) > 0 ? (
                        <span className="text-destructive">{formatCurrency(parseFloat(entry.credit))}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}

              {!isLoading && data.length > 0 && (
                <TableRow className="bg-muted/50 font-bold border-t-2">
                  <TableCell colSpan={4} className="text-right">Total</TableCell>
                  <TableCell className="text-right font-mono text-success">
                    {formatCurrency(totals.debit)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-destructive">
                    {formatCurrency(totals.credit)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}