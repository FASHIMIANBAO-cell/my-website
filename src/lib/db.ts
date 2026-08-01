import { Pool } from "pg";

// 全局连接池
const _pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// 执行查询
async function q(text: string, params?: any[]) {
  return _pool.query(text, params);
}

let _inited = false;

// 初始化表（只执行一次）
async function initDB() {
  if (_inited) return;
  _inited = true;
  await q(`CREATE TABLE IF NOT EXISTS Admin (id SERIAL PRIMARY KEY, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL)`);
  await q(`CREATE TABLE IF NOT EXISTS "User" (id SERIAL PRIMARY KEY, username TEXT UNIQUE NOT NULL, "displayName" TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', password TEXT NOT NULL, avatar TEXT NOT NULL DEFAULT '', "createdAt" TIMESTAMP DEFAULT NOW())`);
  await q(`CREATE TABLE IF NOT EXISTS Post (id SERIAL PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL DEFAULT '', excerpt TEXT NOT NULL DEFAULT '', published INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW())`);
  await q(`CREATE TABLE IF NOT EXISTS Resource (id SERIAL PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', category TEXT NOT NULL DEFAULT '', image TEXT NOT NULL DEFAULT '', "downloadLinks" TEXT NOT NULL DEFAULT '[]', downloads INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP DEFAULT NOW())`);
  await q(`CREATE TABLE IF NOT EXISTS Setting (key TEXT PRIMARY KEY, value TEXT NOT NULL DEFAULT '')`);
  await q(`CREATE TABLE IF NOT EXISTS Comment (id SERIAL PRIMARY KEY, "userId" INTEGER NOT NULL, "parentId" INTEGER DEFAULT NULL, "resourceId" INTEGER DEFAULT NULL, content TEXT NOT NULL, "createdAt" TIMESTAMP DEFAULT NOW())`);
  await q(`CREATE TABLE IF NOT EXISTS Favorite (id SERIAL PRIMARY KEY, "userId" INTEGER NOT NULL, "postId" INTEGER NOT NULL, "createdAt" TIMESTAMP DEFAULT NOW(), UNIQUE("userId", "postId"))`);
  await q(`CREATE TABLE IF NOT EXISTS Message (id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, content TEXT NOT NULL, "createdAt" TIMESTAMP DEFAULT NOW())`);
}

export interface AdminRow { id: number; username: string; password: string; }
export interface UserRow { id: number; username: string; displayName: string; email: string; password: string; avatar: string; createdAt: string; }
export interface PostRow { id: number; slug: string; title: string; content: string; excerpt: string; published: number; createdAt: string; updatedAt: string; }
export interface ResourceRow { id: number; name: string; description: string; category: string; image: string; downloadLinks: string; downloads: number; createdAt: string; }
export interface CommentRow { id: number; parentId: number | null; resourceId: number | null; content: string; createdAt: string; username: string; displayName: string; avatar: string; }

export const admin = {
  findUnique: async (where: { username: string }) => {
    await initDB();
    const r = await q("SELECT * FROM Admin WHERE username = $1", [where.username]);
    return r.rows[0] as AdminRow | undefined;
  },
  create: async (data: { username: string; password: string }) => {
    await initDB();
    await q("INSERT INTO Admin (username, password) VALUES ($1, $2)", [data.username, data.password]);
  },
};

