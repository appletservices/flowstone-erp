import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { cn } from "@/lib/utils";
import { PageHeaderProvider } from "@/hooks/usePageHeader";

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  return (
    <PageHeaderProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar />
          <main
            className={cn(
              "flex-1 overflow-y-auto p-6 transition-all duration-300"
            )}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </PageHeaderProvider>
  );
}
