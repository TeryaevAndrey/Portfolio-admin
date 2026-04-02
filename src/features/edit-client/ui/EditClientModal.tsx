import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { EditClientForm } from "./EditClientForm";
import type { Client } from "@/entities/client";

interface Props {
  client: Client;
  trigger: React.ReactNode;
}

export const EditClientModal = ({ client, trigger }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактирование клиента</DialogTitle>
        </DialogHeader>
        <EditClientForm client={client} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};
