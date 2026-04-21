import { Box, Typography, List, ListItem, ListItemButton, IconButton, Collapse, CircularProgress, Checkbox, Menu, MenuItem, Chip, Tooltip, Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FolderIcon from '@mui/icons-material/Folder';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { useState, useMemo } from 'react';
import { useSessions } from '../../hooks';
import { Loading, EmptyState } from '../common';
import { SubagentTag } from './SubagentTag';
import type { SessionTreeNode } from '../../types';

interface SessionListProps {
  projectId: string;
  selectedId?: string;
  onSelect: (session: SessionTreeNode) => void;
  isSelecting?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onRename?: (session: SessionTreeNode) => void;
  onDelete?: (session: SessionTreeNode) => void;
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return '刚刚';
}

function getDirectoryName(directory: string): string {
  const parts = directory.replace(/\\/g, '/').split('/');
  return parts[parts.length - 1] || directory;
}

function groupSessionsByDirectory(sessions: SessionTreeNode[]): Map<string, SessionTreeNode[]> {
  const groups = new Map<string, SessionTreeNode[]>();
  
  // 只收集根会话，子会话通过SessionListItem的children渲染
  sessions.forEach(session => {
    const dir = session.directory || 'unknown';
    if (!groups.has(dir)) {
      groups.set(dir, []);
    }
    groups.get(dir)!.push(session);
  });
  
  return groups;
}

export function SessionList({ 
  projectId, 
  selectedId, 
  onSelect,
  isSelecting = false,
  selectedIds = new Set(),
  onToggleSelect,
  onRename,
  onDelete,
}: SessionListProps) {
  const { data: sessions, isLoading, error } = useSessions(projectId);
  const isGlobal = projectId === 'global';

  // 识别孤儿会话：parent_id 不为空但父会话不存在
  // 必须在所有条件 return 之前调用 hooks
  const orphanSessionIds = useMemo(() => {
    if (!sessions) return new Set<string>();
    
    const allIds = new Set<string>();
    const orphans = new Set<string>();
    
    const collectIds = (list: SessionTreeNode[]) => {
      list.forEach(s => {
        allIds.add(s.id);
        if (s.children) collectIds(s.children);
      });
    };
    collectIds(sessions);
    
    const findOrphans = (list: SessionTreeNode[], depth: number) => {
      list.forEach(s => {
        if (depth === 0 && s.parent_id && !allIds.has(s.parent_id)) {
          orphans.add(s.id);
        }
        if (s.children) findOrphans(s.children, depth + 1);
      });
    };
    findOrphans(sessions, 0);
    
    return orphans;
  }, [sessions]);

  // global 项目按 directory 分组
  const directoryGroups = useMemo(() => {
    if (!isGlobal || !sessions) return null;
    return groupSessionsByDirectory(sessions);
  }, [isGlobal, sessions]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error" variant="body2">加载失败</Typography>
      </Box>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="text.secondary" variant="body2">暂无会话</Typography>
      </Box>
    );
  }

  const getAllSessionIds = (sessionList: SessionTreeNode[]): string[] => {
    const ids: string[] = [];
    const traverse = (s: SessionTreeNode) => {
      ids.push(s.id);
      if (s.children) s.children.forEach(traverse);
    };
    sessionList.forEach(traverse);
    return ids;
  };

  // global 项目：按目录分组显示
  if (isGlobal && directoryGroups) {
    const sortedDirectories = Array.from(directoryGroups.keys()).sort((a, b) => {
      const aTime = Math.max(...directoryGroups.get(a)!.map(s => s.time_updated));
      const bTime = Math.max(...directoryGroups.get(b)!.map(s => s.time_updated));
      return bTime - aTime;
    });

    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" color="text.secondary">
            会话 ({sessions.length})
          </Typography>
        </Box>
        <List dense sx={{ flex: 1, overflow: 'auto', py: 0 }}>
          {sortedDirectories.map((directory) => (
            <DirectoryGroup
              key={directory}
              directory={directory}
              sessions={directoryGroups.get(directory)!}
              selectedId={selectedId}
              onSelect={onSelect}
              isSelecting={isSelecting}
              selectedIds={selectedIds}
              onToggleSelect={onToggleSelect}
              onRename={onRename}
              onDelete={onDelete}
              orphanSessionIds={orphanSessionIds}
            />
          ))}
        </List>
      </Box>
    );
  }

  // 非 global 项目：原有逻辑
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2" color="text.secondary">
          会话 ({sessions.length})
        </Typography>
      </Box>
      <List dense sx={{ flex: 1, overflow: 'auto', py: 0 }}>
        {sessions.map((session) => (
          <SessionListItem
            key={session.id}
            session={session}
            selectedId={selectedId}
            onSelect={onSelect}
            depth={0}
            isSelecting={isSelecting}
            selectedIds={selectedIds}
            onToggleSelect={onToggleSelect}
            onRename={onRename}
            onDelete={onDelete}
            orphanSessionIds={orphanSessionIds}
          />
        ))}
      </List>
    </Box>
  );
}

interface DirectoryGroupProps {
  directory: string;
  sessions: SessionTreeNode[];
  selectedId?: string;
  onSelect: (session: SessionTreeNode) => void;
  isSelecting?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onRename?: (session: SessionTreeNode) => void;
  onDelete?: (session: SessionTreeNode) => void;
  orphanSessionIds?: Set<string>;
}

