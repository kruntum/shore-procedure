import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Port, Agent, WorkType, Procedure, ResponsibleRole, User, Category, GovernmentAgency, JobWorkflow } from '../types';

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useGovernmentAgencies(active?: boolean) {
  return useQuery<GovernmentAgency[]>({
    queryKey: ['governmentAgencies', active],
    queryFn: async () => {
      const res = await api.get('/government-agencies', { params: { active } });
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePorts(q?: string) {
  return useQuery<Port[]>({
    queryKey: ['ports', q],
    queryFn: async () => {
      const res = await api.get('/ports', { params: { q } });
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePort(id?: number) {
  return useQuery<Port & { procedures: Procedure[] }>({
    queryKey: ['ports', id],
    queryFn: async () => {
      const res = await api.get(`/ports/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useAgents(q?: string) {
  return useQuery<Agent[]>({
    queryKey: ['agents', q],
    queryFn: async () => {
      const res = await api.get('/agents', { params: { q } });
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useWorkTypes() {
  return useQuery<WorkType[]>({
    queryKey: ['workTypes'],
    queryFn: async () => {
      const res = await api.get('/work-types');
      return res.data.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useProcedures(filters?: {
  categoryId?: number;
  portId?: number;
  agentId?: number;
  governmentAgencyId?: number;
  workTypeId?: number;
  search?: string;
}) {
  return useQuery<Procedure[]>({
    queryKey: ['procedures', filters],
    queryFn: async () => {
      const res = await api.get('/procedures', { params: filters });
      return res.data.data;
    },
  });
}

export function useProcedure(id?: number) {
  return useQuery<Procedure>({
    queryKey: ['procedure', id],
    queryFn: async () => {
      const res = await api.get(`/procedures/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useGlobalSearch(q: string) {
  return useQuery<{
    ports: Port[];
    agents: Agent[];
    procedures: Procedure[];
  }>({
    queryKey: ['globalSearch', q],
    queryFn: async () => {
      if (!q.trim()) return { ports: [], agents: [], procedures: [] };
      const res = await api.get('/search', { params: { q } });
      return res.data.data;
    },
    enabled: q.trim().length > 0,
  });
}

export function useProcedureRoles() {
  return useQuery<string[]>({
    queryKey: ['procedureRoles'],
    queryFn: async () => {
      const res = await api.get('/procedures/meta/roles');
      return Array.isArray(res.data.data) ? res.data.data : res.data.data?.roles || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useRoles() {
  return useQuery<ResponsibleRole[]>({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await api.get('/roles');
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data.data;
    },
  });
}

export function useWorkflows(params?: { categoryId?: number; search?: string; limit?: number }) {
  return useQuery<JobWorkflow[]>({
    queryKey: ['workflows', params],
    queryFn: async () => {
      const res = await api.get('/workflows', { params });
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useWorkflow(id?: number) {
  return useQuery<JobWorkflow>({
    queryKey: ['workflow', id],
    queryFn: async () => {
      const res = await api.get(`/workflows/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
}

