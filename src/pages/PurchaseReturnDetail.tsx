import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer, Edit, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ReturnItem {
  id: string;
  item: string;
  unit: string;
  unitPrice: string;
  quantity: number;
  convertedQty: string;
  amount: string;
}

const sampleReturnItems: ReturnItem[] = [
  {
    id: "1",
    item: "Cotton Fabric - Blue",
    unit: "Meter",
    unitPrice: "₹250",
    quantity: 50,
    convertedQty: "50 m",
    amount: "₹12,500",
  },
  {
    id: "2",
    item: "Silk Thread - Gold",
    unit: "Spool",
    unitPrice: "₹150",
    quantity: 25,
    convertedQty: "25 pcs",
    amount: "₹3,750",
  },
  {
    id: "3",
    item: "Embroidery Beads",
    unit: "Packet",
    unitPrice: "₹80",
    quantity: 100,
    convertedQty: "100 pkt",
    amount: "₹8,000",
  },
];

const returnDetails = {
  returnNumber: "PR-2024-001",
  vendor: "ABC Textiles",
  vendorType: "karahi",
  date: "Dec 24, 2024",
  status: "completed",
  totalAmount: "₹45,000",
  tCharges: "₹1,200",
};

export default function PurchaseReturnDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

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
              Return Details - {returnDetails.returnNumber}
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Vendor</p>
            <p className="font-medium">{returnDetails.vendor}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Vendor Type</p>
            <p className="font-medium capitalize">{returnDetails.vendorType}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-medium">{returnDetails.date}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-medium capitalize">{returnDetails.status}</p>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-xl font-bold text-primary">{returnDetails.totalAmount}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">T-Charges</p>
            <p className="text-xl font-bold">{returnDetails.tCharges}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Items</p>
            <p className="text-xl font-bold">{sampleReturnItems.length}</p>
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
              {sampleReturnItems.map((item) => (
                <tr key={item.id} className="animate-fade-in">
                  <td className="font-medium">{item.item}</td>
                  <td>{item.unit}</td>
                  <td>{item.unitPrice}</td>
                  <td>{item.quantity}</td>
                  <td>{item.convertedQty}</td>
                  <td className="font-semibold">{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing 1-{sampleReturnItems.length} of {sampleReturnItems.length} items
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