import { useSetPageHeader } from "@/hooks/usePageHeader";
import {
  Wallet,
  Package,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { InventoryChart } from "@/components/dashboard/InventoryChart";

export default function Dashboard() {
  useSetPageHeader("Dashboard", "Welcome back! Here's your business overview.");
  return (
    <div className="space-y-6">

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value="24,85,000"
          change="+12.5% from last month"
          changeType="positive"
          icon={Wallet}
          iconColor="primary"
        />
        <StatCard
          title="Inventory Value"
          value="18,42,000"
          change="+3.2% from last month"
          changeType="positive"
          icon={Package}
          iconColor="secondary"
        />
        <StatCard
          title="Pending Payables"
          value="4,25,000"
          change="-8.3% from last month"
          changeType="negative"
          icon={TrendingUp}
          iconColor="warning"
        />
        <StatCard
          title="Active Vendors"
          value="24"
          change="2 new this month"
          changeType="neutral"
          icon={Users}
          iconColor="success"
        />
      </div>

      {/* Charts and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InventoryChart />
        </div>
        <div>
          <AlertsPanel />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactions />

        {/* Top Products */}
        <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Top Moving Products</h3>
            <button className="text-sm text-primary hover:underline">View All</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-medium">Premium Cotton Shirt</td>
                <td><span className="chip chip-primary">Finished</span></td>
                <td>245 pcs</td>
                <td>
                  <span className="flex items-center gap-1 text-success text-sm">
                    <ArrowUpRight className="w-4 h-4" />
                    +24%
                  </span>
                </td>
              </tr>
              <tr>
                <td className="font-medium">Silk Embroidery Design</td>
                <td><span className="chip chip-secondary">Design</span></td>
                <td>89 pcs</td>
                <td>
                  <span className="flex items-center gap-1 text-success text-sm">
                    <ArrowUpRight className="w-4 h-4" />
                    +18%
                  </span>
                </td>
              </tr>
              <tr>
                <td className="font-medium">Linen Fabric Roll</td>
                <td><span className="chip chip-warning">Raw</span></td>
                <td>520 m</td>
                <td>
                  <span className="flex items-center gap-1 text-destructive text-sm">
                    <ArrowDownRight className="w-4 h-4" />
                    -5%
                  </span>
                </td>
              </tr>
              <tr>
                <td className="font-medium">Wool Blend Coat</td>
                <td><span className="chip chip-primary">Finished</span></td>
                <td>67 pcs</td>
                <td>
                  <span className="flex items-center gap-1 text-success text-sm">
                    <ArrowUpRight className="w-4 h-4" />
                    +32%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
