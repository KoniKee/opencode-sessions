import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import os from 'os';
import fs from 'fs';

// 自适应获取默认数据库路径
function getDefaultDbPath(): string {
  const homeDir = os.homedir();
  const platform = os.platform();
  
  if (platform === 'win32') {
    // Windows: C:\Users\{username}\.local\share\opencode\opencode.db
    return path.join(homeDir, '.local', 'share', 'opencode', 'opencode.db');
  } else {
    // Linux/Mac: ~/.local/share/opencode/opencode.db
    return path.join(homeDir, '.local', 'share', 'opencode', 'opencode.db');
  }
}

// 数据库路径（优先使用环境变量，否则使用默认路径）
const DB_PATH = process.env.DB_PATH || getDefaultDbPath();

// 检查数据库文件是否存在
function checkDatabase(): boolean {
  if (!fs.existsSync(DB_PATH)) {
    console.error(`[DB] Database file not found: ${DB_PATH}`);
    return false;
  }
  return true;
}

// 创建数据库连接
let db: DatabaseType | null = null;

function connectDatabase(): DatabaseType | null {
  if (!checkDatabase()) {
    return null;
  }
  
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  console.log(`[DB] Connected to database: ${DB_PATH}`);
  return db;
}

// 初始连接
connectDatabase();

// 获取当前数据库路径
export function getDbPath(): string {
  return DB_PATH;
}

// 重新连接数据库
export function reconnectDatabase(newPath?: string): { success: boolean; message: string; path: string } {
  const targetPath = newPath || DB_PATH;
  
  if (!fs.existsSync(targetPath)) {
    return { success: false, message: `Database file not found: ${targetPath}`, path: targetPath };
  }
  
  // 关闭旧连接
  if (db) {
    db.close();
  }
  
  try {
    db = new Database(targetPath);
    db.pragma('journal_mode = WAL');
    console.log(`[DB] Reconnected to database: ${targetPath}`);
    return { success: true, message: 'Connected successfully', path: targetPath };
  } catch (error) {
    return { success: false, message: `Connection failed: ${error}`, path: targetPath };
  }
}

// 获取数据库实例
export function getDb(): DatabaseType {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db;
}

// 优雅关闭
process.on('SIGINT', () => {
  if (db) db.close();
  console.log('[DB] Database connection closed');
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (db) db.close();
  console.log('[DB] Database connection closed');
  process.exit(0);
});

export default db;
