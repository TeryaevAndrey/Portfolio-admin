import { LogoutButton } from "@/features/auth/logout";
import { CallbacksUnreadBadge } from "@/widgets/callbacks-unread-badge";
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
import { BarChart2, BookOpen, Briefcase, Calculator, CheckSquare, ClipboardList, Contact, FileText, Files, Inbox, LayoutDashboard, MessageSquareQuote, PencilRuler, Timer, ToolCase, UserRoundSearch, Users, Landmark } from "lucide-react";
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
                  <Link to="/dashboard/clients">
                    <Contact />
                    <span>Клиенты</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

               <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/projects">
                    <PencilRuler />
                    <span>Проекты</span>
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

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/stats">
                    <BarChart2 />
                    <span>Статистика</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/reviews">
                    <MessageSquareQuote />
                    <span>Отзывы</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/blog">
                    <BookOpen />
                    <span>Блог</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/services">
                    <Briefcase />
                    <span>Услуги</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/proposal-templates">
                    <FileText />
                    <span>Шаблоны откликов</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/todos">
                    <CheckSquare />
                    <span>Таск-менеджер</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/pomodoro">
                    <Timer />
                    <span>Помодоро</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/calculator">
                    <Calculator />
                    <span>Калькулятор</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/leads">
                    <UserRoundSearch />
                    <span>Лиды</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/documents">
                    <Files />
                    <span>Документы</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/finance">
                    <Landmark />
                    <span>Финансы</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/callbacks">
                    <Inbox />
                    <span>Заявки</span>
                    <CallbacksUnreadBadge />
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/activity-log">
                    <ClipboardList />
                    <span>Журнал действий</span>
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
