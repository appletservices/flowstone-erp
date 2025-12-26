import { useState } from "react";
import { 
  Search, 
  Filter, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  MoreVertical,
  LinkIcon,
  History,
  User,
  ChevronRight,
  CreditCard,
  Building2,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalReceivable: number;
  totalTransactions: number;
  status: "active" | "inactive";
  createdAt: string;
  linkedAccounts: LinkedAccount[];
  transactions: Transaction[];
}

interface LinkedAccount {
  id: string;
  type: "bank" | "wallet" | "credit";
  name: string;
  accountNumber: string;
  balance: number;
}

interface Transaction {
  id: string;
  date: string;
  type: "sale" | "payment" | "return";
  description: string;
  amount: number;
  balance: number;
}

const customers: Customer[] = [
  {
    id: "1",
    name: "Ahmad Textiles",
    email: "ahmad@textiles.com",
    phone: "+92 321 1234567",
    address: "Shop #15, Cloth Market, Faisalabad",
    totalReceivable: 125000,
    totalTransactions: 45,
    status: "active",
    createdAt: "2024-01-15",
    linkedAccounts: [
      { id: "1", type: "bank", name: "HBL Account", accountNumber: "****4521", balance: 50000 },
      { id: "2", type: "wallet", name: "JazzCash", accountNumber: "****7890", balance: 15000 },
    ],
    transactions: [
      { id: "1", date: "2024-01-20", type: "sale", description: "Invoice #INV-001", amount: 25000, balance: 125000 },
      { id: "2", date: "2024-01-18", type: "payment", description: "Cash Payment", amount: -15000, balance: 100000 },
      { id: "3", date: "2024-01-15", type: "sale", description: "Invoice #INV-002", amount: 35000, balance: 115000 },
      { id: "4", date: "2024-01-10", type: "return", description: "Return #RET-001", amount: -5000, balance: 80000 },
    ],
  },
  {
    id: "2",
    name: "Karachi Garments",
    email: "info@karachigarments.pk",
    phone: "+92 333 9876543",
    address: "Block A, SITE Area, Karachi",
    totalReceivable: 250000,
    totalTransactions: 78,
    status: "active",
    createdAt: "2023-11-20",
    linkedAccounts: [
      { id: "3", type: "bank", name: "MCB Account", accountNumber: "****1234", balance: 120000 },
      { id: "4", type: "credit", name: "Credit Line", accountNumber: "****5678", balance: -50000 },
    ],
    transactions: [
      { id: "5", date: "2024-01-22", type: "sale", description: "Invoice #INV-003", amount: 75000, balance: 250000 },
      { id: "6", date: "2024-01-19", type: "payment", description: "Bank Transfer", amount: -50000, balance: 175000 },
    ],
  },
  {
    id: "3",
    name: "Lahore Fashion Hub",
    email: "contact@lahorefashion.com",
    phone: "+92 300 5551234",
    address: "Liberty Market, Lahore",
    totalReceivable: 0,
    totalTransactions: 23,
    status: "inactive",
    createdAt: "2023-08-10",
    linkedAccounts: [
      { id: "5", type: "bank", name: "UBL Account", accountNumber: "****9999", balance: 0 },
    ],
    transactions: [
      { id: "7", date: "2024-01-05", type: "payment", description: "Final Settlement", amount: -45000, balance: 0 },
    ],
  },
];

const statusConfig = {
  active: { label: "Active", className: "bg-success/10 text-success border-success/20" },
  inactive: { label: "Inactive", className: "bg-muted text-muted-foreground border-muted" },
};

const transactionTypeConfig = {
  sale: { label: "Sale", className: "text-success", icon: ArrowUpRight },
  payment: { label: "Payment", className: "text-primary", icon: ArrowDownLeft },
  return: { label: "Return", className: "text-destructive", icon: ArrowDownLeft },
};

