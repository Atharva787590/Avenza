"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { markAllNotificationsReadAction, markSingleNotificationReadAction } from "@/lib/actions/notifications";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Bell, Check, Users, Folder, Calendar, MessageSquare, Layers } from "lucide-react";

export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  type: string;
  link: string;
  isRead: boolean;
  createdAt: Date | string;
}

interface NotificationsListProps {
  initialNotifications: NotificationItem[];
}

export function NotificationsList({ initialNotifications }: NotificationsListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [notifications, setNotifications] = React.useState(initialNotifications);

  const handleMarkAllRead = async () => {
    // Optimistic Update
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    const result = await markAllNotificationsReadAction();

    if (result.success) {
      toast({ title: "Updated", description: result.message, type: "success" });
      router.refresh();
    } else {
      toast({ title: "Failed", description: result.error, type: "error" });
      setNotifications(initialNotifications); // Revert
    }
  };

  const handleNotificationClick = async (n: NotificationItem) => {
    if (!n.isRead) {
      // Mark read in DB
      await markSingleNotificationReadAction(n.id);
    }
    // Navigate
    router.push(n.link);
    router.refresh();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "CONNECTION":
        return <Users className="h-5 w-5 text-cobalt" />;
      case "APPLICATION":
        return <Folder className="h-5 w-5 text-mint" />;
      case "SESSION":
        return <Calendar className="h-5 w-5 text-amber" />;
      case "TASK":
        return <Layers className="h-5 w-5 text-indigo-400" />;
      default:
        return <MessageSquare className="h-5 w-5 text-cloud" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-deepslate/30 border border-border p-4 rounded-xl">
        <span className="text-xs text-muted-foreground">
          You have {notifications.filter((n) => !n.isRead).length} unread notification(s)
        </span>
        {notifications.some((n) => !n.isRead) && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="text-xs font-semibold h-8 flex items-center gap-1 hover:border-cobalt/40 cursor-pointer"
          >
            <Check className="h-3.5 w-3.5" />
            Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => handleNotificationClick(n)}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 hover:bg-deepslate/50 select-none relative ${
              n.isRead
                ? "bg-deepslate/20 border-border/80 text-muted-foreground"
                : "bg-deepslate/50 border-cobalt/25 text-cloud shadow-md shadow-cobalt/[0.02]"
            }`}
          >
            {/* Unread indicator dot */}
            {!n.isRead && (
              <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-cobalt" />
            )}

            <div className="h-10 w-10 rounded-lg bg-deepslate border border-border flex items-center justify-center shrink-0 mt-0.5">
              {getIcon(n.type)}
            </div>

            <div className="flex-1 min-w-0 pr-4">
              <h4 className={`text-xs font-bold ${n.isRead ? "text-muted-foreground" : "text-white"}`}>
                {n.title}
              </h4>
              <p className="text-xs mt-1 leading-relaxed">{n.content}</p>
              <span className="text-[10px] text-muted-foreground mt-2 block">
                {new Date(n.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="py-16 text-center border border-dashed border-border rounded-xl bg-deepslate/20">
            <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-pulse-slow" />
            <p className="text-sm text-cloud font-medium">No notifications yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              You will receive notifications here when peers apply to your projects, connect with you, or swap skills.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
