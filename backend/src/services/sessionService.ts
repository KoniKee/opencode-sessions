import { getDb } from './db';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { Session, SessionTreeNode, Message, Part, DiffFile } from '../types';

// 自适应获取差异文件存储路径
function getDiffStoragePath(): string {
  const homeDir = os.homedir();
  return path.join(homeDir, '.local', 'share', 'opencode', 'storage', 'session_diff');
}

const DIFF_STORAGE_PATH = process.env.DIFF_STORAGE_PATH || getDiffStoragePath();

export class SessionService {
  /**
   * 获取项目下的所有会话，构建树形结构
   */
  getSessionsByProject(projectId: string): SessionTreeNode[] {
    const db = getDb();
    const sql = `
      SELECT s.*, 
        (SELECT COUNT(*) FROM message m WHERE m.session_id = s.id) as message_count
      FROM session s
      WHERE s.project_id = ?
      ORDER BY s.time_updated DESC
    `;
    
    const sessions = db.prepare(sql).all(projectId) as (Session & { message_count: number })[];
    
    // 构建树形结构
    return this.buildSessionTree(sessions);
  }

  /**
   * 构建会话树形结构
   */
  private buildSessionTree(sessions: (Session & { message_count: number })[]): SessionTreeNode[] {
    const sessionMap = new Map<string, SessionTreeNode>();
    const rootSessions: SessionTreeNode[] = [];

    // 创建节点映射
    sessions.forEach(session => {
      const node: SessionTreeNode = {
        ...session,
        children: [],
        subagent_type: this.parseSubagentType(session.title),
        message_count: session.message_count
      };
      sessionMap.set(session.id, node);
    });

    // 构建树形结构
    sessions.forEach(session => {
      const node = sessionMap.get(session.id)!;
      if (session.parent_id) {
        const parent = sessionMap.get(session.parent_id);
        if (parent) {
          parent.children.push(node);
        } else {
          // 父会话不存在，作为根节点
          rootSessions.push(node);
        }
      } else {
        rootSessions.push(node);
      }
    });

    // 按时间排序子节点
    this.sortChildren(rootSessions);
    
    return rootSessions;
  }

  /**
   * 递归排序子节点
   */
  private sortChildren(nodes: SessionTreeNode[]): void {
    nodes.sort((a, b) => b.time_updated - a.time_updated);
    nodes.forEach(node => this.sortChildren(node.children));
  }

  /**
   * 从标题解析Subagent类型
   * 格式: (@xxx subagent)
   */
  private parseSubagentType(title: string): string | undefined {
    const match = title.match(/\(@([\w-]+)\s+subagent\)/);
    return match ? match[1] : undefined;
  }

  /**
   * 根据ID获取会话详情
   */
  getSessionById(id: string): Session | null {
    const db = getDb();
    const sql = 'SELECT * FROM session WHERE id = ?';
    const row = db.prepare(sql).get(id) as Session | undefined;
    return row || null;
  }

  /**
   * 获取会话的所有消息
   */
  getSessionMessages(sessionId: string): Message[] {
    const db = getDb();
    const sql = `
      SELECT * FROM message 
      WHERE session_id = ? 
      ORDER BY time_created ASC
    `;
    const messages = db.prepare(sql).all(sessionId) as Message[];
    
    messages.forEach(msg => {
      msg.parts = this.getMessageParts(msg.id);
    });
    
    return messages;
  }

  /**
   * 获取消息的部分内容
   */
  getMessageParts(messageId: string): Part[] {
    const db = getDb();
    const sql = `
      SELECT * FROM part 
      WHERE message_id = ? 
      ORDER BY time_created ASC
    `;
    return db.prepare(sql).all(messageId) as Part[];
  }

