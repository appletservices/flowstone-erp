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
import { Badge } from "@/components/ui/badge";
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

interface VpVoucherItem {
    id: string;
    date: string;
    customer: string;
    vpNumber: string;
    vpStatus: "Pending" | "Approved" | "Rejected" | "Completed";
    tCharges: number;
    total: number;
}

const mockData: VpVoucherItem[] = [
    { id: "1", date: "2024-01-15", customer: "Customer A", vpNumber: "VP-2401-001", vpStatus: "Approved", tCharges: 500, total: 25500 },
    { id: "2", date: "2024-01-18", customer: "Customer B", vpNumber: "VP-2401-002", vpStatus: "Pending", tCharges: 750, total: 45750 },
    { id: "3", date: "2024-01-20", customer: "Customer C", vpNumber: "VP-2401-003", vpStatus: "Completed", tCharges: 300, total: 10300 },
    { id: "4", date: "2024-01-22", customer: "Customer D", vpNumber: "VP-2401-004", vpStatus: "Rejected", tCharges: 0, total: 0 },
    { id: "5", date: "2024-01-25", customer: "Customer E", vpNumber: "VP-2401-005", vpStatus: "Approved", tCharges: 1000, total: 66000 },
];

export default function VpVoucher() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [data] = useState<VpVoucherItem[]>(mockData);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    useSetPageHeader("VP Voucher", "Manage VP vouchers and customer transactions");

    const filteredData = data.filter(
        (item) =>
            item.vpNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.customer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredData.length / perPage);
    const paginatedData = filteredData.slice((currentPage - 1) * perPage, currentPage * perPage);

    const getStatusVariant = (status: VpVoucherItem["vpStatus"]) => {
        switch (status) {
            case "Approved":
                return "default";
            case "Pending":
                return "secondary";
            case "Completed":
                return "outline";
            case "Rejected":
                return "destructive";
            default:
                return "outline";
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border">
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-semibold">All VP Vouchers</h3>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search VP vouchers..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="gap-2">
                            <Filter className="w-4 h-4" />
                            Filter
                        </Button>
                        <Button className="gap-2" onClick={() => navigate("/finance/vp-voucher/new")}>
                            <Plus className="w-4 h-4" />
                            Add VP Voucher
                        </Button>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>VP Number</TableHead>
                            <TableHead>VP Status</TableHead>
                            <TableHead className="text-right">T-Charges</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{new Date(item.date).toLocaleDateString("en-IN")}</TableCell>
                                <TableCell className="font-medium">{item.customer}</TableCell>
                                <TableCell className="font-mono">{item.vpNumber}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(item.vpStatus)}>{item.vpStatus}</Badge>
                                </TableCell>
                                <TableCell className="text-right">{item.tCharges.toLocaleString("en-IN")}</TableCell>
                                <TableCell className="text-right font-semibold">{item.total.toLocaleString("en-IN")}</TableCell>
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
