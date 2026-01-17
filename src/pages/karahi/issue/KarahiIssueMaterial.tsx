import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft, Save, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SearchableSelect } from "@/components/ui/searchable-select";

const url_ = new URL(`${import.meta.env.VITE_API_URL}`);

interface DropdownItem {
  id: number | string;
  name: string;
}

export default function KarahiIssueMaterial() {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>(new Date());
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [vendors, setVendors] = useState<DropdownItem[]>([]);
  const [products, setProducts] = useState<DropdownItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch Vendors and Products on Mount
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("auth_token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      try {
        const [vendorRes, productRes] = await Promise.all([
          fetch(`${url_}/contacts/vendors/embroidery`, { headers }),
          fetch(`${url_}/inventory/dropdown`, { headers }),
        ]);

        const vendorsData = await vendorRes.json();
        const productsData = await productRes.json();

        setVendors(Array.isArray(vendorsData) ? vendorsData : vendorsData.data || []);
        setProducts(Array.isArray(productsData) ? productsData : productsData.data || []);
      } catch (error) {
        console.error("Error loading dropdown data:", error);
        toast.error("Failed to load vendors or products");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!selectedVendor || !selectedProduct || !quantity || Number(quantity) <= 0) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("auth_token");
      
      const payload = {
        date: format(date, "yyyy-MM-dd"),
        vendor_id: selectedVendor,
        product_id: selectedProduct,
        quantity: quantity,
      };

      const response = await fetch(`${url_}/karahi/issue/store`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success !== false) {
        toast.success("Karahi material issued successfully");
        navigate("/karahi/list");
      } else {
        toast.error(result.message || "Failed to issue material");
      }
    } catch (error) {
      console.error("Error issuing material:", error);
      toast.error("An error occurred while saving");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/karahi/list")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Issue Karahi Material</h1>
            <p className="text-muted-foreground">Issue materials to karahi vendor</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="space-y-2">
            <Label>EMBROIDERY VENDORS *</Label>
            <SearchableSelect
              options={vendors.map((vendor) => ({
                value: String(vendor.id),
                label: vendor.name,
              }))}
              value={selectedVendor}
              onValueChange={setSelectedVendor}
              placeholder="Select vendor"
              searchPlaceholder="Search vendors..."
              isLoading={isLoadingData}
            />
          </div>

          <div className="space-y-2">
            <Label>Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

        
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       

          <div className="space-y-2">
            <Label>Product *</Label>
            <SearchableSelect
              options={products.map((product) => ({
                value: String(product.id),
                label: product.name,
              }))}
              value={selectedProduct}
              onValueChange={setSelectedProduct}
              placeholder="Select product"
              searchPlaceholder="Search products..."
              isLoading={isLoadingData}
            />
          </div>


            <div className="space-y-2">
            <Label>Quantity *</Label>
            <Input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => navigate("/karahi/list")}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || isLoadingData}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
}