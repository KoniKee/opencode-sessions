export interface Project {
  id: string;
  worktree: string;
  vcs: string | null;
  name: string | null;
  icon_url: string | null;
  icon_color: string | null;
  time_created: number;
  time_updated: number;
  time_initialized: number | null;
  sandboxes: string;
  commands: string | null;
  session_count?: number;
  active_session_count?: number;
}

export interface ProjectStats {
  totalSessions: number;
  runningSessions: number;
  subagentSessions: number;
  lastActivity: number | null;
}
