import { resource } from "@/lib/db";
import { ResourceGrid } from "./resource-grid";

export default async function ResourcesPage() {
  const resources = resource.findMany();
  return <ResourceGrid resources={resources} />;
}
