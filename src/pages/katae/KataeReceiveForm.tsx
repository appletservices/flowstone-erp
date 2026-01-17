import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select";
import { toast } from "sonner";

interface FormData {
  vendor: string;
  date: string;
  inventory: string;
  quantity: string;
}

// Mock data for dropdowns
const mockVendors: SearchableSelectOption[] = [
  { value: "1", label: "Vendor A" },
  { value: "2", label: "Vendor B" },
  { value: "3", label: "Vendor C" },
  { value: "4", label: "Vendor D" },
];

const mockInventory: SearchableSelectOption[] = [
  { value: "1", label: "Design Pattern 1" },
  { value: "2", label: "Design Pattern 2" },
  { value: "3", label: "Design Pattern 3" },
  { value: "4", label: "Design Pattern 4" },
];

export default function KataeReceiveForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<FormData>({
    vendor: "",
    date: new Date().toISOString().split("T")[0],
    inventory: "",
    quantity: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      // Mock fetch for edit mode
      setFormData({
        vendor: "1",
        date: "2024-01-15",
        inventory: "1",
        quantity: "150",
      });
    }
  }, [isEdit, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vendor || !formData.date || !formData.inventory || !formData.quantity) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsLoading(true);

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success(isEdit ? "Katae receive entry updated" : "Katae receive entry created");
      navigate("/katae/receive");
    } catch (error) {
      toast.error("Failed to save entry");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEdit ? "Edit Katae Receive" : "Receive Katae"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? "Update katae receive entry" : "Create a new katae receive entry"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Receive Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor *</Label>
                <SearchableSelect
                  options={mockVendors}
                  value={formData.vendor}
                  onValueChange={(value) => setFormData({ ...formData, vendor: value })}
                  placeholder="Select vendor"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inventory">Inventory (Design) *</Label>
                <SearchableSelect
                  options={mockInventory}
                  value={formData.inventory}
                  onValueChange={(value) => setFormData({ ...formData, inventory: value })}
                  placeholder="Select inventory"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Enter quantity"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                  min="1"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Saving..." : isEdit ? "Update Entry" : "Save Entry"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
