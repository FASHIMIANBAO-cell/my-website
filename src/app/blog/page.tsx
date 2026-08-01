import { post } from "@/lib/db";
import { BlogCard } from "@/components/blog-card";

export default async function BlogPage() {
  const posts = await post.findMany({
    where: { published: true },
  });

  return (
    <div className="px-4 py-24">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-light tracking-wider text-white/90 mb-12">
            文档
          </h1>
          <div className="grid gap-4">
            {posts.map((post) => (
              <BlogCard
                key={post.id}
                title={post.title}
                slug={post.slug}
                date={new Date(post.createdAt).toLocaleDateString("zh-CN")}
                excerpt={post.excerpt}
              />
            ))}
            {posts.length === 0 && (
              <p className="text-white/40 text-center py-20">还没有文章</p>
            )}
          </div>
        </div>
    </div>
  );
}
