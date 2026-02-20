import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Plus, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSetPageHeader } from "@/hooks/usePageHeader";

interface JournalVoucherItem {
    id: string;
    date: string;
    voucherNo: string;
    account: string;
    debit: number;
    credit: number;
    narration: string;
}

const mockData: JournalVoucherItem[] = [
    { id: "1", date: "2024-01-15", voucherNo: "JV-2401-001", account: "Sales Account", debit: 0, credit: 25000, narration: "Sales entry" },
    { id: "2", date: "2024-01-15", voucherNo: "JV-2401-001", account: "Cash Account", debit: 25000, credit: 0, narration: "Sales entry" },
    { id: "3", date: "2024-01-18", voucherNo: "JV-2401-002", account: "Purchase Account", debit: 15000, credit: 0, narration: "Purchase entry" },
    { id: "4", date: "2024-01-18", voucherNo: "JV-2401-002", account: "Vendor Account", debit: 0, credit: 15000, narration: "Purchase entry" },
    { id: "5", date: "2024-01-20", voucherNo: "JV-2401-003", account: "Expense Account", debit: 5000, credit: 0, narration: "Office expenses" },
    { id: "6", date: "2024-01-20", voucherNo: "JV-2401-003", account: "Bank Account", debit: 0, credit: 5000, narration: "Office expenses" },
];

export default function JournalVoucher() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [data] = useState<JournalVoucherItem[]>(mockData);

    useSetPageHeader("Journal Voucher", "Manage journal entries and accounting vouchers");

    const filteredData = data.filter(
        (item) =>
            item.voucherNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.account.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.narration.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border">
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-semibold">All Journal Vouchers</h3>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search journal vouchers..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="gap-2">
                            <Filter className="w-4 h-4" />
                            Filter
                        </Button>
                        <Button className="gap-2" onClick={() => navigate("/finance/journal-voucher/new")}>
                            <Plus className="w-4 h-4" />
                            Add Journal Entry
                        </Button>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Voucher No</TableHead>
                            <TableHead>Account</TableHead>
                            <TableHead className="text-right">Debit</TableHead>
                            <TableHead className="text-right">Credit</TableHead>
                            <TableHead>Narration</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{new Date(item.date).toLocaleDateString("en-IN")}</TableCell>
                                <TableCell className="font-mono">{item.voucherNo}</TableCell>
                                <TableCell className="font-medium">{item.account}</TableCell>
                                <TableCell className="text-right">
                                    {item.debit > 0 ? (
                                        <span className="text-destructive font-semibold">₹{item.debit.toLocaleString("en-IN")}</span>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    {item.credit > 0 ? (
                                        <span className="text-success font-semibold">₹{item.credit.toLocaleString("en-IN")}</span>
                                    ) : (
                                        <span className="text-muted-foreground">-</span>
                                    )}
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate">{item.narration}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-card">
                                            <DropdownMenuItem>
                                                <Pencil className="w-4 h-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

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
