import { useState, useEffect } from "react";
import { Search, Filter, Shield, Activity, Users, Loader2 } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface DataItem {
  key: string;
  value: string;
}

interface SecurityLog {
  action: string;
  user: string;
  data: string; 
  last_activity_time: string;
  reference_no: string;
  table: string;
  tdate: string;
  feature: string;
}

const Security = () => {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [actionFilter, setActionFilter] = useState<string>("all");

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/system/useractivity/list`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();
        setLogs(result.data || []);
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const parseActivityData = (jsonString: string): DataItem[] => {
    try {
      const parsed = JSON.parse(jsonString);
      return Object.entries(parsed).map(([key, value]) => ({
        key: key.replace(/_/g, " ").toUpperCase(),
        value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      }));
    } catch (e) {
      return [{ key: "INFO", value: "Standard entry" }];
    }
  };

  // Filter Logic
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.reference_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.feature.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action.toLowerCase() === actionFilter.toLowerCase();
    return matchesSearch && matchesAction;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Restored your specific pagination button rendering logic
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <Button
            key={i}
            variant={currentPage === i ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(i)}
            className="w-8 h-8"
          >
            {i}
          </Button>
        );
      }
    } else {
      buttons.push(
        <Button key={1} variant={currentPage === 1 ? "default" : "outline"} size="sm" onClick={() => handlePageChange(1)} className="w-8 h-8">1</Button>
      );
      if (currentPage > 3) {
        buttons.push(<span key="ellipsis1" className="px-2 text-muted-foreground">...</span>);
      }
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        buttons.push(
          <Button key={i} variant={currentPage === i ? "default" : "outline"} size="sm" onClick={() => handlePageChange(i)} className="w-8 h-8">{i}</Button>
        );
      }
      if (currentPage < totalPages - 2) {
        buttons.push(<span key="ellipsis2" className="px-2 text-muted-foreground">...</span>);
      }
      buttons.push(
        <Button key={totalPages} variant={currentPage === totalPages ? "default" : "outline"} size="sm" onClick={() => handlePageChange(totalPages)} className="w-8 h-8">{totalPages}</Button>
      );
    }
    return buttons;
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Summary Cards */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Security Logs</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary" />
          <div><p className="text-sm text-muted-foreground">Total Logs</p><p className="text-2xl font-bold">{logs.length}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <Users className="h-5 w-5 text-blue-500" />
          <div><p className="text-sm text-muted-foreground">Unique Users</p><p className="text-2xl font-bold">{new Set(logs.map(l => l.user)).size}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <Activity className="h-5 w-5 text-green-500" />
          <div><p className="text-sm text-muted-foreground">Features</p><p className="text-2xl font-bold">{new Set(logs.map(l => l.feature)).size}</p></div>
        </CardContent></Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex flex-1 gap-2 w-full max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search logs..." 
                className="pl-10" 
                value={searchQuery} 
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} 
            />
          </div>
          <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Action" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Per page:</span>
          <Select value={itemsPerPage.toString()} onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}>
            <SelectTrigger className="w-[70px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Date & Time</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Feature</TableHead>
               <TableHead>Table</TableHead>
              <TableHead>Data Payload</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLogs.map((log, idx) => (
              <TableRow key={idx}>
                <TableCell className="text-xs">
                  <div>{log.tdate}</div>
                  <div className="text-muted-foreground font-mono">{log.last_activity_time.split(' ')[1]}</div>
                </TableCell>
                <TableCell className="font-medium text-xs">{log.reference_no}</TableCell>
                <TableCell className="text-sm">{log.user}</TableCell>
                <TableCell>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${log.action === 'create' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {log.action}
                  </span>
                </TableCell>
                <TableCell className="text-xs capitalize">{log.feature.replace(/-/g, ' ')}</TableCell>
                <TableCell className="font-medium text-xs">{log.table}</TableCell>
                <TableCell>
                  <div className="border rounded text-[10px] bg-muted/20">
                    <table className="w-full">
                      <tbody>
                        {parseActivityData(log.data).slice(0, 3).map((item, i) => (
                          <tr key={i} className="border-b last:border-0">
                            <td className="px-2 py-0.5 font-bold text-muted-foreground w-16">{item.key}</td>
                            <td className="px-2 py-0.5 truncate max-w-[150px]">{item.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        <p className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredLogs.length)} of {filteredLogs.length} entries
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {renderPaginationButtons()}
          </div>
          <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Security;