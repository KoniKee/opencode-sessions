import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FolderIcon from '@mui/icons-material/Folder';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useState } from 'react';
import { useSession, useSessionMessages, useSessionDiff } from '../hooks';
import { Loading, EmptyState } from '../components/common';
import { SessionStatusBadge, SubagentTag } from '../components/SessionList';

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('zh-CN');
}

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

export function SessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [activeTab, setActiveTab] = useState(0);

  const { data: session, isLoading: sessionLoading } = useSession(sessionId || '');
  const { data: messages, isLoading: messagesLoading } = useSessionMessages(sessionId || '');
  const { data: diff, isLoading: diffLoading } = useSessionDiff(sessionId || '');

  if (!sessionId) {
    return (
      <Box>
        <Typography color="error">无效的会话ID</Typography>
        <Button component={Link} to="/" startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
          返回项目列表
        </Button>
      </Box>
    );
  }

  if (sessionLoading) {
    return <Loading message="加载会话详情..." />;
  }

  if (!session) {
    return (
      <EmptyState
        title="会话不存在"
        description="无法找到该会话"
        action={{
          label: '返回项目列表',
          onClick: () => window.location.href = '/',
        }}
      />
    );
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography
            component="span"
            variant="body2"
            sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
          >
            项目列表
          </Typography>
        </Link>
        <Typography variant="body2" color="text.primary">
          会话详情
        </Typography>
      </Breadcrumbs>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h5" fontWeight={600}>
                  {session.title}
                </Typography>
                <SessionStatusBadge status={session.status!} />
                <SubagentTag type={session.subagent_type} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <FolderIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                >
                  {session.directory}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    创建: {formatDate(session.time_created)}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  更新: {formatRelativeTime(session.time_updated)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {(session.summary_additions !== null || session.summary_deletions !== null) && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                代码变更统计
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {session.summary_additions !== null && (
                  <Chip
                    label={`+${session.summary_additions}`}
                    size="small"
                    sx={{ bgcolor: 'success.light', color: 'success.dark' }}
                  />
                )}
                {session.summary_deletions !== null && (
                  <Chip
                    label={`-${session.summary_deletions}`}
                    size="small"
                    sx={{ bgcolor: 'error.light', color: 'error.dark' }}
                  />
                )}
                {session.summary_files !== null && (
                  <Chip label={`${session.summary_files} 个文件`} size="small" variant="outlined" />
                )}
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={`消息 (${messages?.length || 0})`} />
          <Tab label={`代码差异 (${diff?.length || 0})`} />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {activeTab === 0 && (
            messagesLoading ? (
              <Loading message="加载消息..." />
            ) : messages && messages.length > 0 ? (
              <List>
                {messages.map((msg, idx) => {
                  let content;
                  try {
                    content = JSON.parse(msg.data);
                  } catch {
                    content = { role: 'unknown' };
                  }
                  return (
                    <ListItem key={msg.id} divider={idx < messages.length - 1}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={content.role || 'unknown'}
                              size="small"
                              color={content.role === 'user' ? 'primary' : content.role === 'assistant' ? 'secondary' : 'default'}
                            />
                            {content.agent && (
                              <Typography variant="caption" color="text.secondary">
                                @{content.agent}
                              </Typography>
                            )}
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            {formatDate(msg.time_created)}
                            {content.tokens && ` | ${content.tokens.total} tokens`}
                          </Typography>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            ) : (
              <EmptyState title="暂无消息" description="此会话还没有消息" />
            )
          )}

          {activeTab === 1 && (
            diffLoading ? (
              <Loading message="加载代码差异..." />
            ) : diff && diff.length > 0 ? (
              <Box>
                {diff.map((file, idx) => (
                  <Card key={idx} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', mb: 1 }}>
                        {file.file}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip
                          label={`+${file.additions}`}
                          size="small"
                          sx={{ bgcolor: 'success.light', color: 'success.dark' }}
                        />
                        <Chip
                          label={`-${file.deletions}`}
                          size="small"
                          sx={{ bgcolor: 'error.light', color: 'error.dark' }}
                        />
                        <Chip
                          label={file.status}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                      <Box
                        sx={{
                          bgcolor: 'grey.100',
                          p: 1,
                          borderRadius: 1,
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          whiteSpace: 'pre-wrap',
                          overflow: 'auto',
                          maxHeight: 200,
                        }}
                      >
                        {file.after || '(空)'}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <EmptyState title="暂无代码差异" description="此会话还没有代码变更" />
            )
          )}
        </Box>
      </Card>
    </Box>
  );
}
