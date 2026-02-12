import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, Edit, FileText, Loader2 } from "lucide-react";
import { useSetPageHeader } from "@/hooks/usePageHeader";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface SaleItem {
    item: string;
    unit: string;
    unit_price: string;
    quantity: string;
    total_amount: string;
    product_cost: string;
}

interface SaleInfo {
    date: string;
    customer: string;
    sale_type: string;
    book_no: string;
    v_no: string;
    charges: string;
    grand_total: string;
    total_items: number;
}

interface ApiResponse {
    info: SaleInfo;
    data: SaleItem[];
}

export default function SaleDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saleData, setSaleData] = useState<ApiResponse | null>(null);

    useSetPageHeader(`Sale Details - INV-${id}`, "View sale invoice details and items");

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("auth_token");
                const response = await fetch(`${import.meta.env.VITE_API_URL}/sale/detail/${id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (!response.ok) throw new Error("Failed to fetch sale details");

                const result: ApiResponse = await response.json();
                setSaleData(result);
            } catch (error) {
                console.error(error);
                toast.error("Could not load sale details");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!saleData) return <div className="p-8 text-center">Sale not found.</div>;

    const { info, data } = saleData;

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate("/sales")}>
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Button>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => window.open(`${import.meta.env.VITE_API_URL_PRINT}/print/sale/${id}`, "_blank")}
                    >
                        <Printer className="w-4 h-4" />
                        Print
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={() => navigate(`/sales/edit/${id}`)}>
                        <Edit className="w-4 h-4" />
                        Edit
                    </Button>
                </div>
            </div>

            {/* Sale Summary */}
            <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-semibold">Sale Summary</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="text-sm font-bold">{info.date}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Customer</p>
                        <p className="text-sm font-bold">{info.customer}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Sale Type</p>
                        <p className="text-sm font-bold capitalize chip text-[10px] px-2 py-0.5 chip-primary">{info.sale_type}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Book No</p>
                        <p className="text-sm font-bold">{info.book_no}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">V-No</p>
                        <p className="text-sm font-bold">{info.v_no}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Charges</p>
                        <p className="text-sm font-bold">{parseFloat(info.charges).toLocaleString()}</p>
                    </div>
                </div>
                <Separator className="my-4" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-sm text-muted-foreground">Total Items</p>
                        <p className="text-sm font-bold">{info.total_items}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Grand Total</p>
                        <p className="text-sm font-bold text-primary">{parseFloat(info.grand_total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                </div>
            </div>

            {/* Sale Items Table */}
            <div className="bg-card rounded-xl border border-border">
                <div className="p-4 border-b border-border">
                    <h3 className="font-semibold">Sale Items</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="data-table w-full">
                        <thead>
                            <tr className="text-left border-b border-border">
                                <th className="p-4">#</th>
                                <th className="p-4">Item</th>
                                <th className="p-4">Unit</th>
                                <th className="p-4">Unit-Price</th>
                                <th className="p-4">Quantity</th>
                                <th className="p-4">Total Amount</th>
                                <th className="p-4">Product Cost</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={index} className="animate-fade-in border-b border-border hover:bg-muted/50 transition-colors">
                                    <td className="p-4 text-muted-foreground">{index + 1}</td>
                                    <td className="p-4 font-medium">{item.item}</td>
                                    <td className="p-4">{item.unit}</td>
                                    <td className="p-4">{parseFloat(item.unit_price).toFixed(2)}</td>
                                    <td className="p-4">{parseFloat(item.quantity)}</td>
                                    <td className="p-4 font-semibold">
                                        {parseFloat(item.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="p-4 text-muted-foreground">{parseFloat(item.product_cost).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Information */}
                <div className="p-4 border-t border-border flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing 1-{data.length} of {info.total_items} items
                    </p>
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        <span className="w-2 h-2 rounded-full bg-muted"></span>
                        <span className="w-2 h-2 rounded-full bg-muted"></span>
                    </div>
                </div>
            </div>
        </div>
    );
}
