import Link from "next/link";

interface BlogCardProps {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
}

export function BlogCard({ title, slug, date, excerpt }: BlogCardProps) {
  return (
    <Link href={`/blog/${slug}`} className="glass block px-6 py-5 w-full">
      <div className="flex items-baseline gap-4">
        <span className="text-sm text-white/40 font-light whitespace-nowrap">
          {date}
        </span>
        <div>
          <h3 className="font-light text-white/90">{title}</h3>
          <p className="mt-1 text-sm text-white/45 line-clamp-1">{excerpt}</p>
        </div>
      </div>
    </Link>
  );
}
