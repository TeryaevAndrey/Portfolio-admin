import type { ReactNode } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { useSidebar } from "@/shared/ui/sidebar";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
}

export const DashboardContent = ({ children }: Props) => {
  const { open } = useSidebar();
  return (
    <div
      className={cn("flex flex-col gap-6 w-full", {
        "lg:max-w-[calc(100%-256px)]": open,
      })}
    >
      <DashboardHeader />
      <div className="px-4 lg:px-6 flex flex-col gap-4 lg:gap-6 pb-10 grow">
        {children}
      </div>
    </div>
  );
};
