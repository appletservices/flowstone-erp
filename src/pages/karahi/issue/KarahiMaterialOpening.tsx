import React, { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
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

const mockVendors = [
  { id: '1', name: 'Vendor A' },
  { id: '2', name: 'Vendor B' },
  { id: '3', name: 'Vendor C' },
];

const mockInventory = [
  { id: '1', name: 'Raw Material 1', vendorId: '1' },
  { id: '2', name: 'Raw Material 2', vendorId: '1' },
  { id: '3', name: 'Raw Material 3', vendorId: '2' },
  { id: '4', name: 'Raw Material 4', vendorId: '2' },
  { id: '5', name: 'Raw Material 5', vendorId: '3' },
];

const KarahiMaterialOpening = () => {
  const [date, setDate] = useState<Date>();
  const [quantity, setQuantity] = useState('');
  const [perUnitCost, setPerUnitCost] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedInventory, setSelectedInventory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredInventory = selectedVendor
    ? mockInventory.filter((item) => item.vendorId === selectedVendor)
    : [];

  const handleVendorChange = (value: string) => {
    setSelectedVendor(value);
    setSelectedInventory('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !quantity || !perUnitCost || !selectedVendor || !selectedInventory) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = {
        date: format(date, 'yyyy-MM-dd'),
        quantity: parseFloat(quantity),
        per_unit_cost: parseFloat(perUnitCost),
        vendor_id: selectedVendor,
        inventory_id: selectedInventory,
      };

      console.log('Submitting karahi material opening:', formData);
      
      // TODO: Connect to backend API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success('Karahi material opening saved successfully');
      
      // Reset form
      setDate(undefined);
      setQuantity('');
      setPerUnitCost('');
      setSelectedVendor('');
      setSelectedInventory('');
    } catch (error) {
      console.error('Error saving karahi material opening:', error);
      toast.error('Failed to save karahi material opening');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Karahi Material Opening</h1>
        <p className="text-muted-foreground">Add opening balance for karahi materials</p>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
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
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className={cn('p-3 pointer-events-auto')}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            {/* Per Unit Cost */}
            <div className="space-y-2">
              <Label htmlFor="perUnitCost">Per Unit Cost</Label>
              <Input
                id="perUnitCost"
                type="number"
                placeholder="Enter per unit cost"
                value={perUnitCost}
                onChange={(e) => setPerUnitCost(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            {/* Vendor Selection */}
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <SearchableSelect
                options={mockVendors.map((vendor) => ({
                  value: vendor.id,
                  label: vendor.name,
                }))}
                value={selectedVendor}
                onValueChange={handleVendorChange}
                placeholder="Select vendor"
                searchPlaceholder="Search vendors..."
              />
            </div>

            {/* Inventory Selection */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="inventory">Inventory</Label>
              <SearchableSelect
                options={filteredInventory.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
                value={selectedInventory}
                onValueChange={setSelectedInventory}
                placeholder={selectedVendor ? 'Select inventory' : 'Select vendor first'}
                searchPlaceholder="Search inventory..."
                disabled={!selectedVendor}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Opening'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KarahiMaterialOpening;
