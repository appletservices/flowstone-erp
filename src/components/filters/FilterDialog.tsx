import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export interface FilterValue {
  key: string;
  value: string;
}

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (filters: { dateRange: DateRange; keyValues: FilterValue[] }) => void;
  showDateRange?: boolean;
  filterFields?: { key: string; label: string; placeholder?: string }[];
  initialDateRange?: DateRange;
  initialKeyValues?: FilterValue[];
}

export function FilterDialog({
  open,
  onOpenChange,
  onApply,
  showDateRange = true,
  filterFields = [],
  initialDateRange,
  initialKeyValues = [],
}: FilterDialogProps) {
  const [dateRange, setDateRange] = useState<DateRange>(
    initialDateRange || { from: undefined, to: undefined }
  );
  const [keyValues, setKeyValues] = useState<FilterValue[]>(initialKeyValues);

  useEffect(() => {
    if (open) {
      setDateRange(initialDateRange || { from: undefined, to: undefined });
      setKeyValues(initialKeyValues.length > 0 ? initialKeyValues : []);
    }
  }, [open, initialDateRange, initialKeyValues]);

  const addKeyValue = () => {
    setKeyValues([...keyValues, { key: "", value: "" }]);
  };

  const removeKeyValue = (index: number) => {
    setKeyValues(keyValues.filter((_, i) => i !== index));
  };

  const updateKeyValue = (index: number, field: "key" | "value", val: string) => {
    const updated = [...keyValues];
    updated[index][field] = val;
    setKeyValues(updated);
  };

  const handleApply = () => {
    const validKeyValues = keyValues.filter((kv) => kv.key && kv.value);
    onApply({ dateRange, keyValues: validKeyValues });
    onOpenChange(false);
  };

  const handleClear = () => {
    setDateRange({ from: undefined, to: undefined });
    setKeyValues([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card">
        <DialogHeader>
          <DialogTitle>Filter Options</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Date Range Filter */}
          {showDateRange && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Date Range</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">From</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from
                          ? format(dateRange.from, "dd MMM yyyy")
                          : "Start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) =>
                          setDateRange({ ...dateRange, from: date })
                        }
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">To</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.to
                          ? format(dateRange.to, "dd MMM yyyy")
                          : "End date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-card" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) =>
                          setDateRange({ ...dateRange, to: date })
                        }
                        disabled={(date) =>
                          dateRange.from ? date < dateRange.from : false
                        }
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          )}

          {/* Predefined Filter Fields */}
          {filterFields.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Filter By</Label>
              <div className="space-y-3">
                {filterFields.map((field) => {
                  const existing = keyValues.find((kv) => kv.key === field.key);
                  return (
                    <div key={field.key} className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        {field.label}
                      </Label>
                      <Input
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                        value={existing?.value || ""}
                        onChange={(e) => {
                          const idx = keyValues.findIndex((kv) => kv.key === field.key);
                          if (idx >= 0) {
                            updateKeyValue(idx, "value", e.target.value);
                          } else {
                            setKeyValues([
                              ...keyValues,
                              { key: field.key, value: e.target.value },
                            ]);
                          }
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}


        </div>

        <div className="flex justify-between pt-4 border-t border-border">
          <Button type="button" variant="ghost" onClick={handleClear}>
            Clear All
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleApply}>
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
