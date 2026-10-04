// src/components/dashboard/NotificationsCard.tsx
import * as React from "react";
import { Bell } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import { useNavigate } from "react-router-dom";
import { ROUTES, notificationDetailPath } from "@/constants/routes";
import {
  listNotifications,
  markNotificationAsRead,
  type Notification,
} from "@/services/notifications.service";

export type NotificationItem = {
  id: number;
  title: string;
  type: string;
  timeAgo: string;
  unread?: boolean;
};

type Props = {
  items?: NotificationItem[];
};

function formatTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function mapNotificationToItem(n: Notification): NotificationItem {
  const raw: any = n.raw ?? {};
  const createdAt =
    raw.created_at || raw.createdAt || raw.created || raw.timestamp;

  const timeAgo = createdAt ? formatTimeAgo(new Date(createdAt)) : "";

  if (n.id == null) {
    // 🔍 TEMP: help us debug what the backend returns
    console.warn("Notification without id from API:", n);
  }

  return {
    // ❌ DO NOT fall back to 0
    id: n.id ?? -1,
    title: n.title,
    type: n.type,
    timeAgo,
    unread: !n.isRead,
  };
}


export function NotificationRow({
  item,
  onClick,
}: {
  item: NotificationItem;
  onClick?: () => void;
}) {
  const isUnread = !!item.unread;

  return (
    <button type="button" className="group w-full text-left" onClick={onClick}>
      <div
        className={[
          "flex items-center gap-3 rounded-2xl px-3 py-3",
          "text-xs md:text-sm transition-colors border",
          isUnread
            ? "border-transparent border-l-[4px] border-l-secondary-400 bg-transparent group-hover:bg-[var(--secondary-50)]"
            : "border-transparent bg-transparent group-hover:bg-[var(--secondary-50)]",
        ].join(" ")}
      >
        <div className="flex-1">
          <p className="font-semibold text-primary-400">{item.title}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {item.type || "Type"}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="text-[11px] text-muted-foreground">
            {item.timeAgo}
          </span>
          <Bell className="h-4 w-4 text-primary-400" />
        </div>
      </div>
    </button>
  );
}

export function NotificationsCard({ items: itemsProp }: Props) {
  const navigate = useNavigate();
  const [items, setItems] = React.useState<NotificationItem[]>(itemsProp ?? []);

  React.useEffect(() => {
    if (itemsProp && itemsProp.length > 0) return;

    let isMounted = true;

    (async () => {
      try {
        const data = await listNotifications(20);
        if (!isMounted) return;
        setItems(data.map(mapNotificationToItem));
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [itemsProp]);

  const handleNotificationClick = async (id: number) => {
  if (id <= 0 || Number.isNaN(id)) {
    console.error("Cannot mark notification as read – invalid id:", id);
    return;
  }

  try {
    await markNotificationAsRead(id);
    setItems((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, unread: false } : n
      )
    );
  } catch (err) {
    console.error("Failed to mark notification as read", err);
  } finally {
    navigate(notificationDetailPath(id), { replace: false });
  }
};


  return (
    <DashboardCard
      title="Notifications"
      actionLabel="View all"
      onActionClick={() =>
        navigate(ROUTES.DASHBOARD_NOTIFICATIONS, { replace: false })
      }
    >
      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
        {items.map((n) => (
          <NotificationRow
            key={n.id}
            item={n}
            onClick={() => handleNotificationClick(n.id)}
          />
        ))}
      </div>
    </DashboardCard>
  );
}
