import { useState } from "react";
import { useSetPageHeader } from "@/hooks/usePageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, Edit, Trash2 } from "lucide-react";

const demoData = [
    { id: 1, date: "2024-01-15", referenceNo: "PL-001", issue: 50, received: 0, damage: 0, runningQty: 950, narration: "Issued to production line A" },
    { id: 2, date: "2024-01-16", referenceNo: "PL-002", issue: 0, received: 100, damage: 0, runningQty: 1050, narration: "Received from vendor" },
    { id: 3, date: "2024-01-17", referenceNo: "PL-003", issue: 0, received: 0, damage: 5, runningQty: 1045, narration: "Damaged during handling" },
    { id: 4, date: "2024-01-18", referenceNo: "PL-004", issue: 30, received: 0, damage: 0, runningQty: 1015, narration: "Issued to production line B" },
    { id: 5, date: "2024-01-19", referenceNo: "PL-005", issue: 0, received: 200, damage: 0, runningQty: 1215, narration: "Bulk received" },
];

export default function ProductionLedger() {
    useSetPageHeader("Production Ledger", "Track production inventory movements");

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    const filteredData = demoData.filter(
        (item) =>
            item.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.narration.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredData.length / perPage);
    const paginatedData = filteredData.slice((currentPage - 1) * perPage, currentPage * perPage);

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by reference or narration..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Reference No</TableHead>
                                    <TableHead className="text-right">Issue</TableHead>
                                    <TableHead className="text-right">Received</TableHead>
                                    <TableHead className="text-right">Damage</TableHead>
                                    <TableHead className="text-right">Running Qty</TableHead>
                                    <TableHead>Narration</TableHead>
                                    <TableHead className="text-center">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.date}</TableCell>
                                            <TableCell className="font-medium">{item.referenceNo}</TableCell>
                                            <TableCell className="text-right">{item.issue || "-"}</TableCell>
                                            <TableCell className="text-right">{item.received || "-"}</TableCell>
                                            <TableCell className="text-right">{item.damage || "-"}</TableCell>
                                            <TableCell className="text-right font-semibold">{item.runningQty}</TableCell>
                                            <TableCell>{item.narration}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No records found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {paginatedData.length} of {filteredData.length} entries
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Per page:</span>
                                <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setCurrentPage(1); }}>
                                    <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {[5, 10, 25, 50].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                                <span className="text-sm">Page {currentPage} of {totalPages || 1}</span>
                                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>Next</Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
