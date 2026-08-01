import Database from "better-sqlite3";
import path from "path";
import { mkdirSync } from "fs";

const dbDir = path.join(process.cwd(), "prisma");
mkdirSync(dbDir, { recursive: true });
const dbPath = path.join(dbDir, "dev.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

// 初始化数据库表
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS Admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS Post (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    excerpt TEXT NOT NULL DEFAULT '',
    published INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS Resource (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL DEFAULT '',
    downloadLinks TEXT NOT NULL DEFAULT '[]',
    downloads INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS User (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    displayName TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    password TEXT NOT NULL,
    avatar TEXT NOT NULL DEFAULT '',
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS Favorite (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    postId INTEGER NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(userId, postId)
  );

  CREATE TABLE IF NOT EXISTS Message (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    content TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS Setting (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS Comment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    parentId INTEGER DEFAULT NULL,
    resourceId INTEGER DEFAULT NULL,
    content TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// 兼容已有数据库：添加 avatar 列（忽略已存在的错误）
try { sqlite.exec("ALTER TABLE User ADD COLUMN avatar TEXT NOT NULL DEFAULT ''"); } catch {}
try { sqlite.exec("ALTER TABLE User ADD COLUMN displayName TEXT NOT NULL DEFAULT ''"); } catch {}
try { sqlite.exec("ALTER TABLE Comment ADD COLUMN parentId INTEGER DEFAULT NULL"); } catch {}
try { sqlite.exec("ALTER TABLE Comment ADD COLUMN resourceId INTEGER DEFAULT NULL"); } catch {}

// 类型定义
export interface Admin {
  id: number;
  username: string;
  password: string;
}

export interface Post {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: number;
  name: string;
  description: string;
  category: string;
  fileUrl: string;
  createdAt: string;
}

export interface Message {
  id: number;
  name: string;
  email: string;
  content: string;
  createdAt: string;
}

// Admin
export const admin = {
  findUnique: (where: { username: string }) => {
    return sqlite.prepare("SELECT * FROM Admin WHERE username = ?").get(where.username) as Admin | undefined;
  },
  create: (data: { username: string; password: string }) => {
    sqlite.prepare("INSERT INTO Admin (username, password) VALUES (?, ?)").run(data.username, data.password);
  },
};

// Post
export const post = {
  findMany: (opts?: { where?: { published?: boolean }; orderBy?: { createdAt: string } }) => {
    let query = "SELECT * FROM Post";
    const params: unknown[] = [];
    if (opts?.where?.published !== undefined) {
      query += " WHERE published = ?";
      params.push(opts.where.published ? 1 : 0);
    }
    query += " ORDER BY createdAt DESC";
    const rows = sqlite.prepare(query).all(...params) as Post[];
    return rows.map(formatPost);
  },
  findUnique: (where: { slug?: string; id?: number }) => {
    let query = "SELECT * FROM Post WHERE";
    const params: unknown[] = [];
    if (where.slug) { query += " slug = ?"; params.push(where.slug); }
    else if (where.id) { query += " id = ?"; params.push(where.id); }
    else return null;
    const row = sqlite.prepare(query).get(...params) as Post | undefined;
    return row ? formatPost(row) : null;
  },
  create: (data: { slug: string; title: string; content?: string; excerpt?: string; published?: boolean }) => {
    const result = sqlite.prepare(
      "INSERT INTO Post (slug, title, content, excerpt, published) VALUES (?, ?, ?, ?, ?)"
    ).run(data.slug, data.title, data.content || "", data.excerpt || "", data.published ? 1 : 0);
    return post.findUnique({ id: result.lastInsertRowid as number });
  },
  update: (where: { id: number }, data: Partial<{ slug: string; title: string; content: string; excerpt: string; published: boolean }>) => {
    const sets: string[] = [];
    const params: unknown[] = [];
    if (data.slug !== undefined) { sets.push("slug = ?"); params.push(data.slug); }
    if (data.title !== undefined) { sets.push("title = ?"); params.push(data.title); }
    if (data.content !== undefined) { sets.push("content = ?"); params.push(data.content); }
    if (data.excerpt !== undefined) { sets.push("excerpt = ?"); params.push(data.excerpt); }
    if (data.published !== undefined) { sets.push("published = ?"); params.push(data.published ? 1 : 0); }
    sets.push("updatedAt = datetime('now')");
    params.push(where.id);
    sqlite.prepare(`UPDATE Post SET ${sets.join(", ")} WHERE id = ?`).run(...params);
    return post.findUnique({ id: where.id });
  },
  delete: (where: { id: number }) => {
    sqlite.prepare("DELETE FROM Post WHERE id = ?").run(where.id);
  },
};

// Resource
export interface ResourceRow {
  id: number;
  name: string;
  description: string;
  category: string;
  image: string;
  downloadLinks: string;
  downloads: number;
  createdAt: string;
}

export const resource = {
  findMany: () => {
    return sqlite.prepare("SELECT * FROM Resource ORDER BY createdAt DESC").all() as ResourceRow[];
  },
  findUnique: (where: { id: number }) => {
    return sqlite.prepare("SELECT * FROM Resource WHERE id = ?").get(where.id) as ResourceRow | undefined;
  },
  create: (data: { name: string; description?: string; category?: string; image?: string; downloadLinks?: string }) => {
    const result = sqlite.prepare(
      "INSERT INTO Resource (name, description, category, image, downloadLinks) VALUES (?, ?, ?, ?, ?)"
    ).run(data.name, data.description || "", data.category || "", data.image || "", data.downloadLinks || "[]");
    return resource.findUnique({ id: result.lastInsertRowid as number });
  },
  update: (id: number, data: Partial<{ name: string; description: string; category: string; image: string; downloadLinks: string }>) => {
    const sets: string[] = [];
    const params: unknown[] = [];
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) { sets.push(`${k} = ?`); params.push(v); }
    }
    if (sets.length > 0) {
      params.push(id);
      sqlite.prepare(`UPDATE Resource SET ${sets.join(", ")} WHERE id = ?`).run(...params);
    }
    return resource.findUnique({ id });
  },
  incrementDownloads: (id: number) => {
    sqlite.prepare("UPDATE Resource SET downloads = downloads + 1 WHERE id = ?").run(id);
  },
  delete: (where: { id: number }) => {
    sqlite.prepare("DELETE FROM Resource WHERE id = ?").run(where.id);
  },
};

// Message
export const message = {
  findMany: () => {
    return sqlite.prepare("SELECT * FROM Message ORDER BY createdAt DESC").all() as Message[];
  },
  create: (data: { name: string; email: string; content: string }) => {
    sqlite.prepare("INSERT INTO Message (name, email, content) VALUES (?, ?, ?)").run(data.name, data.email, data.content);
  },
};

// User
export interface UserRow {
  id: number;
  username: string;
  displayName: string;
  email: string;
  password: string;
  avatar: string;
  createdAt: string;
}

export const user = {
  findUnique: (where: { username?: string; id?: number }) => {
    if (where.username) return sqlite.prepare("SELECT * FROM User WHERE username = ?").get(where.username) as UserRow | undefined;
    if (where.id) return sqlite.prepare("SELECT * FROM User WHERE id = ?").get(where.id) as UserRow | undefined;
    return undefined;
  },
  create: (data: { username: string; displayName?: string; email?: string; password: string }) => {
    sqlite.prepare("INSERT INTO User (username, displayName, email, password) VALUES (?, ?, ?, ?)").run(data.username, data.displayName || "", data.email || "", data.password);
  },
  list: () => {
    return sqlite.prepare("SELECT id, username, displayName, avatar, createdAt FROM User ORDER BY createdAt DESC").all() as Pick<UserRow, "id" | "username" | "displayName" | "avatar" | "createdAt">[];
  },
  delete: (id: number) => {
    sqlite.prepare("DELETE FROM User WHERE id = ?").run(id);
  },
  updateAvatar: (username: string, avatar: string) => {
    sqlite.prepare("UPDATE User SET avatar = ? WHERE username = ?").run(avatar, username);
  },
};

// Favorite
export interface FavoriteRow {
  postId: number;
  createdAt: string;
}

export const favorite = {
  findByUser: (userId: number) => {
    return sqlite.prepare(
      `SELECT p.id, p.slug, p.title, p.excerpt, p.createdAt, f.createdAt as favAt
       FROM Favorite f JOIN Post p ON f.postId = p.id
       WHERE f.userId = ? ORDER BY f.createdAt DESC`
    ).all(userId) as (Post & { favAt: string })[];
  },
  isFavorited: (userId: number, postId: number) => {
    const row = sqlite.prepare("SELECT id FROM Favorite WHERE userId = ? AND postId = ?").get(userId, postId);
    return !!row;
  },
  add: (userId: number, postId: number) => {
    sqlite.prepare("INSERT OR IGNORE INTO Favorite (userId, postId) VALUES (?, ?)").run(userId, postId);
  },
  remove: (userId: number, postId: number) => {
    sqlite.prepare("DELETE FROM Favorite WHERE userId = ? AND postId = ?").run(userId, postId);
  },
};

// Comment
export interface CommentRow {
  id: number;
  userId: number;
  parentId: number | null;
  resourceId: number | null;
  content: string;
  createdAt: string;
  username: string;
  displayName: string;
  avatar: string;
}

export const comment = {
  list: (resourceId?: number | null) => {
    let query = `SELECT c.id, c.parentId, c.resourceId, c.content, c.createdAt,
              CASE WHEN c.userId = 0 THEN 'admin' ELSE u.username END as username,
              CASE WHEN c.userId = 0 THEN '管理员' ELSE u.displayName END as displayName,
              CASE WHEN c.userId = 0 THEN '' ELSE u.avatar END as avatar
       FROM Comment c LEFT JOIN User u ON c.userId = u.id`;
    if (resourceId === null) {
      query += " WHERE c.resourceId IS NULL";
    } else if (resourceId !== undefined) {
      query += ` WHERE c.resourceId = ${resourceId}`;
    }
    query += " ORDER BY c.createdAt ASC LIMIT 200";
    return sqlite.prepare(query).all() as CommentRow[];
  },
  create: (userId: number, content: string, parentId?: number | null, resourceId?: number | null) => {
    sqlite.prepare("INSERT INTO Comment (userId, content, parentId, resourceId) VALUES (?, ?, ?, ?)").run(userId, content, parentId || null, resourceId || null);
  },
  delete: (id: number) => {
    sqlite.prepare("DELETE FROM Comment WHERE id = ?").run(id);
  },
};

// Settings
export const setting = {
  get: (key: string) => {
    const row = sqlite.prepare("SELECT value FROM Setting WHERE key = ?").get(key) as { value: string } | undefined;
    return row?.value || "";
  },
  set: (key: string, value: string) => {
    sqlite.prepare("INSERT OR REPLACE INTO Setting (key, value) VALUES (?, ?)").run(key, value);
  },
};

// 辅助函数
function formatPost(row: Post): Post {
  return { ...row, published: !!row.published };
}

export { sqlite as db };
