import { sql as pgSql } from "@vercel/postgres";

const s = pgSql;

// 初始化表
async function initDB() {
  await s`
    CREATE TABLE IF NOT EXISTS Admin (id SERIAL PRIMARY KEY, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS "User" (id SERIAL PRIMARY KEY, username TEXT UNIQUE NOT NULL, "displayName" TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', password TEXT NOT NULL, avatar TEXT NOT NULL DEFAULT '', "createdAt" TIMESTAMP DEFAULT NOW());
    CREATE TABLE IF NOT EXISTS Post (id SERIAL PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL DEFAULT '', excerpt TEXT NOT NULL DEFAULT '', published INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW());
    CREATE TABLE IF NOT EXISTS Resource (id SERIAL PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', category TEXT NOT NULL DEFAULT '', image TEXT NOT NULL DEFAULT '', "downloadLinks" TEXT NOT NULL DEFAULT '[]', downloads INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP DEFAULT NOW());
    CREATE TABLE IF NOT EXISTS Setting (key TEXT PRIMARY KEY, value TEXT NOT NULL DEFAULT '');
    CREATE TABLE IF NOT EXISTS Comment (id SERIAL PRIMARY KEY, "userId" INTEGER NOT NULL, "parentId" INTEGER DEFAULT NULL, "resourceId" INTEGER DEFAULT NULL, content TEXT NOT NULL, "createdAt" TIMESTAMP DEFAULT NOW());
    CREATE TABLE IF NOT EXISTS Favorite (id SERIAL PRIMARY KEY, "userId" INTEGER NOT NULL, "postId" INTEGER NOT NULL, "createdAt" TIMESTAMP DEFAULT NOW(), UNIQUE("userId", "postId"));
    CREATE TABLE IF NOT EXISTS Message (id SERIAL PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, content TEXT NOT NULL, "createdAt" TIMESTAMP DEFAULT NOW());
  `;
}

export interface AdminRow { id: number; username: string; password: string; }
export interface UserRow { id: number; username: string; displayName: string; email: string; password: string; avatar: string; createdAt: string; }
export interface PostRow { id: number; slug: string; title: string; content: string; excerpt: string; published: number; createdAt: string; updatedAt: string; }
export interface ResourceRow { id: number; name: string; description: string; category: string; image: string; downloadLinks: string; downloads: number; createdAt: string; }
export interface CommentRow { id: number; parentId: number | null; resourceId: number | null; content: string; createdAt: string; username: string; displayName: string; avatar: string; }

export const admin = {
  findUnique: async (where: { username: string }) => {
    await initDB();
    const r = await s`SELECT * FROM Admin WHERE username = ${where.username}`;
    return r.rows[0] as AdminRow | undefined;
  },
  create: async (data: { username: string; password: string }) => {
    await initDB();
    await s`INSERT INTO Admin (username, password) VALUES (${data.username}, ${data.password})`;
  },
};

export const user = {
  findUnique: async (where: { username?: string; id?: number }) => {
    await initDB();
    if (where.username) {
      const r = await s`SELECT * FROM "User" WHERE username = ${where.username}`;
      return r.rows[0] as UserRow | undefined;
    }
    if (where.id) {
      const r = await s`SELECT * FROM "User" WHERE id = ${where.id}`;
      return r.rows[0] as UserRow | undefined;
    }
    return undefined;
  },
  create: async (data: { username: string; displayName?: string; email?: string; password: string }) => {
    await initDB();
    await s`INSERT INTO "User" (username, "displayName", email, password) VALUES (${data.username}, ${data.displayName || ""}, ${data.email || ""}, ${data.password})`;
  },
  list: async () => {
    await initDB();
    const r = await s`SELECT id, username, "displayName", avatar, "createdAt" FROM "User" ORDER BY "createdAt" DESC`;
    return r.rows;
  },
  delete: async (id: number) => {
    await initDB();
    await s`DELETE FROM "User" WHERE id = ${id}`;
  },
  updateAvatar: async (username: string, avatar: string) => {
    await initDB();
    await s`UPDATE "User" SET avatar = ${avatar} WHERE username = ${username}`;
  },
};