export const user = {
  findUnique: async (where: { username?: string; id?: number }) => {
    await initDB();
    if (where.username) {
      const r = await q(`SELECT * FROM "User" WHERE username = $1`, [where.username]);
      return r.rows[0] as UserRow | undefined;
    }
    if (where.id) {
      const r = await q(`SELECT * FROM "User" WHERE id = $1`, [where.id]);
      return r.rows[0] as UserRow | undefined;
    }
    return undefined;
  },
  create: async (data: { username: string; displayName?: string; email?: string; password: string }) => {
    await initDB();
    await q(`INSERT INTO "User" (username, "displayName", email, password) VALUES ($1, $2, $3, $4)`,
      [data.username, data.displayName || "", data.email || "", data.password]);
  },
  list: async () => {
    await initDB();
    const r = await q(`SELECT id, username, "displayName", avatar, "createdAt" FROM "User" ORDER BY "createdAt" DESC`);
    return r.rows;
  },
  delete: async (id: number) => {
    await initDB();
    await q(`DELETE FROM "User" WHERE id = $1`, [id]);
  },
  updateAvatar: async (username: string, avatar: string) => {
    await initDB();
    await q(`UPDATE "User" SET avatar = $1 WHERE username = $2`, [avatar, username]);
  },
};

export const post = {
  findMany: async (opts?: { where?: { published?: boolean } }) => {
    await initDB();
    if (opts?.where?.published) {
      const r = await q(`SELECT * FROM Post WHERE published = 1 ORDER BY "createdAt" DESC`);
      return r.rows.map((p: any) => ({ ...p, published: !!p.published }));
    }
    const r = await q(`SELECT * FROM Post ORDER BY "createdAt" DESC`);
    return r.rows.map((p: any) => ({ ...p, published: !!p.published }));
  },
  findUnique: async (where: { slug?: string; id?: number }) => {
    await initDB();
    let r;
    if (where.slug) r = await q("SELECT * FROM Post WHERE slug = $1", [where.slug]);
    else if (where.id) r = await q("SELECT * FROM Post WHERE id = $1", [where.id]);
    else return null;
    if (!r.rows[0]) return null;
    return { ...r.rows[0] as any, published: !!(r.rows[0] as any).published };
  },
  create: async (data: { slug: string; title: string; content?: string; excerpt?: string; published?: boolean }) => {
    await initDB();
    const r = await q("INSERT INTO Post (slug, title, content, excerpt, published) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [data.slug, data.title, data.content || "", data.excerpt || "", data.published ? 1 : 0]);
    return post.findUnique({ id: r.rows[0].id });
  },
  update: async (id: number, data: Partial<{ slug: string; title: string; content: string; excerpt: string; published: boolean }>) => {
    await initDB();
    await q(`UPDATE Post SET slug = $1, title = $2, content = $3, excerpt = $4, published = $5, "updatedAt" = NOW() WHERE id = $6`,
      [data.slug ?? '', data.title ?? '', data.content ?? '', data.excerpt ?? '', data.published ? 1 : 0, id]);
    return post.findUnique({ id });
  },
  delete: async (id: number) => {
    await initDB();
    await q("DELETE FROM Post WHERE id = $1", [id]);
  },
};

export const resource = {
  findMany: async () => {
    await initDB();
    const r = await q(`SELECT * FROM Resource ORDER BY "createdAt" DESC`);
    return r.rows as ResourceRow[];
  },
  findUnique: async (where: { id: number }) => {
    await initDB();
    const r = await q("SELECT * FROM Resource WHERE id = $1", [where.id]);
    return r.rows[0] as ResourceRow | undefined;
  },
  create: async (data: { name: string; description?: string; category?: string; image?: string; downloadLinks?: string }) => {
    await initDB();
    const r = await q(`INSERT INTO Resource (name, description, category, image, "downloadLinks") VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [data.name, data.description || "", data.category || "", data.image || "", data.downloadLinks || "[]"]);
    return resource.findUnique({ id: r.rows[0].id });
  },
  update: async (id: number, data: Partial<{ name: string; description: string; category: string; image: string; downloadLinks: string }>) => {
    await initDB();
    await q(`UPDATE Resource SET name = $1, description = $2, category = $3, image = $4, "downloadLinks" = $5 WHERE id = $6`,
      [data.name, data.description ?? '', data.category ?? '', data.image ?? '', data.downloadLinks ?? '[]', id]);
    return resource.findUnique({ id });
  },
  incrementDownloads: async (id: number) => {
    await initDB();
    await q("UPDATE Resource SET downloads = downloads + 1 WHERE id = $1", [id]);
  },
  delete: async (id: number) => {
    await initDB();
    await q("DELETE FROM Resource WHERE id = $1", [id]);
  },
};

export const comment = {
  list: async (resourceId?: number | null) => {
    await initDB();
    if (resourceId === null) {
      const r = await q(`SELECT c.id, c."parentId", c."resourceId", c.content, c."createdAt",
        CASE WHEN c."userId" = 0 THEN 'admin' ELSE u.username END as username,
        CASE WHEN c."userId" = 0 THEN '管理员' ELSE u."displayName" END as "displayName",
        CASE WHEN c."userId" = 0 THEN '' ELSE u.avatar END as avatar
        FROM Comment c LEFT JOIN "User" u ON c."userId" = u.id
        WHERE c."resourceId" IS NULL
        ORDER BY c."createdAt" ASC LIMIT 200`);
      return r.rows as CommentRow[];
    }
    if (resourceId !== undefined) {
      const r = await q(`SELECT c.id, c."parentId", c."resourceId", c.content, c."createdAt",
        CASE WHEN c."userId" = 0 THEN 'admin' ELSE u.username END as username,
        CASE WHEN c."userId" = 0 THEN '管理员' ELSE u."displayName" END as "displayName",
        CASE WHEN c."userId" = 0 THEN '' ELSE u.avatar END as avatar
        FROM Comment c LEFT JOIN "User" u ON c."userId" = u.id
        WHERE c."resourceId" = $1
        ORDER BY c."createdAt" ASC LIMIT 200`, [resourceId]);
      return r.rows as CommentRow[];
    }
    const r = await q(`SELECT c.id, c."parentId", c."resourceId", c.content, c."createdAt",
      CASE WHEN c."userId" = 0 THEN 'admin' ELSE u.username END as username,
      CASE WHEN c."userId" = 0 THEN '管理员' ELSE u."displayName" END as "displayName",
      CASE WHEN c."userId" = 0 THEN '' ELSE u.avatar END as avatar
      FROM Comment c LEFT JOIN "User" u ON c."userId" = u.id
      ORDER BY c."createdAt" ASC LIMIT 200`);
    return r.rows as CommentRow[];
  },
  create: async (userId: number, content: string, parentId?: number | null, resourceId?: number | null) => {
    await initDB();
    await q(`INSERT INTO Comment ("userId", content, "parentId", "resourceId") VALUES ($1, $2, $3, $4)`,
      [userId, content, parentId || null, resourceId || null]);
  },
  delete: async (id: number) => {
    await initDB();
    await q("DELETE FROM Comment WHERE id = $1", [id]);
  },
};

export const favorite = {
  findByUser: async (userId: number) => {
    await initDB();
    const r = await q(`SELECT p.id, p.slug, p.title, p.excerpt, p."createdAt", f."createdAt" as "favAt"
      FROM Favorite f JOIN Post p ON f."postId" = p.id
      WHERE f."userId" = $1 ORDER BY f."createdAt" DESC`, [userId]);
    return r.rows;
  },
  add: async (userId: number, postId: number) => {
    await initDB();
    await q(`INSERT INTO Favorite ("userId", "postId") VALUES ($1, $2) ON CONFLICT DO NOTHING`, [userId, postId]);
  },
  remove: async (userId: number, postId: number) => {
    await initDB();
    await q(`DELETE FROM Favorite WHERE "userId" = $1 AND "postId" = $2`, [userId, postId]);
  },
};

export const setting = {
  get: async (key: string) => {
    await initDB();
    const r = await q("SELECT value FROM Setting WHERE key = $1", [key]);
    return r.rows[0]?.value || "";
  },
  set: async (key: string, value: string) => {
    await initDB();
    await q("INSERT INTO Setting (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2", [key, value]);
  },
};
