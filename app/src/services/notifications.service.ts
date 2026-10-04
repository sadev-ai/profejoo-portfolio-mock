// src/services/notification.service.ts
import { authApi } from "@/lib/axios";
import { toApiError } from "@/lib/apiError";

/* ---------------------- Paths ---------------------- */
const NOTIFICATIONS_PATH = "/api/v1/notifications";

/* ---------------------- Types ---------------------- */

// Raw shape from your API (snake_case)
export interface NotificationApiModel {
  id?: number;
  body: string;
  data_json?: string; // backend sends this as stringified JSON
  is_read: boolean;
  title: string;
  type: string;
  user_id: number;
  // if you later add created_at / updated_at / etc, put them here
  [key: string]: any;
}

// Frontend-friendly shape (camelCase, parsed data)
export interface Notification {
  id?: number;
  body: string;
  title: string;
  type: string;
  userId: number;
  isRead: boolean;
  data?: any; // parsed from data_json if possible
  raw?: NotificationApiModel; // optional: keep original just in case
}

export interface CreateNotificationBody {
  body: string;
  title: string;
  type: string;
  // if backend defaults to "current user" this can be optional
  userId?: number;
  data?: Record<string, any>;
}

/* ---------------------- Mapper ---------------------- */

function fromApiNotification(api: NotificationApiModel): Notification {
  let parsedData: any = undefined;

  if (api.data_json) {
    try {
      parsedData = JSON.parse(api.data_json);
    } catch {
      // If the JSON was malformed, keep it as a string
      parsedData = api.data_json;
    }
  }

  return {
    id: api.id,
    body: api.body,
    title: api.title,
    type: api.type,
    userId: api.user_id,
    isRead: api.is_read,
    data: parsedData,
    raw: api,
  };
}

/* ---------------------- Service methods ---------------------- */

/**
 * GET /notifications?limit=
 * List of notifications for the logged-in user
 */
export async function listNotifications(limit: number = 20): Promise<Notification[]> {
  try {
    const res = await authApi.get<NotificationApiModel[]>(NOTIFICATIONS_PATH, {
      params: { limit },
    });

    return Array.isArray(res.data)
      ? res.data.map(fromApiNotification)
      : [];
  } catch (err) {
    throw toApiError(err);
  }
}

/**
 * POST /notifications
 * Create a new notification
 */
export async function createNotification(
  body: CreateNotificationBody
): Promise<Notification> {
  try {
    const payload: any = {
      body: body.body,
      title: body.title,
      type: body.type,
      // Per Swagger: the data field is an object; the backend converts it
      // to data_json itself
      data: body.data ?? {},
    };

    if (body.userId !== undefined) {
      payload.user_id = body.userId;
    }

    const res = await authApi.post<NotificationApiModel>(
      NOTIFICATIONS_PATH,
      payload
    );

    return fromApiNotification(res.data);
  } catch (err) {
    throw toApiError(err);
  }
}

/**
 * PATCH /notifications/{id}/read
 * Marks a notification as read
 */
export async function markNotificationAsRead(id: number): Promise<void> {
  try {
    // send an empty JSON body so Content-Type is set and some backends
    // don't choke on a PATCH with no body
    await authApi.patch(`${NOTIFICATIONS_PATH}/${id}/read`, {});
  } catch (err) {
    throw toApiError(err);
  }
}
