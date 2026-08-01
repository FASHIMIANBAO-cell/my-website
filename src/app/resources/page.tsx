import { resource } from "@/lib/db";
import { ResourceGrid } from "./resource-grid";

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const resources = await resource.findMany();
  return <ResourceGrid resources={resources} />;
}
