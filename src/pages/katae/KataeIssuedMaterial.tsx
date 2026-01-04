import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MaterialItem {
  id: string;
  materialName: string;
  quantity: number;
  unit: string;
  issuedDate: string;
}

const mockMaterials: MaterialItem[] = [
  { id: "1", materialName: "Raw Cotton", quantity: 50, unit: "kg", issuedDate: "2024-01-15" },
  { id: "2", materialName: "Dye Blue", quantity: 10, unit: "liters", issuedDate: "2024-01-16" },
  { id: "3", materialName: "Thread Spool", quantity: 100, unit: "pcs", issuedDate: "2024-01-17" },
];

export default function KataeIssuedMaterial() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const item = location.state?.item;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/katae/issued")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Issued Material Details</h1>
          <p className="text-muted-foreground">
            {item ? `${item.vendor} - ${item.product}` : `Material ID: ${id}`}
          </p>
        </div>
      </div>

      {item && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Vendor</p>
            <p className="text-lg font-semibold">{item.vendor}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Product</p>
            <p className="text-lg font-semibold">{item.product}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Available</p>
            <p className="text-lg font-semibold">{item.available}</p>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Issued Materials</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Material Name</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Issued Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockMaterials.map((material) => (
              <TableRow key={material.id}>
                <TableCell className="font-medium">{material.materialName}</TableCell>
                <TableCell className="text-right">{material.quantity}</TableCell>
                <TableCell>{material.unit}</TableCell>
                <TableCell>{material.issuedDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
