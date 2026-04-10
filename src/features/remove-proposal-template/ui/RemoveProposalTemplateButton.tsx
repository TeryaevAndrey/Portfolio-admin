import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  proposalTemplateApi,
  proposalTemplateQueries,
  type ProposalTemplate,
} from "@/entities/proposal-template";
import { Button } from "@/shared/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";

interface Props {
  template: ProposalTemplate;
}

export const RemoveProposalTemplateButton = ({ template }: Props) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => proposalTemplateApi.remove(template.id),
    onSuccess: () => {
      toast.success("Шаблон удалён");
      queryClient.invalidateQueries({
        queryKey: proposalTemplateQueries.listKeys(),
      });
      setOpen(false);
    },
    onError: () => {
      toast.error("Ошибка при удалении");
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="icon">
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить шаблон?</AlertDialogTitle>
          <AlertDialogDescription>
            Шаблон <strong>«{template.title}»</strong> будет удалён
            безвозвратно.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => mutate()}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Удаляем..." : "Удалить"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
