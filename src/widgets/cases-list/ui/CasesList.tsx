import { CaseCard, type Case } from "@/entities/case";
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  list?: Case[];
}

export const CasesList = ({ className, list = [] }: Props) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6",
        className,
      )}
    >
      {list.map((item) => (
        <CaseCard key={item.id} data={item} />
      ))}
    </div>
  );
};