  /**
   * 获取会话的代码差异
   */
  getSessionDiff(sessionId: string): DiffFile[] {
    try {
      const diffFilePath = path.join(DIFF_STORAGE_PATH, `${sessionId}.json`);
      
      if (!fs.existsSync(diffFilePath)) {
        return [];
      }

      const content = fs.readFileSync(diffFilePath, 'utf-8');
      const diffData = JSON.parse(content);
      
      if (Array.isArray(diffData)) {
        return diffData;
      }
      
      return diffData.files || [];
    } catch (error) {
      console.error(`[SessionService] Error reading diff for session ${sessionId}:`, error);
      return [];
    }
  }

  /**
   * 获取会话的子会话
   */
  getSessionChildren(sessionId: string): Session[] {
    const db = getDb();
    const sql = `
      SELECT * FROM session 
      WHERE parent_id = ? 
      ORDER BY time_created ASC
    `;
    return db.prepare(sql).all(sessionId) as Session[];
  }

  /**
   * 获取会话的完整树（包含所有后代）
   */
  getSessionTree(sessionId: string): SessionTreeNode | null {
    const db = getDb();
    // 递归获取所有后代会话
    const sql = `
      WITH RECURSIVE session_tree AS (
        -- 基础查询：起始会话
        SELECT s.*, 
          (SELECT COUNT(*) FROM message m WHERE m.session_id = s.id) as message_count
        FROM session s
        WHERE s.id = ?
        
        UNION ALL
        
        -- 递归查询：所有子会话
        SELECT s.*, 
          (SELECT COUNT(*) FROM message m WHERE m.session_id = s.id) as message_count
        FROM session s
        INNER JOIN session_tree st ON s.parent_id = st.id
      )
      SELECT * FROM session_tree
    `;
    
    const sessions = db.prepare(sql).all(sessionId) as (Session & { message_count: number })[];
    
    if (sessions.length === 0) {
      return null;
    }

    // 构建树
    const tree = this.buildSessionTree(sessions);
    return tree.length > 0 ? tree[0] : null;
  }

  /**
   * 更新会话标题（注意：只读数据库，此操作会失败）
   */
  updateSessionTitle(id: string, title: string): boolean {
    const db = getDb();
    try {
      const sql = 'UPDATE session SET title = ?, time_updated = ? WHERE id = ?';
      const result = db.prepare(sql).run(title, Date.now(), id);
      return result.changes > 0;
    } catch (error) {
      console.error('[SessionService] Cannot update session in readonly mode:', error);
      return false;
    }
  }

  /**
   * 删除会话（注意：只读数据库，此操作会失败）
   */
  deleteSession(id: string): boolean {
    const db = getDb();
    try {
      const sql = 'DELETE FROM session WHERE id = ?';
      const result = db.prepare(sql).run(id);
      return result.changes > 0;
    } catch (error) {
      console.error('[SessionService] Cannot delete session in readonly mode:', error);
      return false;
    }
  }

  /**
   * 获取会话统计信息
   */
  getSessionStats(sessionId: string): {
    messageCount: number;
    partCount: number;
    childCount: number;
  } {
    const db = getDb();
    const messageCount = db.prepare(
      'SELECT COUNT(*) as count FROM message WHERE session_id = ?'
    ).get(sessionId) as { count: number };

    const partCount = db.prepare(
      'SELECT COUNT(*) as count FROM part WHERE session_id = ?'
    ).get(sessionId) as { count: number };

    const childCount = db.prepare(
      'SELECT COUNT(*) as count FROM session WHERE parent_id = ?'
    ).get(sessionId) as { count: number };

    return {
      messageCount: messageCount.count,
      partCount: partCount.count,
      childCount: childCount.count
    };
  }

  /**
   * 搜索会话
   */
  searchSessions(projectId: string, query: string): Session[] {
    const db = getDb();
    const sql = `
      SELECT * FROM session 
      WHERE project_id = ? AND (title LIKE ? OR slug LIKE ?)
      ORDER BY time_updated DESC
    `;
    const searchPattern = `%${query}%`;
    return db.prepare(sql).all(projectId, searchPattern, searchPattern) as Session[];
  }
}

export const sessionService = new SessionService();
