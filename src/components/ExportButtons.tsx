import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { exportToExcel, exportToPDF, ExportColumn, formatCurrency, formatDate } from "@/lib/exportUtils";
import { toast } from "sonner";

export interface ExportConfig {
  filename: string;
  title: string;
  subtitle?: string;
  columns: ExportColumn[];
  data: Record<string, unknown>[];
  totals?: Record<string, string | number>;
  formatters?: Record<string, (value: unknown) => string>;
}

interface ExportButtonsProps {
  config: ExportConfig;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ExportButtons({ config, variant = "outline", size = "sm" }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (type: "excel" | "pdf") => {
    setIsExporting(true);
    try {
      // Apply formatters to data
      const formattedData = config.data.map((row) => {
        const formattedRow: Record<string, unknown> = { ...row };
        if (config.formatters) {
          Object.entries(config.formatters).forEach(([key, formatter]) => {
            if (row[key] !== undefined) {
              formattedRow[key] = formatter(row[key]);
            }
          });
        }
        return formattedRow;
      });

      const exportOptions = {
        ...config,
        data: formattedData,
      };

      if (type === "excel") {
        exportToExcel(exportOptions);
        toast.success("Excel file downloaded successfully");
      } else {
        exportToPDF(exportOptions);
        toast.success("PDF file downloaded successfully");
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2" disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card">
        <DropdownMenuItem onClick={() => handleExport("excel")} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="w-4 h-4 text-success" />
          Export to Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("pdf")} className="gap-2 cursor-pointer">
          <FileText className="w-4 h-4 text-destructive" />
          Export to PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Re-export utility functions for convenience
export { formatCurrency, formatDate };
