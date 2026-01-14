import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface ContactFormDialogProps {
  trigger?: React.ReactNode;
  title: string;
  accountTypes: { value: string; label: string }[];
  onSubmit?: (data: ContactFormData) => Promise<{ success: boolean; message?: string }> | void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultValues?: Partial<ContactFormData>;
  isLoading?: boolean;
}

export interface ContactFormData {
  accountType: string;
  name: string;
  date: Date | undefined;
  phone: string;
  cnic: string;
  balanceType: "credit" | "debit";
  openingAmount: string;
  address: string;
}

const emptyFormData: ContactFormData = {
  accountType: "",
  name: "",
  date: undefined,
  phone: "",
  cnic: "",
  balanceType: "credit",
  openingAmount: "",
  address: "",
};

export function ContactFormDialog({
  trigger,
  title,
  accountTypes,
  onSubmit,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  defaultValues,
  isLoading: externalLoading = false,
}: ContactFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;

  const [formData, setFormData] = useState<ContactFormData>(
    defaultValues ? { ...emptyFormData, ...defaultValues } : emptyFormData
  );

  useEffect(() => {
    if (defaultValues && open) {
      setFormData({ ...emptyFormData, ...defaultValues });
    }
  }, [defaultValues, open]);

  useEffect(() => {
    if (open) {
      setApiError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    
    if (!formData.accountType || !formData.name || !formData.phone) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onSubmit?.(formData);
      if (result && !result.success) {
        setApiError(result.message || "An error occurred");
        return;
      }
      setOpen(false);
      setFormData(emptyFormData);
    } catch (error) {
      console.error(error);
      setApiError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setFormData(emptyFormData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isControlled && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px] bg-card">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {externalLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {apiError && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive p-3 rounded-md text-sm whitespace-pre-line">
              {apiError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            {/* Account Type */}
            <div className="space-y-2">
              <Label htmlFor="accountType">Account Type *</Label>
              <SearchableSelect
                options={accountTypes.map((type) => ({
                  value: type.value,
                  label: type.label,
                }))}
                value={formData.accountType}
                onValueChange={(value) =>
                  setFormData({ ...formData, accountType: value })
                }
                placeholder="Select type"
                searchPlaceholder="Search account types..."
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => setFormData({ ...formData, date })}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Enter name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            {/* CNIC */}
            <div className="space-y-2">
              <Label htmlFor="cnic">CNIC</Label>
              <Input
                id="cnic"
                placeholder="Enter CNIC number"
                value={formData.cnic}
                onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Balance Type */}
            <div className="space-y-2">
              <Label htmlFor="balanceType">Balance Type</Label>
              <Select
                value={formData.balanceType}
                onValueChange={(value: "credit" | "debit") =>
                  setFormData({ ...formData, balanceType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select balance type" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  <SelectItem value="credit">Credit</SelectItem>
                  <SelectItem value="debit">Debit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Opening Amount */}
            <div className="space-y-2">
              <Label htmlFor="openingAmount">Opening Amount</Label>
              <Input
                id="openingAmount"
                type="number"
                placeholder="Enter amount"
                value={formData.openingAmount}
                onChange={(e) =>
                  setFormData({ ...formData, openingAmount: e.target.value })
                }
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="Enter address"
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {defaultValues ? "Update" : "Save"}
            </Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}