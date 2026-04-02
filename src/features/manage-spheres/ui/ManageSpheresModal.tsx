import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { sphereApi, sphereQueries } from "@/entities/sphere";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/shared/ui/field";
import { Pencil, Trash, Plus, Check, X } from "lucide-react";

const SphereLine = ({ id, name }: { id: number; name: string }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: () => sphereApi.update(id, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sphereQueries.listKeys() });
      setEditing(false);
      toast.success("Сфера обновлена");
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => sphereApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sphereQueries.listKeys() });
      toast.success("Сфера удалена");
    },
  });

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1"
          autoFocus
        />
        <Button
          size="icon-sm"
          variant="accent"
          onClick={() => updateMutation.mutate()}
          disabled={updateMutation.isPending}
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button size="icon-sm" variant="ghost" onClick={() => setEditing(false)}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <span className="flex-1 text-sm">{name}</span>
      <div className="flex gap-1">
        <Button size="icon-sm" variant="ghost" onClick={() => setEditing(true)}>
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button
          size="icon-sm"
          variant="destructive"
          onClick={() => removeMutation.mutate()}
          disabled={removeMutation.isPending}
        >
          <Trash className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};

export const ManageSpheresModal = () => {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const queryClient = useQueryClient();

  const { data: spheres } = useQuery(sphereQueries.list());

  const createMutation = useMutation({
    mutationFn: () => sphereApi.create(newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sphereQueries.listKeys() });
      setNewName("");
      toast.success("Сфера добавлена");
    },
    onError: () => toast.error("Сфера с таким названием уже существует"),
  });

  const handleCreate = () => {
    if (newName.trim()) createMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Управление сферами</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Сферы деятельности</DialogTitle>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <FieldLabel>Добавить новую сферу</FieldLabel>
            <div className="flex gap-2">
              <Input
                placeholder="Разработка сайтов"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <Button
                variant="accent"
                size="icon"
                onClick={handleCreate}
                disabled={createMutation.isPending || !newName.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </Field>

          <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
            {spheres?.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Сферы ещё не добавлены
              </p>
            )}
            {spheres?.map((sphere) => (
              <SphereLine key={sphere.id} id={sphere.id} name={sphere.name} />
            ))}
          </div>
        </FieldGroup>
      </DialogContent>
    </Dialog>
  );
};
