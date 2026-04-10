import { useQuery } from "@tanstack/react-query";
import { callbackApi, callbackQueries } from "@/entities/callback";

export const CallbacksUnreadBadge = () => {
  const { data } = useQuery({
    queryKey: callbackQueries.unreadCountKeys(),
    queryFn: callbackApi.getUnreadCount,
    refetchInterval: 30_000,
  });

  const count = data?.count ?? 0;
  if (count === 0) return null;

  return (
    <span className="ml-auto text-[10px] font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
      {count > 99 ? "99+" : count}
    </span>
  );
};
