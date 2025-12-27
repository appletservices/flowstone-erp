import { useEffect, useState } from "react";
import {
  Truck,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Phone,
  MapPin,
  IndianRupee,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ContactFormDialog } from "@/components/contact/ContactFormDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

/* ---------------- TYPES ---------------- */

interface AccountType {
  account_code: string;
  name: string;
}

interface Vendor {
  id: number;
  name: string;
  phone: string;
  address: string;
  code: string;
  type: string;
  total_transactions: number;
  pending_amount: string;
  status: "active" | "inactive";
}

/* ---------------- COMPONENT ---------------- */

export default function ContactVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const token = localStorage.getItem("auth_token");

  /* ---------- LOAD ACCOUNT TYPES ---------- */
  useEffect(() => {
    if (!token) return;

    async function fetchAccountTypes() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/contacts/vendors/subaccount`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch account types");
        const data = await res.json();
        if (data.success) setAccountTypes(data.accounts);
      } catch (error) {
        console.error("Error fetching account types:", error);
      }
    }

    fetchAccountTypes();
  }, [user, token]);

  /* ---------- LOAD VENDORS LIST ---------- */
  useEffect(() => {
    if (!token) return;

    setLoading(true);

    async function fetchVendors() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/contacts/vendors/list`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch vendors");
        const data = await res.json();

        setVendors(data.data);
        setSummary(data.summary);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchVendors();
  }, [user, token]);

  const filteredVendors = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.phone.includes(searchQuery)
  );

  if (loading) return <div>Loading...</div>;

  /* ---------------- RENDER ---------------- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vendors</h1>
          <p className="text-muted-foreground">
            Manage vendor contacts and payables
          </p>
        </div>

        <ContactFormDialog
          trigger={
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Add Vendor
            </Button>
          }
          title="Add Vendor"
          accountTypes={accountTypes.map((a) => ({
            value: a.account_code,
            label: a.name,
          }))}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Vendors"
          value={summary?.total_contacts}
          icon={<Truck />}
        />
        {summary?.contacts_type_wise?.map((t: any) => (
          <SummaryCard
            key={t.type}
            title={t.type}
            value={t.total}
            icon={<Truck />}
          />
        ))}
        <SummaryCard
          title="Pending Payables"
          value={`₹${Number(summary?.total_payables).toLocaleString(
            "en-IN"
          )}`}
          icon={<IndianRupee />}
        />
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
          <Input
            placeholder="Search vendors..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" /> Filter
        </Button>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVendors.map((vendor) => (
          <div
            key={vendor.id}
            className="bg-card rounded-xl border p-5 hover:shadow"
          >
            {/* Header */}
            <div className="flex justify-between mb-4">
              <div className="flex gap-3">
                <Avatar>
                  <AvatarFallback>
                    {vendor.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{vendor.name}</h3>
                  <span className="chip chip-primary text-xs">{vendor.type}</span>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Profile</DropdownMenuItem>
                  <DropdownMenuItem>View Ledger</DropdownMenuItem>
                  <DropdownMenuItem>Issue Inventory</DropdownMenuItem>
                  <DropdownMenuItem>Receive Inventory</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Info */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <Phone className="w-4 h-4" /> {vendor.phone}
              </div>
              <div className="flex gap-2">
                <MapPin className="w-4 h-4" /> {vendor.address}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 mt-4 border-t">
              <div>
                <p className="text-xs">Transactions</p>
                <p className="font-semibold">{vendor.total_transactions}</p>
              </div>
              <div>
                <p
                  className={cn(
                    "font-semibold",
                    Number(vendor.pending_amount) < 0 && "text-warning"
                  )}
                >
                  ₹{Number(vendor.pending_amount).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- SMALL COMPONENT ---------------- */

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: any;
  icon: JSX.Element;
}) {
  return (
    <div className="bg-card rounded-xl border p-5">
      <div className="flex gap-3 items-center">
        <div className="p-3 bg-muted rounded-xl">{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}
