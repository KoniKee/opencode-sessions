import { Box, Typography, Grid } from '@mui/material';
import { useProjects } from '../../hooks';
import { ProjectCard } from './ProjectCard';
import { Loading, EmptyState } from '../common';

export function ProjectList() {
  const { data: projects, isLoading, error } = useProjects();

  if (isLoading) {
    return <Loading message="加载项目列表..." />;
  }

  if (error) {
    return (
      <EmptyState
        title="加载失败"
        description="无法加载项目列表，请检查后端服务是否运行"
        action={{
          label: '重试',
          onClick: () => window.location.reload(),
        }}
      />
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <EmptyState
        title="暂无项目"
        description="在 OpenCode 中创建会话后，项目将显示在这里"
      />
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
        项目列表
      </Typography>
      <Grid container spacing={2}>
        {projects.map((project) => (
          <Grid item xs={12} sm={6} md={4} key={project.id}>
            <ProjectCard project={project} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
