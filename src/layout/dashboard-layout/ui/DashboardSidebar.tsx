import { LogoutButton } from "@/features/auth/logout";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/ui/sidebar";
import { Text } from "@/shared/ui/text";
import { LayoutDashboard, ToolCase, Users } from "lucide-react";
import { Link } from "react-router-dom";

export const DashboardSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader className="h-17.5 flex justify-center px-4">
        <div className="flex justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <Text size="default" weight="bold">
                Admin Panel
              </Text>
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="mt-7">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard">
                    <LayoutDashboard />
                    <span>Дашборд</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/users">
                    <Users />
                    <span>Пользователи</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/cases">
                    <ToolCase />
                    <span>Кейсы</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t py-4 flex flex-col gap-3 px-4">
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  );
};
