import { SidebarToggle } from "@/features/sidebar-toggle";
import { ThemeButton } from "@/features/theme-switcher";


export const DashboardHeader = () => {
  return (
    <header className="px-4 lg:px-6 py-4 border-b flex justify-between items-center gap-6 h-17.5 w-full">
      <SidebarToggle />
      <div className="flex justify-end items-center gap-2 w-full">
        <ThemeButton />
      </div>
    </header>
  );
};
