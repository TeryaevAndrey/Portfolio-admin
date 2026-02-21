import { Button } from "@/shared/ui/button";
import { useLogout } from "../model/useLogout";

export const LogoutButton = () => {
  const { mutate, isPending } = useLogout();

  return (
    <Button variant="destructive" onClick={() => mutate()} disabled={isPending}>
      {!isPending ? "Выход" : "Загрузка..."}
    </Button>
  );
};
