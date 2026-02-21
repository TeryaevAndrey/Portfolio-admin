import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { CreateCaseForm } from "./CreateCaseForm";

export const CreateCaseModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="accent">Добавить кейс</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавление кейса</DialogTitle>
        </DialogHeader>

        <CreateCaseForm />
      </DialogContent>
    </Dialog>
  );
};
