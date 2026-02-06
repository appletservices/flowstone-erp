import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePageHeader } from "@/hooks/usePageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface FormData {
  date: string;
  vendor_id: string;
  product_id: string;
  quantity: string;
  per_unit: string;
}

interface DropdownItem {
  id: number | string;
  name: string;
}

const url_ = import.meta.env.VITE_API_URL;

export default function ProductionOpeningForm() {
  const navigate = useNavigate();
  const { setHeaderInfo } = usePageHeader();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [vendors, setVendors] = useState<DropdownItem[]>([]);
  const [inventory, setInventory] = useState<DropdownItem[]>([]);

  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split("T")[0],
    vendor_id: "",
    product_id: "",
    quantity: "",
    per_unit: "",
  });

  useEffect(() => {
    setHeaderInfo({
      title: "Create Opening",
      subtitle: "Add new production opening record"
    });
  }, [setHeaderInfo]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("auth_token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      try {
        const [vendorRes, inventoryRes] = await Promise.all([
          fetch(`${url_}/contacts/dropdown`, { headers }),
          fetch(`${url_}/inventory/type/finish`, { headers }),
        ]);

        const vendorsData = await vendorRes.json();
        const inventoryData = await inventoryRes.json();

        setVendors(Array.isArray(vendorsData) ? vendorsData : vendorsData.data || []);
        setInventory(Array.isArray(inventoryData) ? inventoryData : inventoryData.data || []);
      } catch (error) {
        console.error("Error loading dropdown data:", error);
        toast.error("Failed to load data");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const totalCost = (Number(formData.quantity) || 0) * (Number(formData.per_unit) || 0);

  const handleSave = async () => {
    if (!formData.vendor_id || !formData.product_id || !formData.quantity || !formData.per_unit) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${url_}/production/opening/store`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: formData.date,
          vendor_id: formData.vendor_id,
          product_id: formData.product_id,
          quantity: Number(formData.quantity),
          per_unit: Number(formData.per_unit),
          total_cost: totalCost,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success !== false) {
        toast.success("Opening record created successfully");
        navigate("/production/opening");
      } else {
        toast.error(result.message || "Failed to save opening record");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save opening record");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/production/opening")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">New Opening</h2>
          <p className="text-sm text-muted-foreground">Fill in the opening details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Opening Detail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor">Embroidery Vendor</Label>
              <SearchableSelect
                options={vendors.map((vendor) => ({
                  value: String(vendor.id),
                  label: vendor.name,
                }))}
                value={formData.vendor_id}
                onValueChange={(value) => handleInputChange("vendor_id", value)}
                placeholder="Select vendor..."
                searchPlaceholder="Search vendors..."
                isLoading={isLoadingData}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product">Inventory</Label>
              <SearchableSelect
                options={inventory.map((item) => ({
                  value: String(item.id),
                  label: item.name,
                }))}
                value={formData.product_id}
                onValueChange={(value) => handleInputChange("product_id", value)}
                placeholder="Select inventory..."
                searchPlaceholder="Search inventory..."
                isLoading={isLoadingData}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter quantity"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="per_unit">Per Unit Cost</Label>
              <Input
                id="per_unit"
                type="number"
                placeholder="Enter per unit cost"
                value={formData.per_unit}
                onChange={(e) => handleInputChange("per_unit", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Total Cost</Label>
              <div className="h-10 flex items-center px-3 rounded-md border bg-muted text-foreground font-medium">
                ₹{totalCost.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Opening
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
