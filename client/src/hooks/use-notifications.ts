import { useQuery } from "./use-simple";
import { listNotifications } from "@/api/notifications";

export function useNotificationsQuery() {
    return useQuery({
        queryKey: ["notifications"],
        queryFn: listNotifications,
    });
}
