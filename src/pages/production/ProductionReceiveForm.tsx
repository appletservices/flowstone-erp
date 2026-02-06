import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePageHeader } from "@/hooks/usePageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface ProductItem {
  id: number;
  product: string;
  remaining: number;
  labour_charges: number;
}

interface FormData {
  date: string;
  vendor_id: string;
  product_id: string;
  quantity: string;
  damage_qty: string;
  labour_charges: string;
  narration: string;
}

interface DropdownItem {
  id: number | string;
  name: string;
}

const url_ = import.meta.env.VITE_API_URL;

export default function ProductionReceiveForm() {
  const navigate = useNavigate();
  const { setHeaderInfo } = usePageHeader();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingVendors, setIsLoadingVendors] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const [vendors, setVendors] = useState<DropdownItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split("T")[0],
    vendor_id: "",
    product_id: "",
    quantity: "",
    damage_qty: "",
    labour_charges: "",
    narration: "",
  });

  useEffect(() => {
    setHeaderInfo({
      title: "Production Receive",
      subtitle: "Add new production receive record"
    });
  }, [setHeaderInfo]);

  // Fetch Vendors on Mount
  useEffect(() => {
    const fetchVendors = async () => {
      const token = localStorage.getItem("auth_token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      try {
        const response = await fetch(`${url_}/contacts/dropdown`, { headers });
        const data = await response.json();
        setVendors(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error("Error loading vendors:", error);
        toast.error("Failed to load vendors");
      } finally {
        setIsLoadingVendors(false);
      }
    };

    fetchVendors();
  }, []);

  // Fetch Products when Vendor is selected
  useEffect(() => {
    if (!formData.vendor_id) {
      setProducts([]);
      setSelectedProduct(null);
      return;
    }

    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      const token = localStorage.getItem("auth_token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      try {
        const response = await fetch(`${url_}/production/getProductByKariger/${formData.vendor_id}`, { headers });
        const data = await response.json();

        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Error loading products:", error);
        toast.error("Failed to load products");
        setProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
    // Reset product selection when vendor changes
    setFormData(prev => ({ ...prev, product_id: "", labour_charges: "" }));
    setSelectedProduct(null);
  }, [formData.vendor_id]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-fill labour charges when product is selected
    if (field === "product_id") {
      const product = products.find(p => String(p.id) === value);
      if (product) {
        setSelectedProduct(product);
        setFormData(prev => ({
          ...prev,
          product_id: value,
          labour_charges: String(product.labour_charges || 0)
        }));
      } else {
        setSelectedProduct(null);
      }
    }
  };

  const quantityExceedsRemaining = selectedProduct &&
    Number(formData.quantity) > selectedProduct.remaining;

  const handleSave = async () => {
    if (!formData.vendor_id || !formData.product_id || !formData.quantity) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (quantityExceedsRemaining) {
      toast.error("Quantity cannot exceed remaining quantity");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${url_}/production/receive/store`, {
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
          damage_qty: Number(formData.damage_qty) || 0,
          labour_charges: Number(formData.labour_charges) || 0,
          narration: formData.narration,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success !== false) {
        toast.success("Production receive record saved successfully!");
        navigate("/production/receive");
      } else {
        toast.error(result.message || "Failed to save record");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save record");
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
          onClick={() => navigate("/production/receive")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">New Production Receive</h2>
          <p className="text-sm text-muted-foreground">Fill in the receive details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receive Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
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
              <Label htmlFor="vendor">Vendor (Karigar)</Label>
              <SearchableSelect
                options={vendors.map((vendor) => ({
                  value: String(vendor.id),
                  label: vendor.name,
                }))}
                value={formData.vendor_id}
                onValueChange={(value) => handleInputChange("vendor_id", value)}
                placeholder="Select vendor..."
                searchPlaceholder="Search vendors..."
                isLoading={isLoadingVendors}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="product">Product</Label>
              <SearchableSelect
                options={products.map((product) => ({
                  value: String(product.id),
                  label: `${product.product} (Remaining: ${product.remaining})`,
                }))}
                value={formData.product_id}
                onValueChange={(value) => handleInputChange("product_id", value)}
                placeholder={formData.vendor_id ? "Select product..." : "Select vendor first..."}
                searchPlaceholder="Search products..."
                isLoading={isLoadingProducts}
                disabled={!formData.vendor_id}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter quantity"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                className={quantityExceedsRemaining ? "border-destructive" : ""}
              />
              {quantityExceedsRemaining && (
                <span className="text-xs text-destructive">
                  Exceeds remaining ({selectedProduct?.remaining})
                </span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="damage_qty">Damage Qty</Label>
              <Input
                id="damage_qty"
                type="number"
                placeholder="Enter damage quantity"
                value={formData.damage_qty}
                onChange={(e) => handleInputChange("damage_qty", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="labour_charges">Labour Charges</Label>
              <Input
                id="labour_charges"
                type="number"
                placeholder="Labour charges"
                value={formData.labour_charges}
                onChange={(e) => handleInputChange("labour_charges", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="narration">Narration</Label>
            <Textarea
              id="narration"
              placeholder="Enter narration/notes..."
              value={formData.narration}
              onChange={(e) => handleInputChange("narration", e.target.value)}
              rows={3}
            />
          </div>

          <div className="pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving || quantityExceedsRemaining}
              className="w-full gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Receive
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
