import { CaseCard, caseApi, caseQueries, type Case } from "@/entities/case";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GripVertical, Save } from "lucide-react";
import { type HTMLAttributes, useEffect, useState } from "react";

// ─── Sortable item wrapper ─────────────────────────────────────────────────────

interface SortableCardProps {
  item: Case;
}

const SortableCard = ({ item }: SortableCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Drag handle */}
      <button
        className={cn(
          "absolute top-2 left-2 z-10 p-1 rounded cursor-grab active:cursor-grabbing",
          "bg-background/80 backdrop-blur-sm border border-border opacity-0 group-hover:opacity-100 transition-opacity"
        )}
        {...attributes}
        {...listeners}
        title="Перетащить"
        type="button"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </button>

      <CaseCard data={item} />
    </div>
  );
};

// ─── CasesList ─────────────────────────────────────────────────────────────────

interface Props extends HTMLAttributes<HTMLDivElement> {
  list?: Case[];
}

export const CasesList = ({ className, list = [] }: Props) => {
  const queryClient = useQueryClient();

  const [items, setItems] = useState<Case[]>(list);
  const [isDirty, setIsDirty] = useState(false);

  // Keep in sync with incoming data (page change / refetch)
  useEffect(() => {
    setItems(list);
    setIsDirty(false);
  }, [list]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.id === active.id);
      const newIndex = prev.findIndex((i) => i.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
    setIsDirty(true);
  };

  const { mutate: saveOrder, isPending } = useMutation({
    mutationFn: () =>
      caseApi.reorderCases(
        items.map((item, index) => ({ id: item.id, sortOrder: index }))
      ),
    onSuccess: () => {
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: caseQueries.allKeys() });
    },
  });

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {isDirty && (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-primary/30 bg-primary/5">
          <span className="text-sm text-muted-foreground flex-1">
            Порядок изменён. Сохраните, чтобы применить на лендинге.
          </span>
          <Button
            size="sm"
            onClick={() => saveOrder()}
            disabled={isPending}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {isPending ? "Сохраняем..." : "Сохранить порядок"}
          </Button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
            {items.map((item) => (
              <SortableCard key={item.id} item={item} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

