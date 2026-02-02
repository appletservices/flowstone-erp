import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSetPageHeader } from "@/hooks/usePageHeader";
import { toast } from "sonner";

const formSchema = z.object({
    date: z.string().min(1, "Date is required"),
    vpNo: z.string().min(1, "VP No is required"),
    account: z.string().min(1, "Account is required"),
    bank: z.string().min(1, "Bank is required"),
    amount: z.string().min(1, "Amount is required"),
    narration: z.string().optional(),
    book: z.string().min(1, "Book is required"),
    voucherNo: z.string().min(1, "Voucher No is required"),
});

type FormValues = z.infer<typeof formSchema>;

const vpNumbers = [
    { value: "vp-001", label: "VP-2401-001" },
    { value: "vp-002", label: "VP-2401-002" },
    { value: "vp-003", label: "VP-2401-003" },
    { value: "vp-004", label: "VP-2401-004" },
];

const banks = [
    { value: "hbl", label: "HBL" },
    { value: "ubl", label: "UBL" },
    { value: "mcb", label: "MCB" },
    { value: "alfalah", label: "Bank Alfalah" },
];

export default function VpVoucherForm() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useSetPageHeader("Create VP Voucher", "Add a new VP voucher");

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: new Date().toISOString().split("T")[0],
            vpNo: "",
            account: "",
            bank: "",
            amount: "",
            narration: "",
            book: "",
            voucherNo: `VPV-${Date.now().toString().slice(-6)}`,
        },
    });

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        try {
            console.log("VP Voucher Data:", data);
            toast.success("VP voucher created successfully");
            navigate("/finance/vp-voucher");
        } catch (error) {
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
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select VP No" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {vpNumbers.map((vp) => (
                                                    <SelectItem key={vp.value} value={vp.value}>
                                                        {vp.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="account"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Account</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter account" {...field} />
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
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select bank" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {banks.map((bank) => (
                                                    <SelectItem key={bank.value} value={bank.value}>
                                                        {bank.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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

                            <FormField
                                control={form.control}
                                name="book"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Book</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter book" {...field} />
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
                                            <Input {...field} readOnly className="bg-muted" />
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
                                <Save className="h-4 w-4" />
                                {isSubmitting ? "Saving..." : "Save VP Voucher"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
