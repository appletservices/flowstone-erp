import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft, Save } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const vendors = [
  { id: "1", name: "Vendor A" },
  { id: "2", name: "Vendor B" },
  { id: "3", name: "Vendor C" },
  { id: "4", name: "Vendor D" },
];

const products: Record<string, { id: string; name: string }[]> = {
  "1": [
    { id: "1", name: "Karahi Item A1" },
    { id: "2", name: "Karahi Item A2" },
  ],
  "2": [
    { id: "3", name: "Karahi Item B1" },
    { id: "4", name: "Karahi Item B2" },
  ],
  "3": [
    { id: "5", name: "Karahi Item C1" },
    { id: "6", name: "Karahi Item C2" },
  ],
  "4": [
    { id: "7", name: "Karahi Item D1" },
    { id: "8", name: "Karahi Item D2" },
  ],
};

export default function KarahiIssueMaterial() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableProducts = selectedVendor ? products[selectedVendor] || [] : [];

  const handleVendorChange = (vendorId: string) => {
    setSelectedVendor(vendorId);
    setSelectedProduct("");
  };

  const handleSubmit = async () => {
    if (!selectedVendor) {
      toast({
        title: "Error",
        description: "Please select a vendor",
        variant: "destructive",
      });
      return;
    }

    if (!selectedProduct) {
      toast({
        title: "Error",
        description: "Please select a product",
        variant: "destructive",
      });
      return;
    }

    if (quantity <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const vendor = vendors.find((v) => v.id === selectedVendor);
      const product = availableProducts.find((p) => p.id === selectedProduct);

      const payload = {
        date: format(date, "yyyy-MM-dd"),
        vendor_id: selectedVendor,
        vendor_name: vendor?.name || "",
        product_id: selectedProduct,
        product_name: product?.name || "",
        quantity,
      };

      const { error } = await supabase.functions.invoke("karahi-issue-material", {
        body: payload,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Karahi material issued successfully",
      });
      navigate("/karahi/list");
    } catch (error) {
      console.error("Error issuing material:", error);
      toast({
        title: "Error",
        description: "Failed to issue material",
        variant: "destructive",
      });
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
            <p className="text-muted-foreground">
              Issue materials to karahi vendor
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 space-y-6 ">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Date</Label>
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

          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input
              type="number"
              min="0"
              value={quantity || ""}
              onChange={(e) => setQuantity(Number(e.target.value))}
              placeholder="Enter quantity"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Vendor</Label>
            <Select value={selectedVendor} onValueChange={handleVendorChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Product</Label>
            <Select 
              value={selectedProduct} 
              onValueChange={setSelectedProduct}
              disabled={!selectedVendor}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedVendor ? "Select product" : "Select vendor first"} />
              </SelectTrigger>
              <SelectContent>
                {availableProducts.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => navigate("/karahi/list")}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
}
