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
    voucherNo: z.string().min(1, "Voucher number is required"),
    accountType: z.string().min(1, "Account type is required"),
    contact: z.string().min(1, "Contact is required"),
    bank: z.string().min(1, "Bank is required"),
    amount: z.string().min(1, "Amount is required"),
    narration: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const accountTypes = [
    { value: "cash", label: "Cash" },
    { value: "bank", label: "Bank" },
    { value: "credit", label: "Credit" },
];

const contacts = [
    { value: "customer-a", label: "Customer A" },
    { value: "customer-b", label: "Customer B" },
    { value: "customer-c", label: "Customer C" },
    { value: "customer-d", label: "Customer D" },
];

const banks = [
    { value: "hbl", label: "HBL" },
    { value: "ubl", label: "UBL" },
    { value: "mcb", label: "MCB" },
    { value: "alfalah", label: "Bank Alfalah" },
];

export default function ReceiptVoucherForm() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useSetPageHeader("Create Receipt Voucher", "Add a new receipt voucher");

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: new Date().toISOString().split("T")[0],
            voucherNo: `RV-${Date.now().toString().slice(-6)}`,
            accountType: "",
            contact: "",
            bank: "",
            amount: "",
            narration: "",
        },
    });

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        try {
            console.log("Receipt Voucher Data:", data);
            toast.success("Receipt voucher created successfully");
            navigate("/finance/receipt-voucher");
        } catch (error) {
            toast.error("Failed to create receipt voucher");
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
                    onClick={() => navigate("/finance/receipt-voucher")}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-lg font-semibold">New Receipt Voucher</h2>
                    <p className="text-sm text-muted-foreground">Fill in the details below</p>
                </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                            <Input {...field} readOnly className="bg-muted" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="accountType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Account Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select account type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {accountTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
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
                                name="contact"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select contact" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {contacts.map((contact) => (
                                                    <SelectItem key={contact.value} value={contact.value}>
                                                        {contact.label}
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
                                onClick={() => navigate("/finance/receipt-voucher")}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="gap-2">
                                <Save className="h-4 w-4" />
                                {isSubmitting ? "Saving..." : "Save Voucher"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
