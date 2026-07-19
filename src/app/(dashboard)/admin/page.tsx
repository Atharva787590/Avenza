import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { resolveReportAction, toggleUserRoleAction } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ShieldAlert, Users, Folder, HelpCircle, ShieldCheck } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await getSession();

  // Enforce server-side role security
  if (!session || (session.role !== "ADMIN" && session.role !== "MODERATOR")) {
    redirect("/dashboard?error=unauthorized");
  }

  const isSuperAdmin = session.role === "ADMIN";

  // 1. Gather stats
  const totalUsers = await db.user.count();
  const totalProjects = await db.project.count();
  const totalConnections = await db.connection.count();
  const pendingReportsCount = await db.moderationReport.count({
    where: { status: "PENDING" },
  });

  // 2. Fetch pending reports
  const pendingReports = await db.moderationReport.findMany({
    where: { status: "PENDING" },
    include: {
      reporter: { include: { profile: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // 3. Fetch users list
  const usersList = await db.user.findMany({
    include: { profile: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">Admin Moderation Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review flagged content, resolve user reports, and manage campus platform authorizations.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-deepslate/30 border border-border p-4 rounded-xl">
          <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Accounts</div>
          <div className="text-2xl font-bold text-white mt-1 flex items-center gap-1.5">
            <Users className="h-5 w-5 text-cobalt" />
            {totalUsers}
          </div>
        </div>

        <div className="bg-deepslate/30 border border-border p-4 rounded-xl">
          <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Projects</div>
          <div className="text-2xl font-bold text-white mt-1 flex items-center gap-1.5">
            <Folder className="h-5 w-5 text-mint" />
            {totalProjects}
          </div>
        </div>

        <div className="bg-deepslate/30 border border-border p-4 rounded-xl">
          <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Peer Connections</div>
          <div className="text-2xl font-bold text-white mt-1 flex items-center gap-1.5">
            <HelpCircle className="h-5 w-5 text-indigo-400" />
            {totalConnections}
          </div>
        </div>

        <div className="bg-deepslate/30 border border-border p-4 rounded-xl">
          <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Flagged Reports</div>
          <div className="text-2xl font-bold text-coral mt-1 flex items-center gap-1.5">
            <ShieldAlert className="h-5 w-5 text-coral" />
            {pendingReportsCount}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Moderation Reports */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-deepslate/35 border border-border p-6 rounded-2xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-coral" />
              Pending Moderation Reports ({pendingReports.length})
            </h2>

            <div className="space-y-4">
              {pendingReports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 border border-border bg-ink/20 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div>
                    <span className="text-[10px] bg-coral/10 border border-coral/20 text-coral px-2.5 py-0.5 rounded uppercase font-semibold">
                      Flagged {report.targetType}
                    </span>
                    <p className="text-sm font-semibold text-white mt-2">
                      Reason: <span className="font-medium text-cloud">{report.reason}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Reporter: @{report.reporter.profile?.username} • ID: {report.targetId}
                    </p>
                  </div>

                  <form action={async () => {
                    "use server";
                    await resolveReportAction(report.id);
                  }}>
                    <Button type="submit" variant="outline" size="sm" className="text-xs font-semibold hover:border-mint hover:text-mint">
                      Resolve Report
                    </Button>
                  </form>
                </div>
              ))}

              {pendingReports.length === 0 && (
                <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-xl">
                  No pending flags. Platform is clean!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Manage Users & Roles */}
        <div className="space-y-6">
          <div className="bg-deepslate/35 border border-border p-6 rounded-2xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-cobalt" />
              Accounts List ({usersList.length})
            </h2>

            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
              {usersList.map((usr) => (
                <div
                  key={usr.id}
                  className="p-3 border border-border rounded-xl bg-ink/20 flex flex-col gap-2 group"
                >
                  <div className="flex items-center justify-between min-w-0">
                    <div className="min-w-0">
                      <h4 className="font-semibold text-white text-xs truncate">
                        {usr.profile?.fullName || "Un-onboarded"}
                      </h4>
                      <p className="text-[10px] text-muted-foreground truncate">{usr.email}</p>
                    </div>

                    <span className="text-[9px] font-bold text-indigo-300 bg-cobalt/10 border border-cobalt/25 px-2 py-0.5 rounded uppercase">
                      {usr.role.toLowerCase()}
                    </span>
                  </div>

                  {isSuperAdmin && usr.id !== session.userId && (
                    <form
                      action={async (formData: FormData) => {
                        "use server";
                        const newRole = formData.get("role") as string;
                        await toggleUserRoleAction(usr.id, newRole);
                      }}
                      className="flex gap-2 border-t border-border/40 pt-2"
                    >
                      <Select name="role" defaultValue={usr.role} className="h-8 text-[10px] py-0 px-2 flex-1">
                        <option value="STUDENT">Student</option>
                        <option value="MODERATOR">Moderator</option>
                        <option value="ADMIN">Admin</option>
                      </Select>
                      <Button type="submit" size="sm" className="h-8 text-[10px] px-2 font-semibold">
                        Apply
                      </Button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
