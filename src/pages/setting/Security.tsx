import { useState } from "react";
import { Shield, Plus, Search, Filter, Loader2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useBackendSearch } from "@/hooks/useBackendSearch";
import { FilterDialog } from "@/components/filters/FilterDialog";

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    date: "",
    reference: "",
    user: "",
    action: "",
    feature: "",
    time: "",
  });

  const {
    data: securityLogs,
    isLoading,
    searchQuery,
    setSearchQuery,
    dateRange,
    keyValues,
    applyFilters,
    hasActiveFilters,
    refresh,
    pagination,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    nextPage,
    previousPage,
  } = useBackendSearch<SecurityLog>({
    endpoint: "/security/logs",
    pageSize: 10,
  });

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
    refresh();
  };

  const actionOptions = ["Login", "Logout", "Create", "Update", "Delete", "Export", "View"];
  const featureOptions = ["Authentication", "Inventory", "Vendors", "Users", "Reports", "Settings", "Sales", "Purchase"];

  if (isLoading && securityLogs.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Security Logs</h1>
          <p className="text-muted-foreground">Monitor and track all security-related activities</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Log
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card sm:max-w-[500px]">
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
                    <SelectContent className="bg-card">
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
                    <SelectContent className="bg-card">
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

      {/* Table with Search/Filter in Header */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">All Logs</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search logs..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            <Button
              variant="outline"
              size="sm"
              className={cn("gap-2", hasActiveFilters && "border-primary text-primary")}
              onClick={() => setFilterDialogOpen(true)}
            >
              <Filter className="w-4 h-4" />
              Filter
              {hasActiveFilters && <Badge variant="secondary" className="ml-1 h-5 px-1.5">Active</Badge>}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
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
              {securityLogs.length > 0 ? (
                securityLogs.map((log) => (
                  <TableRow key={log.id} className="animate-fade-in">
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
                      {log.data && log.data.length > 0 && (
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
                      )}
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

        {/* Pagination Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Showing {pagination.totalRecords > 0 ? ((currentPage - 1) * pageSize) + 1 : 0} to {Math.min(currentPage * pageSize, pagination.totalRecords)} of {pagination.totalRecords} results
            </p>
            <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card">
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="25">25 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
                <SelectItem value="100">100 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={previousPage} disabled={currentPage === 1}>
              Previous
            </Button>
            {Array.from({ length: Math.min(5, pagination.totalPages || 1) }, (_, i) => {
              let pageNum: number;
              const totalPages = pagination.totalPages || 1;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              if (pageNum < 1 || pageNum > totalPages) return null;
              return (
                <Button
                  key={pageNum}
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className={currentPage === pageNum ? "bg-primary text-primary-foreground" : ""}
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button variant="outline" size="sm" onClick={nextPage} disabled={currentPage === (pagination.totalPages || 1)}>
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Dialog */}
      <FilterDialog
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        onApply={applyFilters}
        showDateRange={true}
        filterFields={[
          { key: "action", label: "Action", placeholder: "e.g. Login, Create, Update" },
          { key: "feature", label: "Feature", placeholder: "e.g. Authentication, Inventory" },
          { key: "user", label: "User", placeholder: "e.g. admin@example.com" },
        ]}
        initialDateRange={dateRange}
        initialKeyValues={keyValues}
      />
    </div>
  );
};

export default Security;
