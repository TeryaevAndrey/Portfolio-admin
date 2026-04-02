import { useState } from "react";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { CreateClientForm } from "./CreateClientForm";

export const CreateClientModal = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="accent">Добавить клиента</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавление клиента</DialogTitle>
        </DialogHeader>
        <CreateClientForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};
