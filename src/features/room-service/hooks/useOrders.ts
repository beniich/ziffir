// src/features/room-service/hooks/useOrders.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OrderService, type CreateOrderPayload } from '../services/orderService';

const QUERY_KEYS = {
  all: ['orders'] as const,
  list: () => [...QUERY_KEYS.all, 'list'] as const,
};

export const useOrders = () => {
  return useQuery({
    queryKey: QUERY_KEYS.list(),
    queryFn: OrderService.getAll,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
};

export const useAdvanceOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => OrderService.advance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.list() });
    },
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => OrderService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.list() });
    },
  });
};
