import { curatedTalent } from "@/lib/curatedTalent";

export const dynamic = "force-dynamic";

type Sort = { field?: string; direction?: "asc" | "desc" };
type FollowersRange = { min?: number; max?: number };
type Range = { min?: number };
type FilterBody = {
  locations?: string[];
  languages?: string[];
  interests?: string[];
  brands?: string[];
  followers?: FollowersRange;
  engagementRate?: Range;
};
type Body = { page?: number; sort?: Sort; filter?: FilterBody };

const PAGE_SIZE = 15;

function normalize(value?: string) {
  return (value || "").toLowerCase();
}

function applyFilters(filter: FilterBody | undefined) {
  return curatedTalent.filter((talent) => {
    if (filter?.locations?.length) {
      if (!talent.location || !filter.locations.some((loc) => normalize(talent.location) === normalize(loc))) {
        return false;
      }
    }

    if (filter?.languages?.length) {
      const langMatch = talent.languages?.some((lng) => filter.languages?.some((selected) => normalize(selected) === normalize(lng)));
      if (!langMatch) return false;
    }

    if (filter?.interests?.length) {
      const interestMatch = talent.interests?.some((interest) =>
        filter.interests?.some((selected) => normalize(selected) === normalize(interest)),
      );
      if (!interestMatch) return false;
    }

    if (filter?.brands?.length) {
      const brandMatch = talent.brandPartners?.some((brand) =>
        filter.brands?.some((selected) => normalize(selected) === normalize(brand)),
      );
      if (!brandMatch) return false;
    }

    const followers = talent.followers ?? 0;
    if (filter?.followers?.min != null && followers < filter.followers.min) return false;
    if (filter?.followers?.max != null && followers > filter.followers.max) return false;

    const er = talent.engagementRate ?? 0;
    if (filter?.engagementRate?.min != null && er < filter.engagementRate.min) return false;

    return true;
  });
}

function applySort(list: typeof curatedTalent, sort?: Sort) {
  if (!sort?.field) return list;
  const dir = sort.direction === "asc" ? 1 : -1;
  return [...list].sort((a, b) => {
    const valueFor = (talent: typeof curatedTalent[number]) => {
      if (sort.field === "followers") return talent.followers ?? 0;
      if (sort.field === "engagementRate") return talent.engagementRate ?? 0;
      return 0;
    };
    return (valueFor(a) - valueFor(b)) * dir;
  });
}

function mapResult(talent: typeof curatedTalent[number]) {
  const followers = talent.followers ?? 0;
  const engagementRate = talent.engagementRate ?? 0;
  const engagement = talent.avgEngagement ?? Math.round(followers * engagementRate);

  return {
    id: talent.id,
    username: talent.instagramHandle,
    fullName: talent.name,
    followers,
    engagementRate,
    engagement,
    location: talent.location,
    languages: talent.languages ?? [],
    interests: talent.interests ?? [],
    brands: talent.brandPartners ?? [],
    roles: talent.roleTags,
  };
}

export async function POST(req: Request) {
  let payload: Body = {};
  try {
    payload = (await req.json()) as Body;
  } catch {
    // ignore invalid payloads and use defaults
  }

  const page = payload.page ?? 0;
  const filtered = applySort(applyFilters(payload.filter), payload.sort);
  const start = page * PAGE_SIZE;
  const slice = filtered.slice(start, start + PAGE_SIZE);

  return Response.json({
    data: slice.map(mapResult),
    meta: {
      page,
      hasMore: start + PAGE_SIZE < filtered.length,
      total: filtered.length,
      source: "curated",
    },
  });
}