const accountTypeConfig = {
  bank: { label: "Bank", icon: Building2 },
  wallet: { label: "Wallet", icon: CreditCard },
  credit: { label: "Credit", icon: CreditCard },
};

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalReceivable = customers.reduce((sum, c) => sum + c.totalReceivable, 0);
  const activeCustomers = customers.filter((c) => c.status === "active").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">Manage customer profiles and receivables</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Customer
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Customers</p>
                <p className="text-2xl font-bold">{activeCustomers}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                <User className="w-5 h-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Receivable</p>
                <p className="text-2xl font-bold">Rs. {totalReceivable.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month Sales</p>
                <p className="text-2xl font-bold">Rs. 485,000</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-accent-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Customer List */}
      <div className="grid gap-4">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{customer.name}</h3>
                      <Badge variant="outline" className={statusConfig[customer.status].className}>
                        {statusConfig[customer.status].label}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {customer.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {customer.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {customer.address}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Receivable</p>
                    <p className="font-semibold text-lg text-foreground">
                      Rs. {customer.totalReceivable.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Transactions</p>
                    <p className="font-semibold text-lg text-foreground">{customer.totalTransactions}</p>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => setSelectedCustomer(customer)}>
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          {customer.name}
                          <Badge variant="outline" className={statusConfig[customer.status].className}>
                            {statusConfig[customer.status].label}
                          </Badge>
                        </DialogTitle>
                        <DialogDescription>
                          Customer since {new Date(customer.createdAt).toLocaleDateString()}
                        </DialogDescription>
                      </DialogHeader>

                      <Tabs defaultValue="profile" className="mt-4">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="profile" className="gap-2">
                            <User className="w-4 h-4" />
                            Profile
                          </TabsTrigger>
                          <TabsTrigger value="accounts" className="gap-2">
                            <LinkIcon className="w-4 h-4" />
                            Linked Accounts
                          </TabsTrigger>
                          <TabsTrigger value="transactions" className="gap-2">
                            <History className="w-4 h-4" />
                            Transactions
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile" className="space-y-4 mt-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                  <Phone className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Phone</p>
                                  <p className="font-medium">{customer.phone}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                  <Mail className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Email</p>
                                  <p className="font-medium">{customer.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 md:col-span-2">
                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                  <MapPin className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Address</p>
                                  <p className="font-medium">{customer.address}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle className="text-lg">Account Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="p-4 rounded-lg bg-muted/50 text-center">
                                <p className="text-sm text-muted-foreground">Total Receivable</p>
                                <p className="text-2xl font-bold text-warning">
                                  Rs. {customer.totalReceivable.toLocaleString()}
                                </p>
                              </div>
                              <div className="p-4 rounded-lg bg-muted/50 text-center">
                                <p className="text-sm text-muted-foreground">Total Transactions</p>
                                <p className="text-2xl font-bold">{customer.totalTransactions}</p>
                              </div>
                              <div className="p-4 rounded-lg bg-muted/50 text-center">
                                <p className="text-sm text-muted-foreground">Linked Accounts</p>
                                <p className="text-2xl font-bold">{customer.linkedAccounts.length}</p>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="accounts" className="mt-4">
                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                              <CardTitle className="text-lg">Linked Accounts</CardTitle>
                              <Button size="sm" variant="outline" className="gap-2">
                                <Plus className="w-4 h-4" />
                                Add Account
                              </Button>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {customer.linkedAccounts.map((account) => {
                                  const config = accountTypeConfig[account.type];
                                  return (
                                    <div
                                      key={account.id}
                                      className="flex items-center justify-between p-4 rounded-lg border bg-card"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                          <config.icon className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                          <p className="font-medium">{account.name}</p>
                                          <p className="text-sm text-muted-foreground">
                                            {config.label} • {account.accountNumber}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-semibold">
                                          Rs. {Math.abs(account.balance).toLocaleString()}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          {account.balance >= 0 ? "Available" : "Credit Used"}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="transactions" className="mt-4">
                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                              <CardTitle className="text-lg">Transaction History</CardTitle>
                              <Button size="sm" variant="outline" className="gap-2">
                                <Plus className="w-4 h-4" />
                                New Transaction
                              </Button>
                            </CardHeader>
                            <CardContent>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Balance</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {customer.transactions.map((transaction) => {
                                    const config = transactionTypeConfig[transaction.type];
                                    const Icon = config.icon;
                                    return (
                                      <TableRow key={transaction.id}>
                                        <TableCell className="font-medium">
                                          {new Date(transaction.date).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex items-center gap-2">
                                            <Icon className={`w-4 h-4 ${config.className}`} />
                                            <span>{config.label}</span>
                                          </div>
                                        </TableCell>
                                        <TableCell>{transaction.description}</TableCell>
                                        <TableCell className={`text-right font-medium ${config.className}`}>
                                          {transaction.amount > 0 ? "+" : ""}
                                          Rs. {Math.abs(transaction.amount).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                          Rs. {transaction.balance.toLocaleString()}
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit Customer</DropdownMenuItem>
                      <DropdownMenuItem>Record Payment</DropdownMenuItem>
                      <DropdownMenuItem>Create Invoice</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