export const post = {
  findMany: async (opts?: { where?: { published?: boolean } }) => {
    await initDB();
    let r;
    if (opts?.where?.published) {
      r = await s`SELECT * FROM Post WHERE published = 1 ORDER BY "createdAt" DESC`;
    } else {
      r = await s`SELECT * FROM Post ORDER BY "createdAt" DESC`;
    }
    return r.rows.map((p: any) => ({ ...p, published: !!p.published }));
  },
  findUnique: async (where: { slug?: string; id?: number }) => {
    await initDB();
    let r;
    if (where.slug) r = await s`SELECT * FROM Post WHERE slug = ${where.slug}`;
    else if (where.id) r = await s`SELECT * FROM Post WHERE id = ${where.id}`;
    else return null;
    if (!r.rows[0]) return null;
    return { ...r.rows[0] as any, published: !!(r.rows[0] as any).published };
  },
  create: async (data: { slug: string; title: string; content?: string; excerpt?: string; published?: boolean }) => {
    await initDB();
    const r = await s`INSERT INTO Post (slug, title, content, excerpt, published) VALUES (${data.slug}, ${data.title}, ${data.content || ""}, ${data.excerpt || ""}, ${data.published ? 1 : 0}) RETURNING id`;
    return post.findUnique({ id: r.rows[0].id });
  },
  update: async (id: number, data: Partial<{ slug: string; title: string; content: string; excerpt: string; published: boolean }>) => {
    await initDB();
    const parts: string[] = [];
    if (data.slug !== undefined) parts.push(`slug = '${data.slug.replace(/'/g, "''")}'`);
    if (data.title !== undefined) parts.push(`title = '${data.title.replace(/'/g, "''")}'`);
    if (data.content !== undefined) parts.push(`content = '${data.content.replace(/'/g, "''")}'`);
    if (data.excerpt !== undefined) parts.push(`excerpt = '${data.excerpt.replace(/'/g, "''")}'`);
    if (data.published !== undefined) parts.push(`published = ${data.published ? 1 : 0}`);
    parts.push(`"updatedAt" = NOW()`);
    await s.unsafe(`UPDATE Post SET ${parts.join(", ")} WHERE id = ${id}`);
    return post.findUnique({ id });
  },
  delete: async (id: number) => {
    await initDB();
    await s`DELETE FROM Post WHERE id = ${id}`;
  },
};

export const resource = {
  findMany: async () => {
    await initDB();
    const r = await s`SELECT * FROM Resource ORDER BY "createdAt" DESC`;
    return r.rows as ResourceRow[];
  },
  findUnique: async (where: { id: number }) => {
    await initDB();
    const r = await s`SELECT * FROM Resource WHERE id = ${where.id}`;
    return r.rows[0] as ResourceRow | undefined;
  },
  create: async (data: { name: string; description?: string; category?: string; image?: string; downloadLinks?: string }) => {
    await initDB();
    const r = await s`INSERT INTO Resource (name, description, category, image, "downloadLinks") VALUES (${data.name}, ${data.description || ""}, ${data.category || ""}, ${data.image || ""}, ${data.downloadLinks || "[]"}) RETURNING id`;
    return resource.findUnique({ id: r.rows[0].id });
  },
  update: async (id: number, data: Partial<{ name: string; description: string; category: string; image: string; downloadLinks: string }>) => {
    await initDB();
    const parts: string[] = [];
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) parts.push(`"${k}" = '${(v as string).replace(/'/g, "''")}'`);
    }
    if (parts.length > 0) await s.unsafe(`UPDATE Resource SET ${parts.join(", ")} WHERE id = ${id}`);
    return resource.findUnique({ id });
  },
  incrementDownloads: async (id: number) => {
    await initDB();
    await s`UPDATE Resource SET downloads = downloads + 1 WHERE id = ${id}`;
  },
  delete: async (id: number) => {
    await initDB();
    await s`DELETE FROM Resource WHERE id = ${id}`;
  },
};

export const comment = {
  list: async (resourceId?: number | null) => {
    await initDB();
    let q = `SELECT c.id, c."parentId", c."resourceId", c.content, c."createdAt",
              CASE WHEN c."userId" = 0 THEN 'admin' ELSE u.username END as username,
              CASE WHEN c."userId" = 0 THEN '管理员' ELSE u."displayName" END as "displayName",
              CASE WHEN c."userId" = 0 THEN '' ELSE u.avatar END as avatar
       FROM Comment c LEFT JOIN "User" u ON c."userId" = u.id`;
    if (resourceId === null) q += ` WHERE c."resourceId" IS NULL`;
    else if (resourceId !== undefined) q += ` WHERE c."resourceId" = ${resourceId}`;
    q += ` ORDER BY c."createdAt" ASC LIMIT 200`;
    const r = await s.unsafe(q);
    return r.rows as CommentRow[];
  },
  create: async (userId: number, content: string, parentId?: number | null, resourceId?: number | null) => {
    await initDB();
    await s`INSERT INTO Comment ("userId", content, "parentId", "resourceId") VALUES (${userId}, ${content}, ${parentId || null}, ${resourceId || null})`;
  },
  delete: async (id: number) => {
    await initDB();
    await s`DELETE FROM Comment WHERE id = ${id}`;
  },
};

export const favorite = {
  findByUser: async (userId: number) => {
    await initDB();
    const r = await s`SELECT p.id, p.slug, p.title, p.excerpt, p."createdAt", f."createdAt" as "favAt" FROM Favorite f JOIN Post p ON f."postId" = p.id WHERE f."userId" = ${userId} ORDER BY f."createdAt" DESC`;
    return r.rows;
  },
  add: async (userId: number, postId: number) => {
    await initDB();
    await s`INSERT INTO Favorite ("userId", "postId") VALUES (${userId}, ${postId}) ON CONFLICT DO NOTHING`;
  },
  remove: async (userId: number, postId: number) => {
    await initDB();
    await s`DELETE FROM Favorite WHERE "userId" = ${userId} AND "postId" = ${postId}`;
  },
};

export const setting = {
  get: async (key: string) => {
    await initDB();
    const r = await s`SELECT value FROM Setting WHERE key = ${key}`;
    return r.rows[0]?.value || "";
  },
  set: async (key: string, value: string) => {
    await initDB();
    await s`INSERT INTO Setting (key, value) VALUES (${key}, ${value}) ON CONFLICT (key) DO UPDATE SET value = ${value}`;
  },
};
