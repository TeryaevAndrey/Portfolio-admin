import { SidebarProvider } from "@/shared/ui/sidebar";
import type { HTMLAttributes } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardContent } from "./DashboardContent";

interface Props extends HTMLAttributes<HTMLDivElement> {}

export const DashboardLayout = ({ children }: Props) => {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
};
