import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePageHeader } from "@/hooks/usePageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Calculator, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface MaterialItem {
  material: string;
  material_id: number;
  required: number;
  available: number;
  per_unit: number;
  issue: number;
  perunitCost: number;
}

interface FormData {
  date: string;
  vendor_id: string;
  customer_reference_id: string;
  product_id: string;
  quantity: string;
  labour_charges: string;
}

const url_ = new URL(`${import.meta.env.VITE_API_URL}`);

interface DropdownItem {
  id: number | string;
  name: string;
}

export default function ProductionCollectiveForm() {
  const navigate = useNavigate();
  const { setHeaderInfo } = usePageHeader();
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const [vendors, setVendors] = useState<DropdownItem[]>([]);
  const [customers, setCustomers] = useState<DropdownItem[]>([]);
  const [products, setProducts] = useState<DropdownItem[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split("T")[0],
    vendor_id: "",
    customer_reference_id: "",
    product_id: "",
    quantity: "",
    labour_charges: "",
  });

  useEffect(() => {
    setHeaderInfo({ 
      title: "Create Production", 
      subtitle: "Add new production collective record" 
    });
  }, [setHeaderInfo]);

  // Fetch Vendors and Customers on Mount
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("auth_token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      try {
        const [vendorRes, customerRes, productRes] = await Promise.all([
          fetch(`${url_}/contacts/vendors/katae`, { headers }),
          fetch(`${url_}/contacts/vendors/katae`, { headers }),
          fetch(`${url_}/inventory/dropdown`, { headers }),
        ]);

        const vendorsData = await vendorRes.json();
        const customersData = await customerRes.json();
        const productsData = await productRes.json();

        setVendors(Array.isArray(vendorsData) ? vendorsData : vendorsData.data || []);
        setCustomers(Array.isArray(customersData) ? customersData : customersData.data || []);
        setProducts(Array.isArray(productsData) ? productsData : productsData.data || []);
      } catch (error) {
        console.error("Error loading dropdown data:", error);
        toast.error("Failed to load vendors or customers");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCalculate = async () => {
    if (!formData.product_id || !formData.quantity) {
      toast.error("Please select a product and enter quantity");
      return;
    }

    setIsCalculating(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/production/calculate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            date: formData.date,
            vendor_id: formData.vendor_id,
            customer_reference_id: formData.customer_reference_id,
            product_id: formData.product_id,
            quantity: Number(formData.quantity),
            labour_charges: Number(formData.labour_charges) || 0,
          }),
        }
      );

      const result = await response.json();
      
      if (result.success && result.data) {
        setMaterials(result.data);
        toast.success("Calculation completed");
      } else {
        toast.error(result.message || "Calculation failed");
      }
    } catch (error) {
      console.error("Calculate error:", error);
      toast.error("Failed to calculate materials");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSave = async () => {
    if (materials.length === 0) {
      toast.error("Please calculate materials first");
      return;
    }

    // Check if any issue qty exceeds available
    const hasExceeded = materials.some(item => item.issue > item.available);
    if (hasExceeded) {
      toast.error("Issue quantity cannot exceed available quantity");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${url_}/production/store`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: formData.date,
          vendor_id: formData.vendor_id,
          customer_reference_id: formData.customer_reference_id,
          product_id: formData.product_id,
          quantity: Number(formData.quantity),
          labour_charges: Number(formData.labour_charges) || 0,
          materials: materials.map(item => ({
            material_id: item.material_id,
            issue: item.issue,
            perunitCost: item.perunitCost,
          })),
          total_cost: totalCost,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success !== false) {
        toast.success("Production record saved successfully");
        navigate("/production/collective");
      } else {
        toast.error(result.message || "Failed to save production record");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save production record");
    } finally {
      setIsSaving(false);
    }
  };

  const totalCost = materials.reduce((sum, item) => sum + item.perunitCost, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/production/collective")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">New Production</h2>
          <p className="text-sm text-muted-foreground">Fill in the production details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Production Detail */}
        <Card>
          <CardHeader>
            <CardTitle>Production Detail</CardTitle>
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
                <Label htmlFor="vendor">Vendor</Label>
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
                <Label htmlFor="customer_reference">Customer Reference</Label>
                <SearchableSelect
                  options={customers.map((customer) => ({
                    value: String(customer.id),
                    label: customer.name,
                  }))}
                  value={formData.customer_reference_id}
                  onValueChange={(value) => handleInputChange("customer_reference_id", value)}
                  placeholder="Select reference..."
                  searchPlaceholder="Search references..."
                  isLoading={isLoadingData}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <SearchableSelect
                  options={products.map((product) => ({
                    value: String(product.id),
                    label: product.name,
                  }))}
                  value={formData.product_id}
                  onValueChange={(value) => handleInputChange("product_id", value)}
                  placeholder="Select product..."
                  searchPlaceholder="Search products..."
                  isLoading={isLoadingData}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="labour_charges">Labour Charges</Label>
                <Input
                  id="labour_charges"
                  type="number"
                  placeholder="Enter labour charges"
                  value={formData.labour_charges}
                  onChange={(e) => handleInputChange("labour_charges", e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={handleCalculate} 
                disabled={isCalculating}
                className="w-full gap-2"
              >
                {isCalculating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Calculator className="w-4 h-4" />
                )}
                Calculate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Issue Calculator */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Issue Calculator</CardTitle>
            {materials.length > 0 && (
              <div className="text-sm font-medium flex gap-4">
                <span>Total Cost: <span className="text-primary">₹{totalCost.toFixed(2)}</span></span>
                <span>Per Piece: <span className="text-primary">₹{(Number(formData.quantity) > 0 ? totalCost / Number(formData.quantity) : 0).toFixed(2)}</span></span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead className="text-right">Required Qty</TableHead>
                    <TableHead className="text-right">Available Qty</TableHead>
                    <TableHead className="text-right">Issue Qty</TableHead>
                    <TableHead className="text-right">Per Unit Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.length > 0 ? (
                    materials.map((item, index) => (
                      <TableRow key={item.material_id}>
                        <TableCell className="font-medium">{item.material}</TableCell>
                        <TableCell className="text-right">{item.required}</TableCell>
                        <TableCell className="text-right">{item.available.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <Input
                              type="number"
                              className={`w-20 text-right ${item.issue > item.available ? 'border-destructive' : ''}`}
                              value={item.issue}
                              onChange={(e) => {
                                const newIssue = Number(e.target.value) || 0;
                                setMaterials((prev) =>
                                  prev.map((m, i) =>
                                    i === index
                                      ? { ...m, issue: newIssue, perunitCost: newIssue * m.per_unit }
                                      : m
                                  )
                                );
                              }}
                            />
                            {item.issue > item.available && (
                              <span className="text-xs text-destructive mt-1">Exceeds available</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{item.perunitCost.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell 
                        colSpan={5} 
                        className="h-32 text-center text-muted-foreground"
                      >
                        Click "Calculate" to view material requirements
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {materials.length > 0 && (
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
                  Save Production
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
