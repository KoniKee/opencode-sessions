import { getDb } from './db';
import { Project } from '../types';

export class ProjectService {
  /**
   * 获取所有项目，包含会话统计信息
   */
  getProjects(): Project[] {
    const db = getDb();
    const sql = `
      SELECT 
        p.*,
        COUNT(s.id) as session_count,
        MAX(s.time_updated) as last_session_time
      FROM project p
      LEFT JOIN session s ON p.id = s.project_id
      GROUP BY p.id
      ORDER BY p.time_updated DESC
    `;
    
    const rows = db.prepare(sql).all() as Project[];
    return rows;
  }

  /**
   * 根据ID获取单个项目
   */
  getProjectById(id: string): Project | null {
    const db = getDb();
    const sql = `
      SELECT 
        p.*,
        COUNT(s.id) as session_count,
        MAX(s.time_updated) as last_session_time
      FROM project p
      LEFT JOIN session s ON p.id = s.project_id
      WHERE p.id = ?
      GROUP BY p.id
    `;
    
    const row = db.prepare(sql).get(id) as Project | undefined;
    return row || null;
  }

  /**
   * 获取项目数量
   */
  getProjectCount(): number {
    const db = getDb();
    const sql = 'SELECT COUNT(*) as count FROM project';
    const result = db.prepare(sql).get() as { count: number };
    return result.count;
  }

  /**
   * 搜索项目
   */
  searchProjects(query: string): Project[] {
    const db = getDb();
    const sql = `
      SELECT 
        p.*,
        COUNT(s.id) as session_count,
        MAX(s.time_updated) as last_session_time
      FROM project p
      LEFT JOIN session s ON p.id = s.project_id
      WHERE p.name LIKE ? OR p.worktree LIKE ?
      GROUP BY p.id
      ORDER BY p.time_updated DESC
    `;
    
    const searchPattern = `%${query}%`;
    const rows = db.prepare(sql).all(searchPattern, searchPattern) as Project[];
    return rows;
  }
}

export const projectService = new ProjectService();
