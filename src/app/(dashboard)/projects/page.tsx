import Link from "next/link";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search, Folder, Users, ArrowRight } from "lucide-react";

interface SearchParams {
  q?: string;
  category?: string;
}

export default async function ProjectsDirectoryPage(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams;
  const session = await getSession();
  if (!session) return null;

  const query = searchParams.q || "";
  const categoryFilter = searchParams.category || "";

  // 1. Query projects
  const projects = await db.project.findMany({
    where: {
      AND: [
        query
          ? {
              OR: [
                { title: { contains: query } },
                { description: { contains: query } },
                { category: { contains: query } },
              ],
            }
          : {},
        categoryFilter ? { category: categoryFilter } : {},
      ],
    },
    include: {
      members: {
        include: {
          user: { include: { profile: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Extract categories for filter options
  const categories = await db.project.findMany({
    select: { category: true },
    distinct: ["category"],
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">Project Opportunities</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse hackathon ideas, side products, and open source opportunities to join.
          </p>
        </div>
        <Link href="/projects/new" className="sm:self-end">
          <Button className="font-semibold h-11">
            + Pitch Project
          </Button>
        </Link>
      </div>

      {/* Filter Form */}
      <form method="GET" className="bg-deepslate/50 border border-border p-5 rounded-2xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Search className="h-5 w-5" />
            </span>
            <Input
              name="q"
              defaultValue={query}
              placeholder="Search project title, technology tags, major requirements..."
              className="pl-10"
            />
          </div>

          <div className="flex gap-3 md:w-[320px]">
            <Select name="category" defaultValue={categoryFilter} className="flex-1">
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.category} value={c.category}>
                  {c.category}
                </option>
              ))}
            </Select>
            <Button type="submit" className="font-semibold h-11 px-6">
              Search
            </Button>
          </div>
        </div>
      </form>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => {
          const owner = proj.members.find((m) => m.role === "LEAD")?.user.profile;
          const statusColors: Record<string, string> = {
            RECRUITING: "bg-mint/10 text-mint border-mint/20",
            ACTIVE: "bg-cobalt/10 text-indigo-300 border-cobalt/25",
            COMPLETED: "bg-deepslate text-cloud border-border",
          };

          return (
            <div
              key={proj.id}
              className="bg-deepslate/30 border border-border rounded-2xl p-6 hover:border-cobalt/45 hover:bg-deepslate/50 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <span className="text-[10px] bg-border text-cloud border border-border/80 px-2.5 py-0.5 rounded uppercase font-semibold">
                    {proj.category}
                  </span>
                  <span className={`text-[10px] border px-2 py-0.5 rounded uppercase font-semibold ${statusColors[proj.status] || "bg-deepslate text-muted-foreground"}`}>
                    {proj.status.toLowerCase()}
                  </span>
                </div>

                <Link href={`/projects/${proj.id}`} className="block">
                  <h3 className="font-bold text-white group-hover:text-cobalt transition-colors truncate">
                    {proj.title}
                  </h3>
                </Link>

                <p className="text-xs text-muted-foreground mt-3 line-clamp-3 leading-relaxed">
                  {proj.description}
                </p>

                {owner && (
                  <p className="text-[11px] text-muted-foreground mt-4">
                    Pitched by: <span className="text-cloud font-medium">@{owner.username}</span>
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                  <Users className="h-4 w-4 text-cobalt" />
                  {proj.members.length} team member(s)
                </div>
                <Link
                  href={`/projects/${proj.id}`}
                  className="text-xs text-cobalt hover:underline font-bold flex items-center gap-1"
                >
                  View Details
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {projects.length === 0 && (
        <div className="py-20 text-center border border-dashed border-border rounded-2xl bg-deepslate/20">
          <Folder className="h-10 w-10 text-muted-foreground mx-auto mb-3 animate-pulse-slow" />
          <h3 className="text-lg font-bold text-white mb-1">No projects pitched yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Try resetting your search query or co-build your own project idea by clicking the &quot;Pitch Project&quot; button above.
          </p>
        </div>
      )}
    </div>
  );
}
