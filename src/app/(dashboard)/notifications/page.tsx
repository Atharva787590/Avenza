import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { NotificationsList, NotificationItem } from "@/components/NotificationsList";

export default async function NotificationsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  // 1. Fetch user notifications
  const notifications = await db.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">Notifications Center</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Keep track of co-building invitations, task assignments, and activity updates.
        </p>
      </div>

      <NotificationsList initialNotifications={notifications as NotificationItem[]} />
    </div>
  );
}
