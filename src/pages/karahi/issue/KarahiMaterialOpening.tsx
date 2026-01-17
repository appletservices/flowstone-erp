import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { SearchableSelect } from '@/components/ui/searchable-select';

interface DropdownOption {
  id: number | string;
  name: string;
}

const KarahiMaterialOpening = () => {
    const navigate = useNavigate();
  const [date, setDate] = useState<Date>(new Date());
  const [quantity, setQuantity] = useState('');
  const [perUnitCost, setPerUnitCost] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedInventory, setSelectedInventory] = useState('');
  
  const [vendors, setVendors] = useState<DropdownOption[]>([]);
  const [inventory, setInventory] = useState<DropdownOption[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Dropdown Data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      const token = localStorage.getItem("auth_token");
      const headers = { Authorization: `Bearer ${token}` };
      const API_URL = import.meta.env.VITE_API_URL;

      try {
        const [vRes, iRes] = await Promise.all([
          fetch(`${API_URL}/contacts/vendors/embroidery`, { headers }),
          fetch(`${API_URL}/inventory/dropdown`, { headers }),
        ]);

        const vData = await vRes.json();
        const iData = await iRes.json();

        setVendors(vData.data || vData || []);
        setInventory(iData.data || iData || []);
      } catch (error) {
        console.error('Error fetching dropdowns:', error);
        toast.error('Failed to load form data');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !quantity || !perUnitCost || !selectedVendor || !selectedInventory) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        date: format(date, 'yyyy-MM-dd'),
        quantity: quantity,
        per_unit_cost: perUnitCost,
        vendor_id: selectedVendor,
        inventory_id: selectedInventory,
      };

      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/karahi/opening/store`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success !== false) {
        toast.success('Karahi material opening saved successfully');
        // Reset form
         navigate("/karahi/list");

      } else {
        toast.error(result.message || 'Failed to save entry');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('An error occurred while saving');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Karahi Material Opening</h1>
          <p className="text-muted-foreground">Add opening balance for karahi materials</p>
        </div>
        {isLoadingData && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
      </div>

      <div className="bg-card rounded-lg border p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Select date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Vendor Selection */}
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor *</Label>
              <SearchableSelect
                options={vendors.map((v) => ({
                  value: String(v.id),
                  label: v.name,
                }))}
                value={selectedVendor}
                onValueChange={setSelectedVendor}
                placeholder="Select vendor"
                searchPlaceholder="Search vendors..."
                isLoading={isLoadingData}
              />
            </div>

            {/* Inventory Selection */}
            <div className="space-y-2">
              <Label htmlFor="inventory">Inventory Item *</Label>
              <SearchableSelect
                options={inventory.map((item) => ({
                  value: String(item.id),
                  label: item.name,
                }))}
                value={selectedInventory}
                onValueChange={setSelectedInventory}
                placeholder="Select inventory item"
                searchPlaceholder="Search inventory..."
                isLoading={isLoadingData}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               {/* Quantity */}
                <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                    id="quantity"
                    type="number"
                    placeholder="0.00"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="0"
                    step="any"
                />
                </div>

                {/* Per Unit Cost */}
                <div className="space-y-2">
                <Label htmlFor="perUnitCost">Per Unit Cost *</Label>
                <Input
                    id="perUnitCost"
                    type="number"
                    placeholder="0.00"
                    value={perUnitCost}
                    onChange={(e) => setPerUnitCost(e.target.value)}
                    min="0"
                    step="any"
                />
                </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" disabled={isSubmitting || isLoadingData} className="w-full md:w-auto">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Opening Balance'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KarahiMaterialOpening;