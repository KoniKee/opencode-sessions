import { Router, Request, Response } from 'express';
import { getDbPath, reconnectDatabase } from '../services/db';
import fs from 'fs';
import path from 'path';

const router = Router();

// 获取数据库配置
router.get('/database', (req: Request, res: Response) => {
  const dbPath = getDbPath();
  const exists = fs.existsSync(dbPath);
  
  res.json({
    success: true,
    data: {
      path: dbPath,
      exists,
      connected: exists
    }
  });
});

// 更新数据库路径
router.put('/database', (req: Request, res: Response) => {
  const { path: newPath } = req.body;
  
  if (!newPath) {
    res.status(400).json({
      success: false,
      error: 'Path is required'
    });
    return;
  }
  
  const result = reconnectDatabase(newPath);
  
  res.json({
    success: result.success,
    message: result.message,
    data: {
      path: result.path
    }
  });
});

// 测试数据库路径
router.post('/database/test', (req: Request, res: Response) => {
  const { path: testPath } = req.body;
  
  if (!testPath) {
    res.status(400).json({
      success: false,
      error: 'Path is required'
    });
    return;
  }
  
  const exists = fs.existsSync(testPath);
  
  res.json({
    success: true,
    data: {
      path: testPath,
      exists,
      message: exists ? 'Database file found' : 'Database file not found'
    }
  });
});

export default router;
