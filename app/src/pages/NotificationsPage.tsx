// src/pages/NotificationsPage.tsx (or src/app/notifications/page.tsx)
import * as React from "react";
import {
  listNotifications,
  markNotificationAsRead,
  type Notification,
} from "@/services/notifications.service";
import {
  NotificationRow,
  type NotificationItem,
} from "@/components/dashboard/NotificationsCard";
import { useNavigate } from "react-router-dom";
import { notificationDetailPath } from "@/constants/routes";
import { useMediaQueryLegacy } from "@/hooks/useMediaQueryLegacy";


type TabKey = "unread" | "read";

type OpenKeys = "profile" | "plans" | "resources" | "favorites" | "history";

/* ---------- helpers ---------- */

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


import { createNotification } from "@/services/notifications.service";
import Navbar from "@/components/Navbar/Navbar";

async function createTestNotifications() {
  try {
    await createNotification({
      title: "Welcome to the platform!",
      body: "Your account was created successfully",
      type: "Account",
      data: { foo: "bar" }
    });

    await createNotification({
      title: "New feature update",
      body: "Check out our latest improvements!",
      type: "System",
      data: { version: "1.2.0" }
    });

    await createNotification({
      title: "Support message received",
      body: "You have a new message from support",
      type: "Message",
      data: { ticketId: 123 }
    });
} catch (err) {
    console.error("Failed to create test notifications:", err);
  }
}


/* ---------- UI building blocks ---------- */

function NotificationsHeader({
  total,
}: {
  total: number;
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-primary-900">
          Notifications
        </h1>
        <span className="flex h-7 min-w-[28px] items-center justify-center rounded-full bg-primary-500 px-2 text-sm font-semibold text-white">
          {total}
        </span>

        <button
        onClick={createTestNotifications}
        className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500"
        >
  Create Test Notifications
</button>

      </div>
    </div>
  );
}

function NotificationsTabs({
  activeTab,
  onChange,
  unreadCount,
}: {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
  unreadCount: number;
}) {
  return (
    <div className="mb-4 flex border-b border-slate-200 text-sm font-medium">
      <button
        type="button"
        onClick={() => onChange("unread")}
        className={[
          "relative px-4 py-3",
          activeTab === "unread"
            ? "text-primary-700"
            : "text-slate-500 hover:text-slate-700",
        ].join(" ")}
      >
        <span>Unread</span>
        {unreadCount > 0 && (
          <span className="ml-2 rounded-full bg-primary-500 px-2 py-0.5 text-xs text-white">
            {unreadCount}
          </span>
        )}
        {activeTab === "unread" && (
          <span className="absolute inset-x-0 bottom-0 h-[2px] bg-primary-500" />
        )}
      </button>

      <button
        type="button"
        onClick={() => onChange("read")}
        className={[
          "relative px-4 py-3",
          activeTab === "read"
            ? "text-primary-700"
            : "text-slate-500 hover:text-slate-700",
        ].join(" ")}
      >
        <span>Read</span>
        {activeTab === "read" && (
          <span className="absolute inset-x-0 bottom-0 h-[2px] bg-primary-500" />
        )}
      </button>
    </div>
  );
}

function NotificationsList({
  items,
  onItemClick,
}: {
  items: NotificationItem[];
  onItemClick: (id: number) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-slate-500">
        No notifications here yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <NotificationRow
          key={item.id}
          item={item}
          onClick={() => onItemClick(item.id)}
        />
      ))}
    </div>
  );
}

/* ---------- Main page component ---------- */

function NotificationsPageSample() {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<TabKey>("unread");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setLoading(true);
        const data = await listNotifications(100);
        if (!isMounted) return;
        setNotifications(data);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message || "Failed to load notifications");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const navigate = useNavigate();

  const handleNotificationClick = async (id: number) => {
  if (id <= 0 || Number.isNaN(id)) {
    console.error("Cannot mark notification as read – invalid id:", id);
    return;
  }

  try {
    await markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) =>
        (n.id ?? 0) === id ? { ...n, isRead: true } : n
      )
    );
  } catch (err) {
    console.error("Failed to mark notification as read", err);
  } finally {
    navigate(notificationDetailPath(id), { replace: false });
  }
};


  const unread = notifications.filter((n) => !n.isRead).map(mapNotificationToItem);
  const read = notifications.filter((n) => n.isRead).map(mapNotificationToItem);

  const itemsToShow = activeTab === "unread" ? unread : read;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-slate-50 to-violet-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <NotificationsHeader total={notifications.length} />

        <div className="rounded-3xl bg-white/90 p-6 shadow-lg">
          <NotificationsTabs
            activeTab={activeTab}
            onChange={setActiveTab}
            unreadCount={unread.length}
          />

          {loading ? (
            <div className="flex h-40 items-center justify-center text-sm text-slate-500">
              Loading notifications...
            </div>
          ) : error ? (
            <div className="flex h-40 items-center justify-center text-sm text-red-500">
              {error}
            </div>
          ) : (
            <NotificationsList
              items={itemsToShow}
              onItemClick={handleNotificationClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const LG_QUERY = "(min-width: 1024px)";
  const isLgUp = useMediaQueryLegacy(LG_QUERY);

  const [mode, setMode] = React.useState<"expanded" | "mini">("mini");
  const [open, setOpen] = React.useState<Record<OpenKeys, boolean>>({
    profile: false,
    plans: false,
    resources: false,
    favorites: false,
    history: false,
  });

  React.useEffect(() => {
    setMode(isLgUp ? "expanded" : "mini");
  }, [isLgUp]);

  const toggleOne = (k: OpenKeys) =>
    setOpen((s) => {
      const next = !s[k];
      return {
        profile: false,
        plans: false,
        resources: false,
        favorites: false,
        history: false,
        [k]: next,
      };
    });

  const handleToggleSidebar = () => {
    if (!isLgUp) return;
    setMode((m) => (m === "expanded" ? "mini" : "expanded"));
  };

  return (
    <div className="flex flex-col h-dvh bg-muted/10">
      <div className="shrink-0 z-40 relative">
        <Navbar
          mode={mode}
          onToggleSidebar={handleToggleSidebar}
          open={open}
          onToggleOne={toggleOne}
        />
      </div>
      <main className="flex-1 overflow-y-auto mb-4">
        <NotificationsPageSample />
      </main>
    </div>
  );
}