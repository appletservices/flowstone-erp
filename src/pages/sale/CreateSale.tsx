import { useState, useEffect } from "react";
import { useForm, useFieldArray, useWatch, Control } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash, Plus, Eye, EyeOff, Check, CalendarIcon } from "lucide-react";
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

// Define the schema for a single sale item
const saleItemSchema = z.object({
    productId: z.string().min(1, "Product is required"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.coerce.number().min(0, "Price must be positive"),
    itemCost: z.string().optional(), // Avg Cost (password field)
    total: z.number().optional(), // Calculated
    conversionTotal: z.number().optional(),
    discount: z.coerce.number().min(0).default(0),
    finalTotal: z.number().optional(), // Calculated
});

// Define the main form schema
const createSaleSchema = z.object({
    supplierId: z.string().min(1, "Customer is required"),
    inventoryType: z.string().min(1, "Inventory Type is required"),
    date: z.date({ required_error: "Date is required" }),
    charges: z.coerce.number().optional(),
    saleType: z.string().min(1, "Sale Type is required"),
    currency: z.string().optional().default("PKR"),
    conversionRate: z.coerce.number().optional().default(1),
    bookNumber: z.string().min(1, "Book Number is required"),
    voucherNumber: z.string().min(1, "Voucher Number is required"),
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
    const [showCost, setShowCost] = useState(false);
    const [availableQty, setAvailableQty] = useState<string | null>(null);

    const quantity = useWatch({ control, name: `items.${index}.quantity` });
    const unitPrice = useWatch({ control, name: `items.${index}.unitPrice` });
    const discount = useWatch({ control, name: `items.${index}.discount` });

    useEffect(() => {
        const qty = Number(quantity) || 0;
        const price = Number(unitPrice) || 0;
        const disc = Number(discount) || 0;
        const rate = conversionRate || 1;

        const total = qty * price;
        const finalTotal = Math.max(0, total - disc);

        // Calculate Conversion Total: (unit_price / conversionRate) * quantity
        // Guard against division by zero
        const convTotal = rate !== 0 ? (price / rate) * qty : 0;

        setValue(`items.${index}.total`, total);
        setValue(`items.${index}.finalTotal`, finalTotal);
        setValue(`items.${index}.conversionTotal`, convTotal);

    }, [quantity, unitPrice, discount, conversionRate, setValue, index]);

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
                // Response format: {"success":true,"qty":"-1774.92","cost":"211.27"}
                if (data.success) {
                    setAvailableQty(data.qty);
                    setValue(`items.${index}.itemCost`, data.cost);
                }
            } else {
                console.error("Failed to fetch item details");
            }
        } catch (error) {
            console.error("Error fetching item details:", error);
        }
    };

    const isExceeded = availableQty !== null && Number(quantity) > Number(availableQty);
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
                    <input type="hidden" {...register(`items.${index}.productId`)} />
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
                <div className="space-y-2">
                    <Label>Avg Cost</Label>
                    <div className="relative">
                        <Input
                            type={showCost ? "text" : "password"}
                            placeholder="············"
                            {...register(`items.${index}.itemCost`)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowCost(!showCost)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showCost ? (
                                <Eye className="h-4 w-4" />
                            ) : (
                                <EyeOff className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Conditional Conversion Total */}
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
                    <Input type="number" readOnly className="bg-muted" {...register(`items.${index}.total`)} />
                </div>

                <div className="space-y-2">
                    <Label>Discount</Label>
                    <Input type="number" placeholder="0.00" {...register(`items.${index}.discount`)} />
                </div>

                <div className="space-y-2">
                    <Label>Final Total</Label>
                    <Input type="number" readOnly className="bg-muted font-bold" {...register(`items.${index}.finalTotal`)} />
                </div>
            </div>

            <div className="absolute top-2 right-2 md:top-4 md:right-4 md:static md:flex md:items-end md:justify-end md:col-span-4 mt-2">
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90 hover:bg-destructive/10" onClick={() => remove(index)}>
                    <Trash className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
};

