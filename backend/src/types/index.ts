// 项目类型
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
  // 关联数据
  session_count?: number;
  last_session_time?: number;
}

// 会话类型
export interface Session {
  id: string;
  project_id: string;
  parent_id: string | null;
  slug: string;
  directory: string;
  title: string;
  version: string;
  share_url: string | null;
  summary_additions: number | null;
  summary_deletions: number | null;
  summary_files: number | null;
  summary_diffs: string | null;
  revert: string | null;
  permission: string | null;
  time_created: number;
  time_updated: number;
  time_compacting: number | null;
  time_archived: number | null;
  workspace_id: string | null;
}

// 会话树节点（包含子会话）
export interface SessionTreeNode extends Session {
  children: SessionTreeNode[];
  subagent_type?: string;
  message_count?: number;
}

// 消息类型
export interface Message {
  id: string;
  session_id: string;
  time_created: number;
  time_updated: number;
  data: string;
  parts?: Part[];
}

// 消息部分类型
export interface Part {
  id: string;
  message_id: string;
  session_id: string;
  time_created: number;
  time_updated: number;
  data: string;
}

// 待办事项类型
export interface Todo {
  session_id: string;
  content: string;
  status: string;
  priority: string;
  position: number;
  time_created: number;
  time_updated: number;
}

// 工作空间类型
export interface Workspace {
  id: string;
  type: string;
  name: string;
  branch: string | null;
  directory: string | null;
  extra: string | null;
  project_id: string;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 分页参数
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// 更新会话请求
export interface UpdateSessionRequest {
  title?: string;
}

// 代码差异
export interface DiffFile {
  file: string;
  patch: string;
  additions: number;
  deletions: number;
  status: string;
  after?: string;
}

// WebSocket消息类型
export interface WebSocketMessage {
  type: 'session_update' | 'session_delete' | 'project_update';
  payload: any;
  timestamp: number;
}
