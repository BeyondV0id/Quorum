import { useQuery } from "./use-simple";
import { searchUsers } from "@/api/users";

export function useMentionUsers(query: string) {
  return useQuery({
    queryKey: ["mention-users", query],
    queryFn: () => searchUsers(query),
    enabled: query.length > 0,
  });
}
