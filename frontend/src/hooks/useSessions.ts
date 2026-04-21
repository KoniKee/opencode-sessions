import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { SessionTreeNode, Session, Message, DiffFile, SessionStats } from '../types';
import { SessionStatus } from '../types';

const IDLE_THRESHOLD = 30 * 1000;
const COMPLETED_THRESHOLD = 5 * 60 * 1000;

function determineStatus(session: Session | SessionTreeNode): SessionStatus {
  if (session.time_archived) {
    return SessionStatus.ARCHIVED;
  }
  const now = Date.now();
  const timeSinceUpdate = now - session.time_updated;
  if (timeSinceUpdate > COMPLETED_THRESHOLD) {
    return SessionStatus.COMPLETED;
  }
  if (timeSinceUpdate > IDLE_THRESHOLD) {
    return SessionStatus.IDLE;
  }
  return SessionStatus.RUNNING;
}

function enrichSession(session: Session | SessionTreeNode): Session | SessionTreeNode {
  return {
    ...session,
    status: determineStatus(session),
  };
}

function enrichSessionTree(nodes: SessionTreeNode[]): SessionTreeNode[] {
  return nodes.map((node) => ({
    ...enrichSession(node) as SessionTreeNode,
    children: enrichSessionTree(node.children),
  }));
}

export function useSessions(projectId: string) {
  return useQuery<SessionTreeNode[]>({
    queryKey: ['sessions', projectId],
    queryFn: async () => {
      const sessions = await api.sessions.list(projectId);
      return enrichSessionTree(sessions);
    },
    enabled: !!projectId,
    staleTime: 5000,
    refetchInterval: 10000,
  });
}

export function useSession(id: string) {
  return useQuery<Session>({
    queryKey: ['session', id],
    queryFn: async () => {
      const session = await api.sessions.get(id);
      return enrichSession(session) as Session;
    },
    enabled: !!id,
  });
}

export function useSessionMessages(id: string, options?: { refetchInterval?: number }) {
  return useQuery<Message[]>({
    queryKey: ['messages', id],
    queryFn: () => api.sessions.getMessages(id),
    enabled: !!id,
    staleTime: 5000,
    refetchInterval: options?.refetchInterval,
  });
}

export function useSessionDiff(id: string) {
  return useQuery<DiffFile[]>({
    queryKey: ['diff', id],
    queryFn: () => api.sessions.getDiff(id),
    enabled: !!id,
    staleTime: 60000,
  });
}

export function useSessionStats(id: string, options?: { refetchInterval?: number }) {
  return useQuery<SessionStats>({
    queryKey: ['sessionStats', id],
    queryFn: () => api.sessions.getStats(id),
    enabled: !!id,
    staleTime: 5000,
    refetchInterval: options?.refetchInterval,
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      api.sessions.update(id, title),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['session', id] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.sessions.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}
