import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Collapse,
  List,
  ListItem,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ChatIcon from '@mui/icons-material/Chat';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SessionStatusBadge } from './SessionStatusBadge';
import { SubagentTag } from './SubagentTag';
import type { SessionTreeNode } from '../../types';
import { SessionStatus } from '../../types';

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  return '刚刚';
}

interface SessionCardProps {
  session: SessionTreeNode;
  depth?: number;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function SessionCard({
  session,
  depth = 0,
  selected = false,
  onSelect,
  onEdit,
  onDelete,
}: SessionCardProps) {
  const [expanded, setExpanded] = useState(depth === 0);
  const hasChildren = session.children && session.children.length > 0;
  const status = session.status || SessionStatus.COMPLETED;

  return (
    <Box sx={{ mb: 1 }}>
      <Card
        sx={{
          ml: depth * 3,
          borderLeft: hasChildren ? 3 : 0,
          borderLeftColor: 'primary.main',
          cursor: 'pointer',
          bgcolor: selected ? 'action.selected' : 'background.paper',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: 2,
          },
        }}
      >
        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {hasChildren && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
              >
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography
                  variant="body2"
                  fontWeight={500}
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {session.title}
                </Typography>
                <SessionStatusBadge status={status} />
                <SubagentTag type={session.subagent_type} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  更新: {formatRelativeTime(session.time_updated)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  消息: {session.message_count}
                </Typography>
                {hasChildren && (
                  <Typography variant="caption" color="text.secondary">
                    子会话: {session.children.length}
                  </Typography>
                )}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="查看详情">
                <IconButton
                  size="small"
                  component={Link}
                  to={`/sessions/${session.id}`}
                >
                  <ChatIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {onEdit && (
                <Tooltip title="编辑标题">
                  <IconButton size="small" onClick={() => onEdit(session.id)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {onDelete && (
                <Tooltip title="删除">
                  <IconButton size="small" onClick={() => onDelete(session.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
      <Collapse in={expanded}>
        {hasChildren && (
          <List disablePadding>
            {session.children.map((child) => (
              <ListItem key={child.id} disablePadding>
                <SessionCard
                  session={child}
                  depth={depth + 1}
                  selected={selected}
                  onSelect={onSelect}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Collapse>
    </Box>
  );
}
