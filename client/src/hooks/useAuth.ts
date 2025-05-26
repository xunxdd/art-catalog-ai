import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    staleTime: Infinity, // Never refetch automatically
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: false, // Disable automatic fetching
  });

  return {
    user: error ? null : user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };
}