import { notFound } from "next/navigation";
import { resource } from "@/lib/db";
import { ResourceDetailClient } from "./detail-client";

export const dynamic = "force-dynamic";

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const r = await resource.findUnique({ id: parseInt(id) });
  if (!r) notFound();

  const links = JSON.parse(r.downloadLinks || "[]") as {
    label: string;
    url: string;
    code?: string;
  }[];

  await resource.incrementDownloads(r.id);

  return (
    <ResourceDetailClient
      id={r.id}
      name={r.name}
      description={r.description}
      image={r.image}
      category={r.category}
      downloads={r.downloads + 1}
      createdAt={r.createdAt}
      links={links}
    />
  );
}
