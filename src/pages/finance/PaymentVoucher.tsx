import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Plus, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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

interface PaymentVoucherItem {
    id: string;
    date: string;
    voucherNo: string;
    contact: string;
    other: string;
    account: string;
    amount: number;
    narration: string;
}

const mockData: PaymentVoucherItem[] = [
    { id: "1", date: "2024-01-15", voucherNo: "PV-2401-001", contact: "Vendor A", other: "-", account: "Cash", amount: 15000, narration: "Payment for raw materials" },
    { id: "2", date: "2024-01-18", voucherNo: "PV-2401-002", contact: "Vendor B", other: "-", account: "Bank", amount: 25000, narration: "Supplier payment" },
    { id: "3", date: "2024-01-20", voucherNo: "PV-2401-003", contact: "Vendor C", other: "Transport", account: "Cash", amount: 5000, narration: "Transport charges" },
    { id: "4", date: "2024-01-22", voucherNo: "PV-2401-004", contact: "Vendor D", other: "-", account: "Bank", amount: 45000, narration: "Monthly payment" },
    { id: "5", date: "2024-01-25", voucherNo: "PV-2401-005", contact: "Vendor E", other: "Utilities", account: "Cash", amount: 8000, narration: "Electricity bill" },
];

export default function PaymentVoucher() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [data] = useState<PaymentVoucherItem[]>(mockData);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    useSetPageHeader("Payment Voucher", "Manage payment vouchers and transactions");

    const filteredData = data.filter(
        (item) =>
            item.voucherNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.narration.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredData.length / perPage);
    const paginatedData = filteredData.slice((currentPage - 1) * perPage, currentPage * perPage);


    return (
        <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border">
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-semibold">All Payment Vouchers</h3>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search vouchers..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="gap-2">
                            <Filter className="w-4 h-4" />
                            Filter
                        </Button>
                        <Button className="gap-2" onClick={() => navigate("/finance/payment-voucher/new")}>
                            <Plus className="w-4 h-4" />
                            Add Voucher
                        </Button>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Voucher No</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Other</TableHead>
                            <TableHead>Account</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Narration</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{new Date(item.date).toLocaleDateString("en-IN")}</TableCell>
                                <TableCell className="font-mono">{item.voucherNo}</TableCell>
                                <TableCell className="font-medium">{item.contact}</TableCell>
                                <TableCell>{item.other}</TableCell>
                                <TableCell>{item.account}</TableCell>
                                <TableCell className="text-right font-semibold">{item.amount.toLocaleString("en-IN")}</TableCell>
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
                    <div className="flex items-center gap-4">
                        <p className="text-sm text-muted-foreground">
                            Showing {paginatedData.length} of {filteredData.length} vouchers
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Per page:</span>
                            <Select
                                value={perPage.toString()}
                                onValueChange={(value) => {
                                    setPerPage(Number(value));
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="w-[70px] h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        >
                            Previous
                        </Button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant="outline"
                                size="sm"
                                className={currentPage === page ? "bg-primary text-primary-foreground" : ""}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </Button>
                        ))}
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