export default function CreateSale() {
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("auth_token");
    const { id } = useParams();
    const [vendors, setVendors] = useState<any[]>([]);
    const [inventoryItems, setInventoryItems] = useState<any[]>([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isLoadingSale, setIsLoadingSale] = useState(false);
    const navigate = useNavigate();

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
            items: [{ productId: "", quantity: 1, unitPrice: 0, discount: 0 }],
        },
    });

    const inventoryType = watch("inventoryType");
    const saleType = watch("saleType");
    const conversionRate = watch("conversionRate") || 1;

    // Fetch Vendors
    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/contacts/vendors/all-dropdown`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setVendors(data);
                } else {
                    console.error("Failed to fetch vendors");
                }
            } catch (error) {
                console.error("Error fetching vendors:", error);
            }
        };
        fetchVendors();
    }, [API_BASE_URL, token]);

    // Fetch Inventory Items when inventoryType changes
    useEffect(() => {
        const fetchInventoryItems = async () => {
            if (!inventoryType) {
                setInventoryItems([]);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/inventory/type/${inventoryType}`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setInventoryItems(data);
                } else {
                    console.error("Failed to fetch inventory items");
                    setInventoryItems([]);
                }
            } catch (error) {
                console.error("Error fetching inventory items:", error);
                setInventoryItems([]);
            }
        };

        fetchInventoryItems();
    }, [inventoryType, API_BASE_URL, token]);

    // Fetch Sale Data for Edit Mode
    useEffect(() => {
        const fetchSaleData = async () => {
            if (!id) {
                setIsEditMode(false);
                return;
            }

            setIsEditMode(true);
            setIsLoadingSale(true);

            try {
                const response = await fetch(`${API_BASE_URL}/sale/edit/${id}`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();

                    // Populate form with fetched data
                    // API returns camelCase for some fields
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

                    setValue("charges", data.charges || 0);
                    setValue("saleType", data.saleType);
                    setValue("currency", data.currency || "PKR");
                    setValue("conversionRate", parseFloat(data.conversionRate) || 1);
                    setValue("bookNumber", data.bookNumber);
                    setValue("voucherNumber", data.voucherNumber);

                    // Populate items
                    if (data.items && data.items.length > 0) {
                        const formattedItems = data.items.map((item: any) => {
                            // Calculate quantity and unit_price if missing
                            // If we have total and final_total, we can derive some values
                            const quantity = item.quantity ? parseFloat(item.quantity) : 1;
                            const total = parseFloat(item.total) || 0;
                            const discount = parseFloat(item.discount) || 0;
                            const finalTotal = parseFloat(item.final_total) || 0;

                            // Calculate unit price: (total + discount) / quantity
                            let unitPrice = item.unit_price ? parseFloat(item.unit_price) : 0;
                            if (!item.unit_price && quantity > 0) {
                                unitPrice = (total + discount) / quantity;
                            }

                            return {
                                productId: String(item.product_id),
                                quantity: quantity,
                                unitPrice: unitPrice,
                                discount: discount,
                                itemCost: item.item_cost,
                                total: total,
                                finalTotal: finalTotal,
                                conversionTotal: parseFloat(item.conversion_total) || 0,
                            };
                        });
                        setValue("items", formattedItems);
                    }

                    toast.success("Sale data loaded successfully");
                } else {
                    toast.error("Failed to load sale data");
                    navigate("/sales");
                }
            } catch (error) {
                console.error("Error fetching sale data:", error);
                toast.error("Error loading sale data");
                navigate("/sales");
            } finally {
                setIsLoadingSale(false);
            }
        };

        fetchSaleData();
    }, [id, API_BASE_URL, token, setValue, navigate]);


    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });

    const items = watch("items");
    const grandTotal = items.reduce((sum, item) => sum + (item.finalTotal || 0), 0);
    const showCurrencyFields = saleType === "export" || saleType === "vp";

    const onSubmit = async (data: CreateSaleFormValues) => {
        const payload = {
            ...data,
            items: data.items.map((item) => ({
                product_id: item.productId,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                discount: item.discount,
                total: item.total,
                final_total: item.finalTotal,
                item_cost: item.itemCost,
                conversion_total: item.conversionTotal,
            })),
            grand_total: grandTotal,
            date: format(data.date, "yyyy-MM-dd"),
        };

        // Add sale ID for edit mode
        if (isEditMode && id) {
            (payload as any).id = id;
        }

        try {
            const endpoint = isEditMode
                ? `${API_BASE_URL}/sale/update`
                : `${API_BASE_URL}/sale/store`;

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (result.success == true) {
                if (isEditMode) {
                    toast.success("Sale Updated Successfully!");
                    navigate("/sales");
                } else {
                    const newId = result.id;
                    const webBaseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
                    window.open(`${webBaseUrl}/print/sale/${newId}`, "_blank");
                    toast.success("Sale Created Successfully!");
                }
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("An error occurred during form submission.");
        }
    };

    if (isLoadingSale) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-lg text-muted-foreground">Loading sale data...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
                <h2 className="text-lg font-semibold mb-4">
                    {isEditMode ? "Edit Sale" : "Sale Details"}
                </h2>

                {/* Header Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                    {/* Customer */}
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

                    {/* Inventory Type */}
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

                    {/* Date */}
                    <div className="space-y-2 flex flex-col pt-0">
                        <Label className="mb-2">Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full text-left font-normal",
                                        !watch("date") && "text-muted-foreground"
                                    )}
                                >
                                    {watch("date") ? format(watch("date"), "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={watch("date")}
                                    onSelect={(date) => setValue("date", date as Date)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.date && <span className="text-xs text-red-500">{errors.date.message}</span>}
                    </div>

                    {/* Charges */}
                    <div className="space-y-2">
                        <Label>Charges</Label>
                        <Input type="number" placeholder="0" {...register("charges")} />
                    </div>

                    {/* Sale Type */}
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
                        {errors.saleType && <span className="text-xs text-red-500">{errors.saleType.message}</span>}
                    </div>

                    {/* Currency (Conditional) */}
                    {showCurrencyFields && (
                        <div className="space-y-2">
                            <Label>Currency Type</Label>
                            <Select onValueChange={(val) => setValue("currency", val)} value={watch("currency")}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PKR">PKR</SelectItem>
                                    <SelectItem value="SAR">SAR</SelectItem>
                                    <SelectItem value="AED">AED</SelectItem>
                                    <SelectItem value="USD">USD</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Conversion (Conditional) */}
                    {showCurrencyFields && (
                        <div className="space-y-2">
                            <Label>Conversion Rate</Label>
                            <Input type="number" placeholder="1.00" {...register("conversionRate")} />
                        </div>
                    )}

                    {/* Book No */}
                    <div className="space-y-2">
                        <Label>Book No</Label>
                        <Input placeholder="Book #" {...register("bookNumber")} />
                        {errors.bookNumber && <span className="text-xs text-red-500">{errors.bookNumber.message}</span>}
                    </div>

                    {/* Voucher No */}
                    <div className="space-y-2">
                        <Label>Voucher No</Label>
                        <Input placeholder="Voucher #" {...register("voucherNumber")} />
                        {errors.voucherNumber && <span className="text-xs text-red-500">{errors.voucherNumber.message}</span>}
                    </div>
                </div>
            </div>

            {/* Items Section */}
            <div className="bg-card rounded-xl border border-border">
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-semibold">Items</h3>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            append({ productId: "", quantity: 1, unitPrice: 0, discount: 0 })
                        }
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
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

                <div className="p-4 border-t border-border bg-muted/20">
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-4 text-sm mt-2">
                            <span className="font-bold">Grand Total:</span>
                            <span className="text-xl font-bold text-primary w-32 text-right">
                                {grandTotal ? grandTotal.toFixed(2) : "0.00"}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                            <Button type="submit" size="lg">
                                <Check className="h-4 w-4 mr-2" />
                                {isEditMode ? "Update Sale" : "Submit Sale"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
