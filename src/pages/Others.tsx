import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Users,
  CalendarIcon,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// --- Types for Dynamic Data ---
interface ContactTypeWise {
  type_name: string;
  total: number;
}

interface Contact {
  id: number;
  name: string;
  code: string;
  opening_balance: string;
  opening_balance_type: string;
  type: string;
  balance: string;
}

interface ApiResponse {
  summary: {
    total_contacts: number;
    contacts_type_wise: ContactTypeWise[];
  };
  data: Contact[];
  recordsTotal: number;
}

const colorPalette = [
  "text-blue-600 bg-blue-500/10 border-blue-200",
  "text-emerald-600 bg-emerald-500/10 border-emerald-200",
  "text-purple-600 bg-purple-500/10 border-purple-200",
  "text-amber-600 bg-amber-500/10 border-amber-200",
];

export default function Others() {
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // --- Real API Fetch Implementation ---
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        // Using the real endpoint provided
          const token = localStorage.getItem("auth_token"); 
          const response = await fetch(`${import.meta.env.VITE_API_URL}/contacts/others/list`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`, 
            },
          });

          // const result = await response.json();

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const responseData: ApiResponse = await response.json();
        setApiData(responseData);
      } catch (error: any) {
        console.error("API Fetch Error:", error);
        toast.error(error.message || "Failed to load contacts from server");
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const typeStyleMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (apiData) {
      apiData.summary.contacts_type_wise.forEach((item, index) => {
        map[item.type_name] = colorPalette[index % colorPalette.length];
      });
    }
    return map;
  }, [apiData]);

  const filteredData = useMemo(() => {
    if (!apiData) return [];
    return apiData.data.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.includes(searchQuery) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [apiData, searchQuery]);

  if (loading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Fetching business contacts...</p>
        </div>
      </div>
    );
  }

  if (!apiData) return null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Other Contacts</h1>
          <p className="text-muted-foreground">Manage business contacts and accounts</p>
        </div>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4" /> Add Contact
        </Button>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-muted"><Users className="w-6 h-6" /></div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total</p>
              <p className="text-2xl font-bold">{apiData.summary.total_contacts}</p>
            </div>
          </div>
        </div>
        {apiData.summary.contacts_type_wise.map((item) => (
          <div key={item.type_name} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3">
              <div className={cn("p-3 rounded-xl", typeStyleMap[item.type_name])}>
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold leading-tight">{item.type_name}</p>
                <p className="text-2xl font-bold">{item.total}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between gap-4 flex-wrap">
          <h3 className="font-semibold">All Contacts</h3>
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, code, or type..." 
                className="pl-10 h-9" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2"><Filter className="w-4 h-4" /> Filter</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="p-4 text-[11px] font-bold uppercase text-muted-foreground">Type</th>
                <th className="p-4 text-[11px] font-bold uppercase text-muted-foreground">Account Code</th>
                <th className="p-4 text-[11px] font-bold uppercase text-muted-foreground">Name</th>
                <th className="p-4 text-[11px] font-bold uppercase text-muted-foreground">Opening Balance</th>
                <th className="p-4 text-[11px] font-bold uppercase text-muted-foreground text-right">Current Balance</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((contact) => (
                  <tr key={contact.id} className="border-b border-border hover:bg-muted/5 transition-colors">
                    <td className="p-4">
                      <span className={cn("text-[10px] px-2 py-0.5 rounded border font-bold uppercase whitespace-nowrap", typeStyleMap[contact.type])}>
                        {contact.type}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs text-muted-foreground">{contact.code}</td>
                    <td className="p-4 text-sm font-medium">{contact.name}</td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className={cn(
                          "font-medium",
                          contact.opening_balance_type.toLowerCase() === "credit" ? "text-emerald-500" : "text-amber-600"
                        )}>
                          {Number(contact.opening_balance).toLocaleString(undefined, { minimumFractionDigits: 2 }) }
                           
                           <span className="text-[10px] text-muted-foreground uppercase">
                           {(contact.opening_balance_type)=="Debit"? "Dr" : "Cr"}
                        </span>
                        </span>
                      </div>
                    </td>
                    <td className={cn(
                      "p-4 text-right text-sm font-bold", 
                      parseFloat(contact.balance) < 0 ? "text-rose-500" : "text-emerald-500"
                    )}>
                      {Math.abs(parseFloat(contact.balance)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Ledger</DropdownMenuItem>
                          <DropdownMenuItem>Edit Contact</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No contacts found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}