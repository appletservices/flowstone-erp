import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSetPageHeader } from "@/hooks/usePageHeader";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const formSchema = z.object({
    date: z.string().min(1, "Date is required"),
    voucherNo: z.string().min(1, "Voucher number is required"),
    accountType: z.string().min(1, "Account type is required"),
    contact: z.string().min(1, "Contact is required"),
    bank: z.string().min(1, "Bank is required"),
    amount: z.string().min(1, "Amount is required"),
    narration: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ApiOption {
    id: number | string;
    name: string;
}

export default function PaymentVoucherForm() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [contactOptions, setContactOptions] = useState<ApiOption[]>([]);
    const [bankOptions, setBankOptions] = useState<ApiOption[]>([]);

    const token = localStorage.getItem("auth_token");
    const authHeaders = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };

    useSetPageHeader("Create Payment Voucher", "Add a new payment voucher");

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: new Date().toISOString().split("T")[0],
            voucherNo: "",
            accountType: "",
            contact: "",
            bank: "",
            amount: "",
            narration: "",
        },
    });

    const selectedAccountType = form.watch("accountType");

    // Fetch Banks
    useEffect(() => {
        const fetchBanks = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/contacts/others/banks/dropdown`, { headers: authHeaders });
                const data = await response.json();
                setBankOptions(data);
            } catch (error) {
                toast.error("Failed to load banks");
            }
        };
        fetchBanks();
    }, []);

    // Fetch Contacts
    useEffect(() => {
        if (!selectedAccountType) return;
        const fetchContacts = async () => {
            const endpoint = selectedAccountType === "contact"
                ? "/contacts/vendors/all-dropdown"
                : "/contacts/others/dropdown";
            try {
                form.setValue("contact", "");
                const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers: authHeaders });
                const data = await response.json();
                setContactOptions(data);
            } catch (error) {
                toast.error("Failed to load contacts");
            }
        };
        fetchContacts();
    }, [selectedAccountType]);

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/finance/payment/store`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (result.success) {
                toast.success("Payment voucher created successfully");
                navigate("/finance/payment-voucher");
            } else {
                toast.error(result.message || "Failed to create voucher");
            }
        } catch (error) {
            toast.error("Submission error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate("/finance/payment-voucher")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold">New Payment Voucher</h2>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Date Field */}
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date</FormLabel>
                                        <FormControl><Input type="date" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Voucher No - Editable */}
                            <FormField
                                control={form.control}
                                name="voucherNo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Voucher No</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Account Type */}
                            <FormField
                                control={form.control}
                                name="accountType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Account Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="contact">Contact</SelectItem>
                                                <SelectItem value="others">Others</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Contact - Searchable Combobox */}
                            <FormField
                                control={form.control}
                                name="contact"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col mt-2">
                                        <FormLabel>Contact</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                                                        disabled={!selectedAccountType}
                                                    >
                                                        {field.value
                                                            ? contactOptions.find((opt) => String(opt.id) === field.value)?.name
                                                            : "Select contact..."}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search contact..." />
                                                    <CommandList>
                                                        <CommandEmpty>No contact found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {contactOptions.map((opt) => (
                                                                <CommandItem
                                                                    key={opt.id}
                                                                    value={opt.name}
                                                                    onSelect={() => form.setValue("contact", String(opt.id))}
                                                                >
                                                                    <Check className={cn("mr-2 h-4 w-4", String(opt.id) === field.value ? "opacity-100" : "opacity-0")} />
                                                                    {opt.name}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Bank - Searchable Combobox */}
                            <FormField
                                control={form.control}
                                name="bank"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col mt-2">
                                        <FormLabel>Bank</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                                                    >
                                                        {field.value
                                                            ? bankOptions.find((bank) => String(bank.id) === field.value)?.name
                                                            : "Select bank..."}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search bank..." />
                                                    <CommandList>
                                                        <CommandEmpty>No bank found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {bankOptions.map((bank) => (
                                                                <CommandItem
                                                                    key={bank.id}
                                                                    value={bank.name}
                                                                    onSelect={() => form.setValue("bank", String(bank.id))}
                                                                >
                                                                    <Check className={cn("mr-2 h-4 w-4", String(bank.id) === field.value ? "opacity-100" : "opacity-0")} />
                                                                    {bank.name}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
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
                                        <FormControl><Input type="number" {...field} /></FormControl>
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
                                    <FormControl><Textarea className="min-h-[100px]" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => navigate("/finance/payment-voucher")}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Save Voucher"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}