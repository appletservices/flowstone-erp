import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSetPageHeader } from "@/hooks/usePageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Eye, ArrowUp, ArrowDown, Search, Plus, Loader2 } from "lucide-react";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

interface MaterialItem {
    id: number;
    name: string;
    inv: number;
    issued: number;
    required: number;
    remaining: number;
    returned: number;
}

interface LedgerEntry {
    date: string;
    issuedQty: number;
    returnQty: number;
}

const sampleLedger: LedgerEntry[] = [
    { date: "2026-02-10", issuedQty: 20, returnQty: 0 },
    { date: "2026-02-12", issuedQty: 25, returnQty: 5 },
    { date: "2026-02-14", issuedQty: 15, returnQty: 0 },
];

const ProductionMaterial = () => {
    const { pid: productionId, id: productionTrack } = useParams();
    useSetPageHeader("Production Material", "Manage production material issue and returns");

    // Helper to get today's date in YYYY-MM-DD
    const getToday = () => new Date().toISOString().split('T')[0];

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<MaterialItem[]>([]);
    const [inventoryOptions, setInventoryOptions] = useState<{ value: string; label: string }[]>([]);

    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    // Dialog States
    const [ledgerOpen, setLedgerOpen] = useState(false);
    const [ledgerItem, setLedgerItem] = useState<MaterialItem | null>(null);

    const [issueOpen, setIssueOpen] = useState(false);
    const [issueItem, setIssueItem] = useState<MaterialItem | null>(null);
    const [issueQty, setIssueQty] = useState("");
    const [issueDate, setIssueDate] = useState(getToday());

    const [returnOpen, setReturnOpen] = useState(false);
    const [returnItem, setReturnItem] = useState<MaterialItem | null>(null);
    const [returnQty, setReturnQty] = useState("");
    const [returnDate, setReturnDate] = useState(getToday());

    const [issueNewOpen, setIssueNewOpen] = useState(false);
    const [issueNewItem, setIssueNewItem] = useState("");
    const [issueNewQty, setIssueNewQty] = useState("");
    const [issueNewDate, setIssueNewDate] = useState(getToday());

    const authHeaders = {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        "Content-Type": "application/json",
    };

    const fetchMaterialData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/production/issue/materail/${productionId}`, { headers: authHeaders });
            const result = await response.json();
            setData(result);
        } catch (error) { toast.error("Failed to load material data"); }
        finally { setLoading(false); }
    };

    const fetchInventory = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/inventory/dropdown`, { headers: authHeaders });
            const result = await response.json();
            setInventoryOptions(result.map((item: any) => ({ value: String(item.id), label: item.name })));
        } catch (error) { console.error("Failed to load inventory"); }
    };

    useEffect(() => { if (productionId) { fetchMaterialData(); fetchInventory(); } }, [productionId]);

    const handleIssueMaterial = async () => {
        if (!issueQty || Number(issueQty) <= 0 || !issueDate) return toast.error("Quantity and Date are required");
        try {
            const response = await fetch(`${API_BASE_URL}/production/store`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({ production_id: productionId, track: productionTrack, item_id: issueItem?.id, qty: issueQty, date: issueDate }),
            });
            if (response.ok) { toast.success("Material issued"); setIssueOpen(false); fetchMaterialData(); }
        } catch (error) { toast.error("Failed to issue"); }
    };

    const handleReturnMaterial = async () => {
        if (!returnQty || Number(returnQty) <= 0 || !returnDate) return toast.error("Quantity and Date are required");
        try {
            const response = await fetch(`${API_BASE_URL}/production/return/store`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({ production_id: productionId, track: productionTrack, item_id: returnItem?.id, qty: returnQty, date: returnDate }),
            });
            if (response.ok) { toast.success("Material returned"); setReturnOpen(false); fetchMaterialData(); }
        } catch (error) { toast.error("Failed to return"); }
    };

    const handleIssueNewMaterial = async () => {
        if (!issueNewItem || !issueNewQty || !issueNewDate) return toast.error("All fields are required");
        try {
            const response = await fetch(`${API_BASE_URL}/production/issue/extra`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({ production_id: productionId, track: productionTrack, item_id: issueNewItem, qty: issueNewQty, date: issueNewDate }),
            });
            const result = await response.json();
            if (result.success != false && response.ok) {
                toast.success(result.message);
                setIssueNewOpen(false); fetchMaterialData();
            } else {
                toast.error(result.message || "Failed to issue new material");
            }
        } catch (error) { toast.error("Save failed"); }


    };

    const filteredData = data.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
    const totalPages = Math.ceil(filteredData.length / perPage);
    const paginatedData = filteredData.slice((currentPage - 1) * perPage, currentPage * perPage);

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search items..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="pl-9" />
                </div>
                <Button onClick={() => { setIssueNewDate(getToday()); setIssueNewItem(""); setIssueNewQty(""); setIssueNewOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" /> Issue New Material
                </Button>
            </div>

            <div className="border rounded-lg bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16">S.No</TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead className="text-right">Required</TableHead>
                            <TableHead className="text-right">Issued</TableHead>
                            <TableHead className="text-right">Returned</TableHead>
                            <TableHead className="text-right">Remaining</TableHead>
                            <TableHead className="text-center">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={7} className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                        ) : paginatedData.length === 0 ? (
                            <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No records found</TableCell></TableRow>
                        ) : (
                            paginatedData.map((item, idx) => (
                                <TableRow key={item.id}>
                                    <TableCell>{(currentPage - 1) * perPage + idx + 1}</TableCell>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell className="text-right">{item.required}</TableCell>
                                    <TableCell className="text-right">{item.issued}</TableCell>
                                    <TableCell className="text-right">{item.returned}</TableCell>
                                    <TableCell className="text-right font-semibold">{item.remaining}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-blue-500"
                                                title="Item Ledger"
                                                onClick={() => {
                                                    setLedgerItem(item);
                                                    setLedgerOpen(true);
                                                }}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" title="Issue Material" onClick={() => { setIssueItem(item); setIssueQty(""); setIssueDate(getToday()); setIssueOpen(true); }}><ArrowUp className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-600" title="Return Material" onClick={() => { setReturnItem(item); setReturnQty(""); setReturnDate(getToday()); setReturnOpen(true); }}><ArrowDown className="h-4 w-4" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border-t bg-muted/20">
                    <div className="text-sm text-muted-foreground">Showing {paginatedData.length} of {filteredData.length}</div>
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>Previous</Button>
                        <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>Next</Button>
                    </div>
                </div>
            </div>

            {/* Item Ledger Dialog */}
            <Dialog open={ledgerOpen} onOpenChange={setLedgerOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader><DialogTitle>Item Ledger — {ledgerItem?.name}</DialogTitle></DialogHeader>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Issued Qty</TableHead>
                                <TableHead className="text-right">Return Qty</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sampleLedger.map((entry, i) => (
                                <TableRow key={i}>
                                    <TableCell>{entry.date}</TableCell>
                                    <TableCell className="text-right">{entry.issuedQty}</TableCell>
                                    <TableCell className="text-right">{entry.returnQty}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </DialogContent>
            </Dialog>

            {/* Issue Material Dialog */}
            <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader><DialogTitle>Issue Material — {issueItem?.name}</DialogTitle></DialogHeader>
                    <div className="space-y-3 py-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Date</label>
                            <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Quantity</label>
                            <Input type="number" value={issueQty} onChange={(e) => setIssueQty(e.target.value)} placeholder="Enter quantity" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIssueOpen(false)}>Cancel</Button>
                        <Button onClick={handleIssueMaterial}>Submit</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Return Material Dialog */}
            <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader><DialogTitle>Return Material — {returnItem?.name}</DialogTitle></DialogHeader>
                    <div className="space-y-3 py-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Date</label>
                            <Input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Quantity</label>
                            <Input type="number" value={returnQty} onChange={(e) => setReturnQty(e.target.value)} placeholder="Enter quantity" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReturnOpen(false)}>Cancel</Button>
                        <Button onClick={handleReturnMaterial}>Submit</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Issue New Material Dialog */}
            <Dialog open={issueNewOpen} onOpenChange={setIssueNewOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader><DialogTitle>Issue New Material</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Date</label>
                            <Input type="date" value={issueNewDate} onChange={(e) => setIssueNewDate(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Item</label>
                            <SearchableSelect options={inventoryOptions} value={issueNewItem} onValueChange={setIssueNewItem} placeholder="Select item..." />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Quantity</label>
                            <Input type="number" value={issueNewQty} onChange={(e) => setIssueNewQty(e.target.value)} placeholder="Enter quantity" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIssueNewOpen(false)}>Cancel</Button>
                        <Button onClick={handleIssueNewMaterial}>Submit</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProductionMaterial;