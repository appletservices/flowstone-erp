import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSetPageHeader } from "@/hooks/usePageHeader";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

const formSchema = z.object({
  date: z.string().min(1, "Date is required"),
  voucherNo: z.string().min(1, "Voucher No is required"),
  drAccountType: z.string().min(1, "DR Account Type is required"),
  drAccount: z.string().min(1, "DR Account is required"),
  crAccountType: z.string().min(1, "CR Account Type is required"),
  crAccount: z.string().min(1, "CR Account is required"),
  amount: z.string().min(1, "Amount is required"),
  narration: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AccountOption {
  value: string;
  label: string;
}

const accountTypeOptions = [
  { value: "other", label: "Other" },
  { value: "contact", label: "Contact" },
];

export default function JournalVoucherForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [drAccounts, setDrAccounts] = useState<AccountOption[]>([]);
  const [crAccounts, setCrAccounts] = useState<AccountOption[]>([]);
  const [loadingDr, setLoadingDr] = useState(false);
  const [loadingCr, setLoadingCr] = useState(false);

  useSetPageHeader("Create Journal Voucher", "Add a new journal entry");

  const token = localStorage.getItem("auth_token");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      voucherNo: "",
      drAccountType: "",
      drAccount: "",
      crAccountType: "",
      crAccount: "",
      amount: "",
      narration: "",
    },
  });

  const fetchAccountsByType = async (
    type: string,
    setter: (opts: AccountOption[]) => void,
    setLoading: (v: boolean) => void
  ) => {
    setLoading(true);
    setter([]);
    try {
      const res = await fetch(`${API_URL}/contacts/bytype/${type}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.data ?? data?.accounts ?? data?.acccounts ?? [];
      if (Array.isArray(list)) {
        setter(
          list.map((item: any) => ({
            value: String(item.id ?? item.value),
            label: item.name ?? item.label ?? item.text ?? "",
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
      toast.error("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleDrTypeChange = (type: string) => {
    form.setValue("drAccountType", type);
    form.setValue("drAccount", "");
    fetchAccountsByType(type, setDrAccounts, setLoadingDr);
  };

  const handleCrTypeChange = (type: string) => {
    form.setValue("crAccountType", type);
    form.setValue("crAccount", "");
    fetchAccountsByType(type, setCrAccounts, setLoadingCr);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        date: data.date,
        voucherNo: data.voucherNo,
        drAccountType: data.drAccountType,
        drAccount: data.drAccount,
        crAccountType: data.crAccountType,
        crAccount: data.crAccount,
        amount: Number(data.amount),
        narration: data.narration || "",
      };

      const res = await fetch(`${API_URL}/finance/jv/store`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        toast.success("Journal voucher created successfully");
        navigate("/finance/journal-voucher");
      } else {
        toast.error(result?.message || "Failed to create journal voucher");
      }

    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to create journal voucher");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/finance/journal-voucher")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-lg font-semibold">New Journal Voucher</h2>
          <p className="text-sm text-muted-foreground">Fill in the details below</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="voucherNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Voucher No</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter voucher number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* DR Account Type */}
              <FormField
                control={form.control}
                name="drAccountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DR Account Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={handleDrTypeChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accountTypeOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* DR Account */}
              <FormField
                control={form.control}
                name="drAccount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DR Account</FormLabel>
                    <div className="relative">
                      <SearchableSelect
                        options={drAccounts}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder={loadingDr ? "Loading..." : "Select DR account"}
                        searchPlaceholder="Search accounts..."
                        emptyMessage="No accounts found."
                        disabled={loadingDr || !form.watch("drAccountType")}
                      />
                      {loadingDr && (
                        <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CR Account Type */}
              <FormField
                control={form.control}
                name="crAccountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CR Account Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={handleCrTypeChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accountTypeOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CR Account */}
              <FormField
                control={form.control}
                name="crAccount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CR Account</FormLabel>
                    <div className="relative">
                      <SearchableSelect
                        options={crAccounts}
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder={loadingCr ? "Loading..." : "Select CR account"}
                        searchPlaceholder="Search accounts..."
                        emptyMessage="No accounts found."
                        disabled={loadingCr || !form.watch("crAccountType")}
                      />
                      {loadingCr && (
                        <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter amount" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="narration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Narration</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter narration or description..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/finance/journal-voucher")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSubmitting ? "Saving..." : "Save Journal Voucher"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
