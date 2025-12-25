import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Jan", raw: 4000, design: 2400, finished: 2400 },
  { name: "Feb", raw: 3000, design: 1398, finished: 2210 },
  { name: "Mar", raw: 2000, design: 9800, finished: 2290 },
  { name: "Apr", raw: 2780, design: 3908, finished: 2000 },
  { name: "May", raw: 1890, design: 4800, finished: 2181 },
  { name: "Jun", raw: 2390, design: 3800, finished: 2500 },
  { name: "Jul", raw: 3490, design: 4300, finished: 2100 },
];

export function InventoryChart() {
  return (
    <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="section-title">Inventory Movement</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Raw</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary" />
            <span className="text-muted-foreground">Design</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-muted-foreground">Finished</span>
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRaw" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(234, 89%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(234, 89%, 45%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorDesign" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(168, 76%, 36%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(168, 76%, 36%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorFinished" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 87%)" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(220, 9%, 46%)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(220, 9%, 46%)", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(220, 13%, 87%)",
                borderRadius: "8px",
                boxShadow: "0 4px 16px -4px rgba(0, 0, 0, 0.12)",
              }}
            />
            <Area
              type="monotone"
              dataKey="raw"
              stroke="hsl(234, 89%, 45%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRaw)"
            />
            <Area
              type="monotone"
              dataKey="design"
              stroke="hsl(168, 76%, 36%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorDesign)"
            />
            <Area
              type="monotone"
              dataKey="finished"
              stroke="hsl(38, 92%, 50%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorFinished)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
