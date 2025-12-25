import { AlertTriangle, Package, Clock, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: "low-stock" | "pending" | "overdue";
  title: string;
  description: string;
  time: string;
}

const alerts: Alert[] = [
  {
    id: "1",
    type: "low-stock",
    title: "Low Stock: Cotton Fabric",
    description: "Only 50 meters remaining. Minimum level: 200 meters",
    time: "2 hours ago",
  },
  {
    id: "2",
    type: "pending",
    title: "Pending GRN Approval",
    description: "GRN #1234 from ABC Textiles awaiting verification",
    time: "4 hours ago",
  },
  {
    id: "3",
    type: "overdue",
    title: "Overdue Payment",
    description: "₹75,000 payment to XYZ Suppliers overdue by 5 days",
    time: "1 day ago",
  },
  {
    id: "4",
    type: "low-stock",
    title: "Low Stock: Silk Thread",
    description: "Only 20 spools remaining. Minimum level: 100 spools",
    time: "3 hours ago",
  },
];

const alertConfig = {
  "low-stock": {
    icon: Package,
    color: "text-warning",
    bg: "bg-warning/10",
  },
  pending: {
    icon: Clock,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  overdue: {
    icon: TrendingDown,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
};

export function AlertsPanel() {
  return (
    <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-warning" />
          Active Alerts
        </h3>
        <span className="chip chip-warning">{alerts.length} alerts</span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const config = alertConfig[alert.type];
          const Icon = config.icon;

          return (
            <div
              key={alert.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className={cn("p-2 rounded-lg", config.bg)}>
                <Icon className={cn("w-4 h-4", config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{alert.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {alert.description}
                </p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {alert.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
