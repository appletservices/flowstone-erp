import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, Edit, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface ReturnItem {
  item: string;
  unit: string;
  unitprice: string;
  quantity: string;
  conversted_qty: string;
  amount: string;
}

interface ReturnInfo {
  vendor: string;
  vendorcat: string;
  purchase_date: string;
  total_items: number;
  t_charges: string;
  grand_total: string;
  reference_no?: string;
}

interface ApiResponse {
  info: ReturnInfo;
  data: ReturnItem[];
}

export default function PurchaseReturnDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<ApiResponse | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("auth_token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/purchase/return/detail/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch return details");

        const result: ApiResponse = await response.json();
        setOrderData(result);
      } catch (error) {
        console.error(error);
        toast.error("Could not load return details");
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

  if (!orderData) return <div className="p-8 text-center">Return not found.</div>;

  const { info, data } = orderData;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/purchase-return")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Return Details - {info.reference_no || `PR-${id}`}
            </h1>
            <p className="text-muted-foreground">
              View purchase return details and items
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => navigate(`/purchase-return/${id}/edit`)}>
            <Edit className="w-4 h-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Return Summary */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Return Summary</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Vendor</p>
            <p className="font-medium">{info.vendor}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Vendor Type</p>
            <p className="font-medium capitalize">{info.vendorcat}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-medium">{info.purchase_date}</p>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">T-Charges</p>
            <p className="text-xl font-bold">
              ₹{parseFloat(info.t_charges).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Items</p>
            <p className="text-xl font-bold">{info.total_items}</p>
          </div>
           <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-xl font-bold text-primary">
              ₹{parseFloat(info.grand_total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Return Items Table */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">Return Items</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Unit</th>
                <th>Unit Price</th>
                <th>Quantity</th>
                <th>Converted Qty</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} className="animate-fade-in">
                  <td className="font-medium">{item.item}</td>
                  <td>{item.unit}</td>
                  <td>₹{parseFloat(item.unitprice).toFixed(2)}</td>
                  <td>{parseFloat(item.quantity)}</td>
                  <td>{parseFloat(item.conversted_qty).toFixed(2)}</td>
                  <td className="font-semibold">
                    ₹{parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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