function DirectoryGroup({ 
  directory, 
  sessions, 
  selectedId, 
  onSelect,
  isSelecting = false,
  selectedIds = new Set(),
  onToggleSelect,
  onRename,
  onDelete,
  orphanSessionIds = new Set(),
}: DirectoryGroupProps) {
  const [expanded, setExpanded] = useState(true);
  const dirName = getDirectoryName(directory);

  // 计算所有会话数量（包括子会话）
  const totalCount = useMemo(() => {
    const count = (list: SessionTreeNode[]): number => 
      list.reduce((sum, s) => sum + 1 + (s.children ? count(s.children) : 0), 0);
    return count(sessions);
  }, [sessions]);

  return (
    <>
      <ListItem
        disablePadding
        onClick={() => setExpanded(!expanded)}
        sx={{ 
          bgcolor: 'grey.100',
          cursor: 'pointer',
          '&:hover': { bgcolor: 'grey.200' }
        }}
      >
        <ListItemButton dense sx={{ py: 0.75 }}>
          <IconButton size="small" sx={{ mr: 0.5, p: 0.25 }}>
            {expanded ? (
              <ExpandMoreIcon fontSize="small" />
            ) : (
              <ChevronRightIcon fontSize="small" />
            )}
          </IconButton>
          <FolderIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
            {dirName}
          </Typography>
          <Chip label={totalCount} size="small" variant="outlined" />
        </ListItemButton>
      </ListItem>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <List dense disablePadding>
          {sessions.map((session) => (
            <SessionListItem
              key={session.id}
              session={session}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={1}
              isSelecting={isSelecting}
              selectedIds={selectedIds}
              onToggleSelect={onToggleSelect}
              onRename={onRename}
              onDelete={onDelete}
              orphanSessionIds={orphanSessionIds}
            />
          ))}
        </List>
      </Collapse>
    </>
  );
}

interface SessionListItemProps {
  session: SessionTreeNode;
  selectedId?: string;
  onSelect: (session: SessionTreeNode) => void;
  depth: number;
  isSelecting?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onRename?: (session: SessionTreeNode) => void;
  onDelete?: (session: SessionTreeNode) => void;
  orphanSessionIds?: Set<string>;
}

function SessionListItem({ 
  session, 
  selectedId, 
  onSelect, 
  depth,
  isSelecting = false,
  selectedIds = new Set(),
  onToggleSelect,
  onRename,
  onDelete,
  orphanSessionIds = new Set(),
}: SessionListItemProps) {
  const [expanded, setExpanded] = useState(depth === 0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const hasChildren = session.children && session.children.length > 0;
  const isSelected = selectedId === session.id;
  const isChecked = selectedIds.has(session.id);
  const isOrphan = orphanSessionIds.has(session.id);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setAnchorEl(e.currentTarget as unknown as HTMLElement);
  };

  return (
    <>
      <ListItem
        disablePadding
        sx={{
          pl: depth * 2,
          bgcolor: isSelected ? 'primary.main' : 'transparent',
          '&:hover': { bgcolor: isSelected ? 'primary.dark' : 'action.hover' },
        }}
        onContextMenu={handleContextMenu}
      >
        <ListItemButton
          dense
          onClick={() => isSelecting && onToggleSelect ? onToggleSelect(session.id) : onSelect(session)}
          sx={{
            py: 0.5,
            color: isSelected ? 'white' : 'text.primary',
          }}
        >
          {isSelecting && (
            <Checkbox
              size="small"
              checked={isChecked}
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect?.(session.id);
              }}
              sx={{ 
                mr: 0.5, 
                p: 0.25,
                color: isSelected ? 'white' : 'primary.main',
                '&.Mui-checked': { color: isSelected ? 'white' : 'primary.main' }
              }}
            />
          )}
          {!isSelecting && hasChildren && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              sx={{ mr: 0.5, p: 0.25, color: isSelected ? 'white' : 'text.secondary' }}
            >
              {expanded ? (
                <ExpandMoreIcon fontSize="small" />
              ) : (
                <ChevronRightIcon fontSize="small" />
              )}
            </IconButton>
          )}
          {!isSelecting && !hasChildren && <Box sx={{ width: 24 }} />}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography
                variant="body2"
                noWrap
                fontWeight={isSelected ? 600 : 400}
                sx={{ fontSize: '0.85rem', flex: 1, minWidth: 0 }}
              >
                {session.title}
              </Typography>
              {isOrphan && (
                <Tooltip title="主会话已删除" arrow>
                  <LinkOffIcon sx={{ fontSize: '0.9rem', color: isSelected ? 'rgba(255,255,255,0.7)' : 'warning.main' }} />
                </Tooltip>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography
                variant="caption"
                sx={{ color: isSelected ? 'rgba(255,255,255,0.7)' : 'text.secondary', fontSize: '0.7rem' }}
              >
                {formatRelativeTime(session.time_updated)} · {session.message_count}条
              </Typography>
              {session.subagent_type && (
                <Box sx={{ 
                  '& .MuiChip-root': isSelected ? {
                    bgcolor: 'rgba(255,255,255,0.2) !important',
                    color: 'white !important',
                    border: '1px solid rgba(255,255,255,0.3) !important',
                  } : {}
                }}>
                  <SubagentTag type={session.subagent_type} size="small" />
                </Box>
              )}
            </Box>
          </Box>
        </ListItemButton>
      </ListItem>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          setAnchorEl(null);
          onRename?.(session);
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          重命名
        </MenuItem>
        <MenuItem onClick={() => {
          setAnchorEl(null);
          onDelete?.(session);
        }} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          删除
        </MenuItem>
      </Menu>
      
      {hasChildren && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          {session.children.map((child) => (
            <SessionListItem
              key={child.id}
              session={child}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
              isSelecting={isSelecting}
              selectedIds={selectedIds}
              onToggleSelect={onToggleSelect}
              onRename={onRename}
              onDelete={onDelete}
              orphanSessionIds={orphanSessionIds}
            />
          ))}
        </Collapse>
      )}
    </>
  );
}
