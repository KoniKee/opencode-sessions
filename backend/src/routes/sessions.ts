import { Router, Request, Response } from 'express';
import { sessionService } from '../services/sessionService';

const router = Router();

/**
 * GET /api/sessions/project/:projectId
 * 获取项目下的所有会话（树形结构）
 */
router.get('/project/:projectId', (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const sessions = sessionService.getSessionsByProject(projectId);
    
    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('[Sessions] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sessions'
    });
  }
});

/**
 * GET /api/sessions/:id
 * 获取会话详情
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const session = sessionService.getSessionById(id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('[Sessions] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch session'
    });
  }
});

/**
 * GET /api/sessions/:id/messages
 * 获取会话的所有消息
 */
router.get('/:id/messages', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const messages = sessionService.getSessionMessages(id);
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('[Sessions] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    });
  }
});

/**
 * GET /api/sessions/:id/diff
 * 获取会话的代码差异
 */
router.get('/:id/diff', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const diff = sessionService.getSessionDiff(id);
    
    res.json({
      success: true,
      data: diff
    });
  } catch (error) {
    console.error('[Sessions] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch diff'
    });
  }
});

/**
 * GET /api/sessions/:id/children
 * 获取会话的子会话
 */
router.get('/:id/children', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const children = sessionService.getSessionChildren(id);
    
    res.json({
      success: true,
      data: children
    });
  } catch (error) {
    console.error('[Sessions] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch children'
    });
  }
});

/**
 * GET /api/sessions/:id/tree
 * 获取会话的完整树结构
 */
router.get('/:id/tree', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tree = sessionService.getSessionTree(id);
    
    if (!tree) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    res.json({
      success: true,
      data: tree
    });
  } catch (error) {
    console.error('[Sessions] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch session tree'
    });
  }
});

/**
 * GET /api/sessions/:id/stats
 * 获取会话统计信息
 */
router.get('/:id/stats', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const stats = sessionService.getSessionStats(id);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('[Sessions] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch session stats'
    });
  }
});

/**
 * PUT /api/sessions/:id
 * 更新会话标题（只读模式下会失败）
 */
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }
    
    const success = sessionService.updateSessionTitle(id, title);
    
    if (!success) {
      return res.status(403).json({
        success: false,
        error: 'Cannot update session (database is readonly)'
      });
    }
    
    res.json({
      success: true,
      message: 'Session updated'
    });
  } catch (error) {
    console.error('[Sessions] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update session'
    });
  }
});

/**
 * DELETE /api/sessions/:id
 * 删除会话（只读模式下会失败）
 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = sessionService.deleteSession(id);
    
    if (!success) {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete session (database is readonly)'
      });
    }
    
    res.json({
      success: true,
      message: 'Session deleted'
    });
  } catch (error) {
    console.error('[Sessions] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete session'
    });
  }
});

/**
 * POST /api/sessions/batch-delete
 * 批量删除会话
 */
router.post('/batch-delete', (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Ids array is required'
      });
    }
    
    const results: { id: string; success: boolean; error?: string }[] = [];
    
    for (const id of ids) {
      const success = sessionService.deleteSession(id);
      results.push({ id, success });
    }
    
    const failedCount = results.filter(r => !r.success).length;
    
    res.json({
      success: failedCount === 0,
      message: `Deleted ${results.filter(r => r.success).length} sessions${failedCount > 0 ? `, ${failedCount} failed` : ''}`,
      data: results
    });
  } catch (error) {
    console.error('[Sessions] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete sessions'
    });
  }
});

export default router;
