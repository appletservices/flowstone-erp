import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
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

interface ContactFormDialogProps {
  trigger: React.ReactNode;
  title: string;
  accountTypes: { value: string; label: string }[];
  onSubmit?: (data: ContactFormData) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultValues?: Partial<ContactFormData>;
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
}: ContactFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.accountType || !formData.name || !formData.phone) {
      toast.error("Please fill in required fields");
      return;
    }

    onSubmit?.(formData);
    if (!defaultValues) {
      toast.success(`${title} added successfully`);
    }
    setOpen(false);
    setFormData(emptyFormData);
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
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Account Type */}
            <div className="space-y-2">
              <Label htmlFor="accountType">Account Type *</Label>
              <Select
                value={formData.accountType}
                onValueChange={(value) =>
                  setFormData({ ...formData, accountType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  {accountTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{defaultValues ? "Update" : "Save"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}