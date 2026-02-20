import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Plus, Pencil, Trash2, MoreHorizontal, Loader2 } from "lucide-react";
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
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

interface PaymentVoucherItem {
    id: number;
    narration: string;
    voucher_no: string;
    contact: string;
    account: string;
    tdate: string;
    amount: string;
    paymentTo: string;
    other_id: number | null;
    otherName: string;
}

export default function PaymentVoucher() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [data, setData] = useState<PaymentVoucherItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);

    useSetPageHeader("Payment Voucher", "Manage payment vouchers and transactions");

    // Fetch Data from API
    const fetchVouchers = async () => {
        setLoading(true);
        const token = localStorage.getItem("auth_token");

        try {
            // Adjust query params if your Laravel backend supports server-side pagination/search
            const response = await fetch(`${API_BASE_URL}/finance/payment/list`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            const result = await response.json();

            if (result.data) {
                setData(result.data);
                setTotalRecords(result.recordsTotal);
            }
        } catch (error) {
            toast.error("Failed to fetch payment vouchers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVouchers();
    }, []);

    // Local filtering (if API doesn't handle search server-side)
    const filteredData = data.filter(
        (item) =>
            item.voucher_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.narration.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredData.length / perPage);
    const paginatedData = filteredData.slice((currentPage - 1) * perPage, currentPage * perPage);

    return (
        <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border">
                <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                    <h3 className="font-semibold text-lg">All Payment Vouchers</h3>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search vouchers..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon">
                            <Filter className="w-4 h-4" />
                        </Button>
                        <Button className="gap-2" onClick={() => navigate("/finance/payment-voucher/new")}>
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Add Voucher</span>
                        </Button>
                    </div>
                </div>

                <div className="relative">
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
                                <TableHead className="w-[80px]">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-32 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                                        <p className="mt-2 text-muted-foreground">Loading vouchers...</p>
                                    </TableCell>
                                </TableRow>
                            ) : paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                                        No payment vouchers found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="whitespace-nowrap">
                                            {new Date(item.tdate).toLocaleDateString("en-GB")}
                                        </TableCell>
                                        <TableCell className="font-mono font-medium text-primary">
                                            {item.voucher_no}
                                        </TableCell>
                                        <TableCell className="font-medium">{item.contact}</TableCell>
                                        <TableCell>{item.otherName || "-"}</TableCell>
                                        <TableCell>{item.account}</TableCell>
                                        <TableCell className="text-right font-bold text-green-600 dark:text-green-400">
                                            {parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell className="max-w-[150px] truncate" title={item.narration}>
                                            {item.narration}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => navigate(`/finance/payment-voucher/edit/${item.id}`)}>
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
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination UI */}
                {!loading && (
                    <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <p className="text-sm text-muted-foreground">
                                Showing {paginatedData.length} of {filteredData.length} vouchers
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Rows:</span>
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
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                    .map((page, i, arr) => (
                                        <div key={page} className="flex items-center">
                                            {i > 0 && arr[i - 1] !== page - 1 && <span className="px-2">...</span>}
                                            <Button
                                                variant={currentPage === page ? "default" : "outline"}
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => setCurrentPage(page)}
                                            >
                                                {page}
                                            </Button>
                                        </div>
                                    ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === totalPages || totalPages === 0}
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}