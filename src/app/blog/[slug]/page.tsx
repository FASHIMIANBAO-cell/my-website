import { notFound } from "next/navigation";
import Link from "next/link";
import { post } from "@/lib/db";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const postData = await post.findUnique({ slug });
  if (!postData) notFound();

  return (
    <div className="px-4 py-24">
        <article className="mx-auto max-w-2xl">
          <Link
            href="/blog"
            className="text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            ← 返回文章列表
          </Link>
          <p className="mt-8 text-sm text-white/40 font-light">
            {new Date(postData.createdAt).toLocaleDateString("zh-CN")}
          </p>
          <h1 className="mt-2 text-3xl font-light tracking-wider text-white/90">
            {postData.title}
          </h1>
          <div className="mt-10 text-white/65 leading-loose space-y-4">
            {postData.content.split("\n").map((line, i) => {
              if (line.startsWith("## ")) {
                return (
                  <h2
                    key={i}
                    className="text-xl font-light text-white/80 mt-10 mb-4"
                  >
                    {line.replace("## ", "")}
                  </h2>
                );
              }
              if (line.startsWith("- **")) {
                const match = line.match(/- \*\*(.+?)\*\*[:：](.+)/);
                if (match) {
                  return (
                    <li key={i} className="ml-4 text-white/60">
                      <span className="text-white/80">{match[1]}</span>：
                      {match[2]}
                    </li>
                  );
                }
              }
              if (line.startsWith("- ")) {
                return (
                  <li key={i} className="ml-4 text-white/60">
                    {line.replace("- ", "")}
                  </li>
                );
              }
              if (line === "") return <br key={i} />;
              return (
                <p key={i} className="text-white/65">
                  {line}
                </p>
              );
            })}
          </div>
        </article>
    </div>
  );
}
