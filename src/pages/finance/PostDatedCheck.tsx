import { useState } from "react";
import { Search, Filter, Plus, Pencil, Trash2, MoreHorizontal } from "lucide-react";
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

interface PostDatedCheckItem {
    id: string;
    issueDate: string;
    clearDate: string;
    contact: string;
    bank: string;
    amount: number;
    type: "Received" | "Issued";
    status: "Pending" | "Cleared" | "Bounced" | "Cancelled";
}

const mockData: PostDatedCheckItem[] = [
    { id: "1", issueDate: "2024-01-15", clearDate: "2024-02-15", contact: "Customer A", bank: "HDFC Bank", amount: 50000, type: "Received", status: "Pending" },
    { id: "2", issueDate: "2024-01-18", clearDate: "2024-02-18", contact: "Vendor B", bank: "ICICI Bank", amount: 35000, type: "Issued", status: "Cleared" },
    { id: "3", issueDate: "2024-01-20", clearDate: "2024-02-20", contact: "Customer C", bank: "SBI", amount: 75000, type: "Received", status: "Bounced" },
    { id: "4", issueDate: "2024-01-22", clearDate: "2024-02-22", contact: "Vendor D", bank: "Axis Bank", amount: 25000, type: "Issued", status: "Pending" },
    { id: "5", issueDate: "2024-01-25", clearDate: "2024-02-25", contact: "Customer E", bank: "Kotak Bank", amount: 100000, type: "Received", status: "Cleared" },
];

export default function PostDatedCheck() {
    const [searchQuery, setSearchQuery] = useState("");
    const [data] = useState<PostDatedCheckItem[]>(mockData);

    useSetPageHeader("Post-Dated Check", "Manage post-dated checks and clearances");

    const filteredData = data.filter(
        (item) =>
            item.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.bank.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusVariant = (status: PostDatedCheckItem["status"]) => {
        switch (status) {
            case "Cleared":
                return "default";
            case "Pending":
                return "secondary";
            case "Bounced":
                return "destructive";
            case "Cancelled":
                return "outline";
            default:
                return "outline";
        }
    };

    const getTypeVariant = (type: PostDatedCheckItem["type"]) => {
        return type === "Received" ? "default" : "secondary";
    };

    return (
        <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border">
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-semibold">All Post-Dated Checks</h3>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search checks..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="gap-2">
                            <Filter className="w-4 h-4" />
                            Filter
                        </Button>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            Add Check
                        </Button>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Issue Date</TableHead>
                            <TableHead>Clear Date</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Bank</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{new Date(item.issueDate).toLocaleDateString("en-IN")}</TableCell>
                                <TableCell>{new Date(item.clearDate).toLocaleDateString("en-IN")}</TableCell>
                                <TableCell className="font-medium">{item.contact}</TableCell>
                                <TableCell>{item.bank}</TableCell>
                                <TableCell className="text-right font-semibold">₹{item.amount.toLocaleString("en-IN")}</TableCell>
                                <TableCell>
                                    <Badge variant={getTypeVariant(item.type)}>{item.type}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                                </TableCell>
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
                        Showing {filteredData.length} of {data.length} checks
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
