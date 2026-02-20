import { useSetPageHeader } from "@/hooks/usePageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface ReportItem {
    name: string;
    description: string;
    path: string;
}

interface ReportCategory {
    title: string;
    reports: ReportItem[];
}

const reportCategories: ReportCategory[] = [
    {
        title: "Sales",
        reports: [
            { name: "Customer Sales Report", description: "This report displays all customer wise sales report", path: "/reports/customer-sales" },
            // { name: "Customer Wise Item Sales", description: "This report displays all customer wise item sales report", path: "/reports/customer-wise-item-sales" },
            // { name: "Item Wise Sales", description: "This report displays all item wise sales report", path: "/reports/item-wise-sales" },
            // { name: "Customer Ledger", description: "This report displays a listing of all transactions for selected customer, within a specified date range.", path: "/reports/customer-ledger" },
            // { name: "Sales By Sales Person", description: "This report helps you to know how much each sales person sales", path: "/reports/sales-by-person" },
            // { name: "Combined Customer-Supplier Ledger", description: "This report provides an insight into the transaction activities of the customers who are your suppliers as well", path: "/reports/combined-ledger" },
            // { name: "User Wise Sales", description: "This report helps you to know how much each user sales.", path: "/reports/user-wise-sales" },
            // { name: "Item Wise Customer Sales", description: "This report displays how much one item sales by customers", path: "/reports/item-wise-customer-sales" },
            // { name: "Comparison On Delivery Charges", description: "Provides insights into delivery charge comparisons, helping you make informed decisions.", path: "/reports/delivery-charges" },
            // { name: "Invoice Wise Profit Report", description: "Provides the profit information of every invoice.", path: "/reports/invoice-profit" },
            // { name: "Customer Aging Report", description: "This report displays date wise customer's dues.", path: "/reports/customer-aging" },
            // { name: "Item Wise Profit Report", description: "Provides the profit information of every items.", path: "/reports/item-profit" },
            // { name: "Invoice Update History", description: "Displays the history of all invoice updates for tracking and review.", path: "/reports/invoice-history" },
        ],
    },
    {
        title: "Accounting",
        reports: [
            { name: "Account Report", description: "Displays account wise .", path: "/account/report" },
            { name: "Trial Balance", description: "Displays the trial balance of all accounts.", path: "/reports/trial-balance" },
            { name: "Payment Report", description: "Shows the payment statement.", path: "/reports/payment" },
            { name: "Balance Sheet", description: "Displays the balance sheet of the organization.", path: "/reports/balance-sheet" },
        ],
    },
    {
        title: "Inventory",
        reports: [
            { name: "Stock Report", description: "Displays current stock levels for all items.", path: "/reports/stock" },
            { name: "Stock Movement Report", description: "Shows stock in and out movements over a period.", path: "/reports/stock-movement" },
        ],
    },
    {
        title: "Purchases",
        reports: [
            { name: "Purchase Report", description: "Displays all purchase transactions.", path: "/reports/purchase" },
            // { name: "Vendor Wise Purchase", description: "Shows purchase details grouped by vendor.", path: "/reports/vendor-wise-purchase" },
        ],
    },
    {
        title: "Karahi",
        reports: [
            { name: "Karahi Issue Report", description: "Displays all karahi material issue transactions.", path: "/reports/karahi/issue" },
            { name: "Karahi Receive Report", description: "Shows all karahi material receive transactions.", path: "/reports/karahi/receive" },
            { name: "Design Receive Report", description: "Shows all karahi material receive transactions.", path: "/reports/karahi/receive-design" },
        ],
    },
    {
        title: "Production",
        reports: [
            { name: "Production Issue Report", description: "Displays production material issue  details.", path: "/reports/production-material" },
            { name: "Production Receive Report", description: "Displays production material receive  details.", path: "/reports/production-ledger" },
            { name: "Production Collective Report", description: "Displays production material receive  details.", path: "/reports/production-ledger" },
        ],
    },
    {
        title: "Katae",
        reports: [
            { name: "Issue Report", description: "Displays all katae issue transactions.", path: "/reports/katae/issue" },
            { name: "Receive Report", description: "Shows all katae receive transactions.", path: "/reports/katae/receive" },
        ],
    },
    {
        title: "Contacts",
        reports: [
            { name: "Customer List", description: "Displays a list of all customers.", path: "/reports/customer-list" },
            { name: "Vendor List", description: "Displays a list of all vendors.", path: "/reports/vendor-list" },
        ],
    },
];

const Reports = () => {
    useSetPageHeader("All Reports", "Browse and access all available reports");
    const navigate = useNavigate();
    const [openCategories, setOpenCategories] = useState<string[]>(reportCategories.map((c) => c.title));

    const toggleCategory = (title: string) => {
        setOpenCategories((prev) =>
            prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
        );
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {reportCategories.map((category) => (
                    <Collapsible
                        key={category.title}
                        open={openCategories.includes(category.title)}
                        onOpenChange={() => toggleCategory(category.title)}
                    >
                        <Card>
                            <CollapsibleTrigger asChild>
                                <CardHeader className="cursor-pointer select-none flex flex-row items-center justify-between p-4">
                                    <CardTitle className="text-base">{category.title}</CardTitle>
                                    <ChevronDown
                                        className={`h-4 w-4 shrink-0 transition-transform duration-200 ${openCategories.includes(category.title) ? "rotate-180" : ""
                                            }`}
                                    />
                                </CardHeader>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <CardContent className="p-4 pt-0 space-y-2">
                                    {category.reports.map((report) => (
                                        <div
                                            key={report.name}
                                            onClick={() => navigate(report.path)}
                                            className="p-2 rounded-md hover:bg-accent cursor-pointer transition-colors border border-transparent hover:border-border"
                                        >
                                            <p className="text-sm font-medium text-foreground">{report.name}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{report.description}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </CollapsibleContent>
                        </Card>
                    </Collapsible>
                ))}
            </div>
        </div>
    );
};

export default Reports;
