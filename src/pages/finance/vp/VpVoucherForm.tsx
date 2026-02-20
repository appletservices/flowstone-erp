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
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSetPageHeader } from "@/hooks/usePageHeader";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

const formSchema = z.object({
    date: z.string().min(1, "Date is required"),
    vpNo: z.string().min(1, "VP No is required"),
    contact: z.string().min(1, "Contact is required"),
    contactId: z.string().optional(),
    bank: z.string().min(1, "Bank is required"),
    amount: z.string().min(1, "Amount is required"),
    narration: z.string().optional(),
    book: z.string().min(1, "Book is required"),
    voucherNo: z.string().min(1, "Voucher No is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface BankOption {
    value: string;
    label: string;
}

interface VpNumberOption {
    value: string;
    label: string;
}

export default function VpVoucherForm() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [banks, setBanks] = useState<BankOption[]>([]);
    const [vpNumbers, setVpNumbers] = useState<VpNumberOption[]>([]);
    const [loadingBanks, setLoadingBanks] = useState(false);
    const [loadingVpNumbers, setLoadingVpNumbers] = useState(false);
    const [loadingVp, setLoadingVp] = useState(false);
    const [vpLoaded, setVpLoaded] = useState(false);

    useSetPageHeader("Create VP Voucher", "Add a new VP voucher");

    const token = localStorage.getItem("auth_token");

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: new Date().toISOString().split("T")[0],
            vpNo: "",
            contact: "",
            contactId: "",
            bank: "",
            amount: "",
            narration: "",
            book: "",
            voucherNo: "",
        },
    });

    // Fetch banks dropdown
    useEffect(() => {
        const fetchBanks = async () => {
            setLoadingBanks(true);
            try {
                const res = await fetch(`${API_URL}/contacts/others/banks/dropdown`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                });
                const data = await res.json();
                if (data && Array.isArray(data)) {
                    setBanks(data.map((b: any) => ({ value: String(b.id ?? b.value), label: b.name ?? b.label ?? b.text })));
                } else if (data?.data && Array.isArray(data.data)) {
                    setBanks(data.data.map((b: any) => ({ value: String(b.id ?? b.value), label: b.name ?? b.label ?? b.text })));
                }
            } catch (error) {
                console.error("Failed to fetch banks:", error);
                toast.error("Failed to load banks");
            } finally {
                setLoadingBanks(false);
            }
        };
        fetchBanks();
    }, [token]);

    // Fetch VP numbers dropdown
    useEffect(() => {
        const fetchVpNumbers = async () => {
            setLoadingVpNumbers(true);
            try {
                const res = await fetch(`${API_URL}/sale/vpnumbers`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                });
                const data = await res.json();
                if (data?.success && Array.isArray(data.acccounts)) {
                    setVpNumbers(data.acccounts.map((vp: any) => ({ value: String(vp.id), label: String(vp.vpnumber) })));
                } else if (data?.success && data?.acccounts) {
                    setVpNumbers([{ value: String(data.acccounts.id), label: String(data.acccounts.vpnumber) }]);
                }
            } catch (error) {
                console.error("Failed to fetch VP numbers:", error);
                toast.error("Failed to load VP numbers");
            } finally {
                setLoadingVpNumbers(false);
            }
        };
        fetchVpNumbers();
    }, [token]);

    // Fetch VP number details when VP No is selected
    const handleVpNoChange = async (vpNo: string) => {
        form.setValue("vpNo", vpNo);
        if (!vpNo) {
            setVpLoaded(false);
            form.setValue("contact", "");
            form.setValue("contactId", "");
            form.setValue("amount", "");
            form.setValue("book", "");
            form.setValue("voucherNo", "");
            return;
        }

        setLoadingVp(true);
        try {
            const res = await fetch(`${API_URL}/finance/payment/vp-number/${vpNo}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            const data = await res.json();
            if (data?.success && data?.acccounts) {
                const acc = data.acccounts;
                form.setValue("contact", acc.contact || "");
                form.setValue("contactId", String(acc.contact_id || ""));
                form.setValue("amount", String(acc.amount || ""));
                form.setValue("book", acc.book || "");
                form.setValue("voucherNo", acc.vno || "");
                setVpLoaded(true);
            } else {
                toast.error("Failed to load VP number details");
                setVpLoaded(false);
            }
        } catch (error) {
            console.error("Failed to fetch VP details:", error);
            toast.error("Failed to load VP number details");
            setVpLoaded(false);
        } finally {
            setLoadingVp(false);
        }
    };

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        try {
            const payload = {
                date: data.date,
                "voucher-number": data.vpNo,
                contact: data.contactId,
                bank: data.bank,
                amount: Number(data.amount),
                narration: data.narration || "",
            };

            const res = await fetch(`${API_URL}/finance/receipt/vp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            const result = await res.json();
            if (result?.success && res.ok) {
                toast.success("VP voucher created successfully");
                navigate("/finance/vp-voucher");
            } else {
                toast.error(result?.message || "Failed to create VP voucher");
            }
        } catch (error) {
            console.error("Submit error:", error);
            toast.error("Failed to create VP voucher");
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
                    onClick={() => navigate("/finance/vp-voucher")}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-lg font-semibold">New VP Voucher</h2>
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
                                name="vpNo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>VP No</FormLabel>
                                        <div className="relative">
                                            <SearchableSelect
                                                options={vpNumbers}
                                                value={field.value}
                                                onValueChange={(val) => {
                                                    field.onChange(val);
                                                    handleVpNoChange(val);
                                                }}
                                                placeholder={loadingVpNumbers ? "Loading..." : "Select VP No"}
                                                searchPlaceholder="Search VP numbers..."
                                                emptyMessage="No VP numbers found."
                                                disabled={loadingVpNumbers}
                                            />
                                            {loadingVp && (
                                                <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                                            )}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="contact"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact</FormLabel>
                                        <FormControl>
                                            <Input {...field} readOnly className="bg-muted" placeholder="Auto-filled from VP No" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="bank"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bank</FormLabel>
                                        <SearchableSelect
                                            options={banks}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            placeholder={loadingBanks ? "Loading banks..." : "Select bank"}
                                            searchPlaceholder="Search banks..."
                                            emptyMessage="No banks found."
                                            disabled={loadingBanks}
                                        />
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
                                            <Input type="number" placeholder="Auto-filled from VP No" {...field} readOnly={vpLoaded} className={vpLoaded ? "bg-muted" : ""} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="book"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Book</FormLabel>
                                        <FormControl>
                                            <Input {...field} readOnly className="bg-muted" placeholder="Auto-filled from VP No" />
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
                                            <Input {...field} readOnly className="bg-muted" placeholder="Auto-filled from VP No" />
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
                                onClick={() => navigate("/finance/vp-voucher")}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="gap-2">
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {isSubmitting ? "Saving..." : "Save VP Voucher"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
