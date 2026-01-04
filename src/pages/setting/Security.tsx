import { useState } from "react";
import { Shield, Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataItem {
  key: string;
  value: string;
}

interface SecurityLog {
  id: number;
  date: string;
  reference: string;
  user: string;
  action: string;
  feature: string;
  time: string;
  data: DataItem[];
}

const Security = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const itemsPerPage = 10;

  // Sample security logs data
  const [securityLogs] = useState<SecurityLog[]>([
    {
      id: 1,
      date: "2024-01-15",
      reference: "SEC-001",
      user: "admin@example.com",
      action: "Login",
      feature: "Authentication",
      time: "09:30:45",
      data: [
        { key: "IP Address", value: "192.168.1.100" },
        { key: "Browser", value: "Chrome 120" },
        { key: "Device", value: "Desktop" },
      ],
    },
    {
      id: 2,
      date: "2024-01-15",
      reference: "SEC-002",
      user: "manager@example.com",
      action: "Update",
      feature: "Inventory",
      time: "10:15:22",
      data: [
        { key: "Item ID", value: "INV-2345" },
        { key: "Field Changed", value: "Quantity" },
        { key: "Old Value", value: "100" },
        { key: "New Value", value: "150" },
      ],
    },
    {
      id: 3,
      date: "2024-01-14",
      reference: "SEC-003",
      user: "user@example.com",
      action: "Delete",
      feature: "Vendors",
      time: "14:45:10",
      data: [
        { key: "Vendor ID", value: "VND-789" },
        { key: "Vendor Name", value: "ABC Supplies" },
      ],
    },
    {
      id: 4,
      date: "2024-01-14",
      reference: "SEC-004",
      user: "admin@example.com",
      action: "Create",
      feature: "Users",
      time: "16:20:33",
      data: [
        { key: "New User", value: "newuser@example.com" },
        { key: "Role", value: "Manager" },
        { key: "Department", value: "Sales" },
      ],
    },
    {
      id: 5,
      date: "2024-01-13",
      reference: "SEC-005",
      user: "manager@example.com",
      action: "Export",
      feature: "Reports",
      time: "11:05:17",
      data: [
        { key: "Report Type", value: "Sales Summary" },
        { key: "Format", value: "PDF" },
        { key: "Date Range", value: "Jan 1-13, 2024" },
      ],
    },
  ]);

  const [formData, setFormData] = useState({
    date: "",
    reference: "",
    user: "",
    action: "",
    feature: "",
    time: "",
  });

  const filteredLogs = securityLogs.filter(
    (log) =>
      log.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.feature.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setDialogOpen(false);
    setFormData({
      date: "",
      reference: "",
      user: "",
      action: "",
      feature: "",
      time: "",
    });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const actionOptions = ["Login", "Logout", "Create", "Update", "Delete", "Export", "View"];
  const featureOptions = ["Authentication", "Inventory", "Vendors", "Users", "Reports", "Settings", "Sales", "Purchase"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Security Logs</h1>
          <p className="text-muted-foreground">Monitor and track all security-related activities</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Log
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Security Log</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    step="1"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Reference</Label>
                <Input
                  id="reference"
                  placeholder="Enter reference code"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user">User</Label>
                <Input
                  id="user"
                  type="email"
                  placeholder="Enter user email"
                  value={formData.user}
                  onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="action">Action</Label>
                  <Select
                    value={formData.action}
                    onValueChange={(value) => setFormData({ ...formData, action: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      {actionOptions.map((action) => (
                        <SelectItem key={action} value={action}>
                          {action}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feature">Feature</Label>
                  <Select
                    value={formData.feature}
                    onValueChange={(value) => setFormData({ ...formData, feature: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select feature" />
                    </SelectTrigger>
                    <SelectContent>
                      {featureOptions.map((feature) => (
                        <SelectItem key={feature} value={feature}>
                          {feature}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Log</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Feature</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLogs.length > 0 ? (
              paginatedLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.date}</TableCell>
                  <TableCell className="font-medium">{log.reference}</TableCell>
                  <TableCell>{log.user}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      log.action === "Login" ? "bg-green-100 text-green-700" :
                      log.action === "Logout" ? "bg-gray-100 text-gray-700" :
                      log.action === "Create" ? "bg-blue-100 text-blue-700" :
                      log.action === "Update" ? "bg-yellow-100 text-yellow-700" :
                      log.action === "Delete" ? "bg-red-100 text-red-700" :
                      "bg-purple-100 text-purple-700"
                    }`}>
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell>{log.feature}</TableCell>
                  <TableCell>{log.time}</TableCell>
                  <TableCell>
                    <div className="border rounded-md overflow-hidden min-w-[180px]">
                      <table className="w-full text-xs">
                        <tbody>
                          {log.data.map((item, index) => (
                            <tr key={index} className={index % 2 === 0 ? "bg-muted/50" : "bg-background"}>
                              <td className="px-2 py-1 font-medium text-muted-foreground border-r">
                                {item.key}
                              </td>
                              <td className="px-2 py-1 text-foreground">
                                {item.value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No security logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {getPageNumbers().map((page, index) => (
            typeof page === 'number' ? (
              <Button
                key={index}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-8"
              >
                {page}
              </Button>
            ) : (
              <span key={index} className="px-2 text-muted-foreground">
                {page}
              </span>
            )
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Security;
