import { HiveCulture } from "@/components/hive/HiveCulture";
import { getCultureStories, CULTURE_CATEGORIES } from "@/lib/editorial/queries";

export default async function HiveCulturePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const category = CULTURE_CATEGORIES.includes(params.category as never)
    ? (params.category as string)
    : "Global";

  const stories = await getCultureStories(30, category);

  return <HiveCulture dbStories={stories} activeCategory={category} />;
}
