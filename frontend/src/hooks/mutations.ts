import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export function useCreatePort() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/ports', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ports'] }),
  });
}

export function useUpdatePort() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/ports/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ports'] }),
  });
}

export function useDeletePort() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/ports/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ports'] }),
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/agents', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agents'] }),
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/agents/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agents'] }),
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/agents/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agents'] }),
  });
}

export function useCreateProcedure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/procedures', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['procedures'] }),
  });
}

export function useUpdateProcedure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/procedures/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedures'] });
      queryClient.invalidateQueries({ queryKey: ['procedure'] });
    },
  });
}

export function useDeleteProcedure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/procedures/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['procedures'] }),
  });
}

export function useDuplicateProcedure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.post(`/procedures/${id}/duplicate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedures'] });
      queryClient.invalidateQueries({ queryKey: ['ports'] });
    },
  });
}

export function useUploadStepImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ stepId, formData }: { stepId: number; formData: FormData }) =>
      api.post(`/files/steps/${stepId}/images`, formData, {
        headers: { 'Content-Type': undefined },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedures'] });
      queryClient.invalidateQueries({ queryKey: ['procedure'] });
      queryClient.invalidateQueries({ queryKey: ['ports'] });
      queryClient.invalidateQueries({ queryKey: ['port'] });
    },
  });
}

export function useDeleteStepImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (imageId: number) => api.delete(`/files/images/${imageId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedures'] });
      queryClient.invalidateQueries({ queryKey: ['procedure'] });
    },
  });
}

export function useUpdateImageCaption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ imageId, caption }: { imageId: number; caption: string }) =>
      api.put(`/files/images/${imageId}`, { caption }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedures'] });
      queryClient.invalidateQueries({ queryKey: ['procedure'] });
    },
  });
}

// Work Types Mutations
export function useCreateWorkType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/work-types', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workTypes'] }),
  });
}

export function useUpdateWorkType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/work-types/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workTypes'] }),
  });
}

export function useDeleteWorkType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/work-types/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workTypes'] }),
  });
}

// Responsible Roles Mutations
export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/roles', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['procedureRoles'] });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/roles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['procedureRoles'] });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/roles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['procedureRoles'] });
    },
  });
}

