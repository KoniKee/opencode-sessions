import { Router, Request, Response } from 'express';
import { projectService } from '../services/projectService';

const router = Router();

/**
 * GET /api/projects
 * 获取所有项目列表
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    
    let projects;
    if (search && typeof search === 'string') {
      projects = projectService.searchProjects(search);
    } else {
      projects = projectService.getProjects();
    }
    
    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('[Projects] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch projects'
    });
  }
});

/**
 * GET /api/projects/:id
 * 获取单个项目详情
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = projectService.getProjectById(id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('[Projects] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project'
    });
  }
});

/**
 * GET /api/projects/stats
 * 获取项目统计信息
 */
router.get('/stats/overview', (req: Request, res: Response) => {
  try {
    const count = projectService.getProjectCount();
    
    res.json({
      success: true,
      data: { totalProjects: count }
    });
  } catch (error) {
    console.error('[Projects] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch project stats'
    });
  }
});

export default router;
