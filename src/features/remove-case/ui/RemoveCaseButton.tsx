import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/button";
import { Trash } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import { useRemoveCase } from "../model/useRemoveCase";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  caseId: number;
}

export const RemoveCaseButton = ({ className, caseId }: Props) => {
  const { mutate, isPending } = useRemoveCase();

  const handleClick = () => {
    mutate(caseId);
  };

  return (
    <Button
      className={cn(className)}
      variant="destructive"
      size="icon-sm"
      onClick={handleClick}
      disabled={isPending}
    >
      <Trash />
    </Button>
  );
};
