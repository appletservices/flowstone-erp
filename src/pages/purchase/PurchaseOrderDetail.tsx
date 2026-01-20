import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, Edit, FileText, Loader2 } from "lucide-react";
import { useSetPageHeader } from "@/hooks/usePageHeader";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface OrderItem {
  item: string;
  unit: string;
  unitprice: string;
  quantity: string;
  conversted_qty: string;
  amount: string;
}

interface OrderInfo {
  vendor: string;
  vendorcat: string;
  purchase_date: string;
  total_items: number;
  t_charges: string;
  grand_total: string;
}

interface ApiResponse {
  info: OrderInfo;
  data: OrderItem[];
}

export default function PurchaseOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<ApiResponse | null>(null);
  
  useSetPageHeader(`Order Details - PO-${id}`, "View purchase order details and items");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        // Using the proxy prefix /api as established in previous steps
        const token = localStorage.getItem("auth_token"); 
          const response = await fetch(`${import.meta.env.VITE_API_URL}/purchase/detail/${id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`, 
            },
          });

        if (!response.ok) throw new Error("Failed to fetch order details");
        
        const result: ApiResponse = await response.json();
        setOrderData(result);
      } catch (error) {
        console.error(error);
        toast.error("Could not load order details");
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

  if (!orderData) return <div className="p-8 text-center">Order not found.</div>;

  const { info, data } = orderData;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate("/inventory/purchase")}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => navigate(`/purchase/${id}/edit`)}>
            <Edit className="w-4 h-4" />
            Edit
          </Button>
        </div>
      </div>


  {/* Order Summary */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Order Summary</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
            <p className="text-sm text-muted-foreground">Vendor Type</p>
            <p className="text-sm font-bold capitalize capitalize chip text-[10px] px-2 py-0.5 chip-primary">{info.vendorcat}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Vendor</p>
            <p className="text-sm font-bold">{info.vendor}</p>
          </div>
        
          <div>
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="text-sm font-bold">{info.purchase_date}</p>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          
            <div>
            <p className="text-sm text-muted-foreground">Total Items</p>
            <p className="text-sm font-bold">{info.total_items}</p>
          </div>
            <div>
            <p className="text-sm text-muted-foreground">T-Charges</p>
            <p className="text-sm font-bold">{parseFloat(info.t_charges).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-sm font-bold text-primary"> ₹{parseFloat(info.grand_total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        
        
        </div>
      </div>

      {/* Order Items Table */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">Order Items</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr className="text-left border-b border-border">
                <th className="p-4">Item</th>
                <th className="p-4">Unit</th>
                <th className="p-4">Unit Price</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Converted Qty</th>
                <th className="p-4">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} className="animate-fade-in border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="p-4 font-medium">{item.item}</td>
                  <td className="p-4">{item.unit}</td>
                  <td className="p-4">₹{parseFloat(item.unitprice).toFixed(2)}</td>
                  <td className="p-4">{parseFloat(item.quantity)}</td>
                  <td className="p-4">{parseFloat(item.conversted_qty).toFixed(2)}</td>
                  <td className="p-4 font-semibold">
                    ₹{parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination / Footer Information */}
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