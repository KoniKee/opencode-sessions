import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import type { Project } from '../types';

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: api.projects.list,
    staleTime: 30000,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => api.projects.get(id),
    enabled: !!id,
  });
}
