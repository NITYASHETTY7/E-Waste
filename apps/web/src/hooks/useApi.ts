import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useListings() {
  return useQuery({
    queryKey: ['listings'],
    queryFn: async () => {
      const { data } = await api.get('/requirements');
      return data;
    },
    staleTime: 60 * 1000,
  });
}

export function useBids() {
  return useQuery({
    queryKey: ['bids'],
    queryFn: async () => {
      const { data } = await api.get('/auctions/bids');
      return data;
    },
    staleTime: 60 * 1000,
  });
}
