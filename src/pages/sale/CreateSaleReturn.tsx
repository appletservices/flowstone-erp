import { useState, useEffect } from "react";
import { useForm, useFieldArray, useWatch, Control } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash, Plus, Check, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const inventoryTypes = [
    { id: "inventory", name: "Raw Material" },
    { id: "finish", name: "Finish Goods" },
    { id: "design", name: "Design Material " },
];

const saleItemSchema = z.object({
    productId: z.string().min(1, "Product is required"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.coerce.number().min(0, "Price must be positive"),
    total: z.number().optional(),
    conversionTotal: z.number().optional(),
    finalTotal: z.number().optional(),
});

const createSaleSchema = z.object({
    supplierId: z.string().min(1, "Customer is required"),
    inventoryType: z.string().min(1, "Inventory Type is required"),
    date: z.date({ required_error: "Date is required" }),
    saleType: z.string().min(1, "Sale Type is required"),
    currency: z.string().optional().default("PKR"),
    conversionRate: z.coerce.number().optional().default(1),
    items: z.array(saleItemSchema).min(1, "At least one item is required"),
});

type CreateSaleFormValues = z.infer<typeof createSaleSchema>;

const SaleItemRow = ({
    index,
    control,
    remove,
    register,
    setValue,
    getValues,
    products,
    apiBaseUrl,
    token,
    saleType,
    conversionRate,
}: {
    index: number;
    control: Control<CreateSaleFormValues>;
    remove: (index: number) => void;
    register: any;
    setValue: any;
    getValues: any;
    products: any[];
    apiBaseUrl: string;
    token: string | null;
    saleType: string;
    conversionRate: number;
}) => {
    const [availableQty, setAvailableQty] = useState<string | null>(null);

    const quantity = useWatch({ control, name: `items.${index}.quantity` });
    const unitPrice = useWatch({ control, name: `items.${index}.unitPrice` });

    useEffect(() => {
        const qty = Number(quantity) || 0;
        const price = Number(unitPrice) || 0;
        const rate = conversionRate || 1;

        const total = qty * price;
        const convTotal = rate !== 0 ? (price / rate) * qty : 0;

        setValue(`items.${index}.total`, total);
        setValue(`items.${index}.finalTotal`, total); // Final total is same as total (no discount)
        setValue(`items.${index}.conversionTotal`, convTotal);

    }, [quantity, unitPrice, conversionRate, setValue, index]);

    const onProductChange = async (value: string) => {
        setValue(`items.${index}.productId`, value);
        if (!value || !apiBaseUrl || !token) return;

        try {
            const response = await fetch(`${apiBaseUrl}/inventory/get-inventory-item-qty/${value}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setAvailableQty(data.qty);
                }
            }
        } catch (error) {
            console.error("Error fetching item details:", error);
        }
    };

    const showConversionTotal = saleType === "export" || saleType === "vp";

    return (
        <div className="border rounded-md p-4 mb-4 relative bg-card shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <Label>Item</Label>
                    <Select
                        onValueChange={onProductChange}
                        defaultValue={getValues(`items.${index}.productId`)}
                        disabled={!products.length}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Product" />
                        </SelectTrigger>
                        <SelectContent>
                            {products.map((prod) => (
                                <SelectItem key={prod.id} value={String(prod.id)}>
                                    {prod.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input type="number" placeholder="0" {...register(`items.${index}.quantity`)} />
                    {availableQty !== null && (
                        <span className={cn(
                            "text-md block mt-1",
                            Number(quantity) > Number(availableQty) ? "text-destructive font-medium" : "text-success"
                        )}>
                            {Number(quantity) > Number(availableQty)
                                ? "Quantity Exceed"
                                : `Available Qty: ${availableQty}`}
                        </span>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>Unit Price</Label>
                    <Input type="number" placeholder="0.00" {...register(`items.${index}.unitPrice`)} />
                </div>

                {showConversionTotal && (
                    <div className="space-y-2">
                        <Label>Conversion Total</Label>
                        <Input
                            type="number"
                            readOnly
                            className="bg-muted"
                            {...register(`items.${index}.conversionTotal`)}
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <Label>Total</Label>
                    <Input type="number" readOnly className="bg-muted font-bold" {...register(`items.${index}.total`)} />
                </div>
            </div>

            <div className="absolute top-2 right-2 md:static md:flex md:items-end md:justify-end md:col-span-4 mt-2">
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => remove(index)}>
                    <Trash className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
};

export default function CreateSaleReturn() {
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("auth_token");
    const { id } = useParams();
    const navigate = useNavigate();
    const [vendors, setVendors] = useState<any[]>([]);
    const [inventoryItems, setInventoryItems] = useState<any[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoadingSale, setIsLoadingSale] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        setValue,
        getValues,
        watch,
        formState: { errors },
    } = useForm<CreateSaleFormValues>({
        resolver: zodResolver(createSaleSchema),
        defaultValues: {
            date: new Date(),
            currency: "PKR",
            conversionRate: 1,
            items: [{ productId: "", quantity: 1, unitPrice: 0 }],
        },
    });

    const inventoryType = watch("inventoryType");
    const supplierId = watch("supplierId");
    const saleType = watch("saleType");
    const conversionRate = watch("conversionRate") || 1;

    // Fetch Vendors
    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/contacts/vendors/all-dropdown`, {
                    headers: { "Authorization": `Bearer ${token}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    setVendors(data);
                }
            } catch (error) { console.error(error); }
        };
        fetchVendors();
    }, [API_BASE_URL, token]);

    // Fetch Inventory Items with type and supplierId
    useEffect(() => {
        const fetchInventoryItems = async () => {
            if (!inventoryType || !supplierId) {
                setInventoryItems([]);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/inventory/type/${inventoryType}/${supplierId}`, {
                    headers: { "Authorization": `Bearer ${token}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    setInventoryItems(data);
                }
            } catch (error) {
                console.error(error);
                setInventoryItems([]);
            }
        };

        fetchInventoryItems();
    }, [inventoryType, supplierId, API_BASE_URL, token]);

    // Fetch Sale Return Data for Edit Mode
    useEffect(() => {
        const fetchSaleReturnData = async () => {
            if (!id) {
                setIsEditMode(false);
                return;
            }

            setIsEditMode(true);
            setIsLoadingSale(true);

            try {
                const response = await fetch(`${API_BASE_URL}/sale/return/edit/${id}`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();

                    // Populate form with fetched data
                    setValue("supplierId", String(data.supplierId));
                    setValue("inventoryType", data.inventoryType);

                    // Parse date - API returns DD-MM-YYYY format
                    const dateParts = data.date.split('-');
                    if (dateParts.length === 3) {
                        const [day, month, year] = dateParts;
                        setValue("date", new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
                    } else {
                        setValue("date", new Date(data.date));
                    }

                    setValue("saleType", data.saleType);
                    setValue("currency", data.currency || "PKR");
                    setValue("conversionRate", parseFloat(data.conversionRate) || 1);

                    // Populate items
                    if (data.items && data.items.length > 0) {
                        const formattedItems = data.items.map((item: any) => {
                            const quantity = item.quantity ? parseFloat(item.quantity) : 1;
                            const total = parseFloat(item.total) || 0;

                            let unitPrice = item.unit_price ? parseFloat(item.unit_price) : 0;
                            if (!item.unit_price && quantity > 0) {
                                unitPrice = total / quantity;
                            }

                            return {
                                productId: String(item.product_id),
                                quantity: quantity,
                                unitPrice: unitPrice,
                                total: total,
                                finalTotal: parseFloat(item.final_total) || total,
                                conversionTotal: parseFloat(item.conversion_total) || 0,
                            };
                        });
                        setValue("items", formattedItems);
                    }

                    toast.success("Sale return data loaded successfully");
                } else {
                    toast.error("Failed to load sale return data");
                    navigate("/sales/return");
                }
            } catch (error) {
                console.error("Error fetching sale return data:", error);
                toast.error("Error loading sale return data");
                navigate("/sales/return");
            } finally {
                setIsLoadingSale(false);
            }
        };

        fetchSaleReturnData();
    }, [id, API_BASE_URL, token, setValue, navigate]);

    const { fields, append, remove } = useFieldArray({ control, name: "items" });

    const items = watch("items");
    const grandTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const showCurrencyFields = saleType === "export" || saleType === "vp";

    const onSubmit = async (data: CreateSaleFormValues) => {
        const payload = {
            ...data,
            items: data.items.map((item) => ({
                product_id: item.productId,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                total: item.total,
                conversion_total: item.conversionTotal,
            })),
            grand_total: grandTotal,
            date: format(data.date, "yyyy-MM-dd"),
        };

        // Add sale return ID for edit mode
        if (isEditMode && id) {
            (payload as any).id = id;
        }

        try {
            const endpoint = isEditMode
                ? `${API_BASE_URL}/sale/return/update`
                : `${API_BASE_URL}/sale/return/store`;

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (result.success) {
                if (isEditMode) {
                    toast.success("Sale Return Updated Successfully!");
                    navigate("/sales/return");
                } else {
                    const newId = result.id;
                    const webBaseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
                    window.open(`${webBaseUrl}/print/return/sale/${newId}`, "_blank");
                    toast.success("Sale Return Created Successfully!");
                }
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("An error occurred.");
        }
    };

    if (isLoadingSale) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-lg text-muted-foreground">Loading sale return data...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold mb-4">
                    {isEditMode ? "Edit Sale Return" : "Sale Return Details"}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Customer</Label>
                        <Select onValueChange={(val) => setValue("supplierId", val)} value={watch("supplierId")}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Customer" />
                            </SelectTrigger>
                            <SelectContent>
                                {vendors.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.supplierId && <span className="text-xs text-red-500">{errors.supplierId.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label>Inventory Type</Label>
                        <Select onValueChange={(val) => setValue("inventoryType", val)} value={watch("inventoryType")}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent>
                                {inventoryTypes.map((type) => (
                                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.inventoryType && <span className="text-xs text-red-500">{errors.inventoryType.message}</span>}
                    </div>

                    <div className="space-y-2 flex flex-col pt-0">
                        <Label className="mb-2">Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={cn("w-full text-left font-normal", !watch("date") && "text-muted-foreground")}>
                                    {watch("date") ? format(watch("date"), "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={watch("date")} onSelect={(date) => setValue("date", date as Date)} initialFocus />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label>Sale Type</Label>
                        <Select onValueChange={(val) => setValue("saleType", val)} value={watch("saleType")}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Sale Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="vp">VP</SelectItem>
                                <SelectItem value="local">Local</SelectItem>
                                <SelectItem value="export">Export</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {showCurrencyFields && (
                        <>
                            <div className="space-y-2">
                                <Label>Currency Type</Label>
                                <Select onValueChange={(val) => setValue("currency", val)} value={watch("currency")}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {["PKR", "SAR", "AED", "USD"].map(curr => <SelectItem key={curr} value={curr}>{curr}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Conversion Rate</Label>
                                <Input type="number" {...register("conversionRate")} />
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="bg-card rounded-xl border border-border">
                <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="font-semibold">Items</h3>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: "", quantity: 1, unitPrice: 0 })}>
                        <Plus className="h-4 w-4 mr-2" /> Add Item
                    </Button>
                </div>

                <div className="p-4 space-y-4">
                    {fields.map((field, index) => (
                        <SaleItemRow
                            key={field.id}
                            index={index}
                            control={control}
                            remove={remove}
                            register={register}
                            setValue={setValue}
                            getValues={getValues}
                            products={inventoryItems}
                            apiBaseUrl={API_BASE_URL}
                            token={token}
                            saleType={saleType}
                            conversionRate={conversionRate}
                        />
                    ))}
                </div>

                <div className="p-4 border-t bg-muted/20 flex flex-col items-end">
                    <div className="flex items-center gap-4 text-sm font-bold">
                        <span>Grand Total:</span>
                        <span className="text-xl text-primary">{grandTotal.toFixed(2)}</span>
                    </div>
                    <Button type="submit" className="mt-4">
                        <Check className="h-4 w-4 mr-2" />
                        {isEditMode ? "Update Sale Return" : "Submit Sale Return"}
                    </Button>
                </div>
            </div>
        </form>
    );
}