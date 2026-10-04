// src/services/chatbot.service.ts

import { publicApi, authApi, API_BASE_URL } from "@/lib/axios";
import { ApiError } from "@/lib/apiError";

/* ======================= Types ======================= */

export type ChatMessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  content: string;
  role: ChatMessageRole;
  timestamp: string;
}

export interface mdChatMessage {
  content: string;
  role: ChatMessageRole;
  timestamp: string;
  isFile: boolean;
}

export interface ChatSession {
  session_id: string;
  title: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatHistoryResponse {
  session_id: string;
  messages: ChatMessage[];
  total: number;
}

export interface ChatSessionsResponse {
  limit: number;
  offset: number;
  total: number;
  sessions: ChatSession[];
}

/* ======================= Helper ======================= */

function toApiError(err: any, defaultMessage = "Chat request failed"): ApiError {
  if (err instanceof ApiError) return err;

  if (err?.response) {
    const d = err.response.data ?? {};
    const msg =
      d.message ||
      d.error ||
      d.detail ||
      defaultMessage;

    return new ApiError(
      String(msg),
      err.response.status,
      d.code || d.error_code,
      d
    );
  }

  return new ApiError("Network error", 0, "NETWORK_ERROR");
}

/* =======================================================
 *  GUEST MODE (PUBLIC) – your existing function
 *  This is used when there is NO session / NO auth
 * =======================================================
 */

/**
 * Send a message as a guest (no session, no auth).
 * NOTE: This keeps the same signature & behavior you already use:
 *   - Takes a plain `message: string`
 *   - Returns just the assistant reply text as `string`
 */
export async function sendChatMessage(message: string): Promise<string> {
  try {
    const res = await publicApi.post(
      `${API_BASE_URL}/api/v1/chat/message`,
      {
        content: message,
        // no session_id → stateless / guest chat
      }
    );

    // Adjust this based on your backend response shape:
    // Swagger shows: { assistant_message: { content, role, timestamp } }
    const assistant = res.data?.assistant_message;
    const content = assistant?.content;

    if (!content || typeof content !== "string") {
      throw new ApiError(
        "Missing assistant message",
        500,
        "NO_ASSISTANT_MESSAGE",
        res.data
      );
    }

    return content;
  } catch (err: any) {
    throw toApiError(err, "Failed to send chat message");
  }
}

/* =======================================================
 *  AUTHENTICATED MODE (SESSION-BASED)
 *  These are NEW functions for logged-in users
 * =======================================================
 */

/**
 * Get the active chat session for the authenticated user,
 * or create a new one if none exists.
 *
 * GET /chat/session
 */
export async function getOrCreateChatSession(): Promise<ChatSession> {
  try {
    const res = await authApi.get(`${API_BASE_URL}/api/v1/chat/session`);
    return res.data as ChatSession;
  } catch (err: any) {
    throw toApiError(err, "Failed to get or create chat session");
  }
}

/**
 * List chat sessions for the authenticated user.
 *
 * GET /chat/sessions?limit=&offset=
 */
export async function getChatSessions(params?: {
  limit?: number;
  offset?: number;
}): Promise<ChatSessionsResponse> {
  try {
    const res = await authApi.get(`${API_BASE_URL}/api/v1/chat/sessions`, {
      params,
    });
    return res.data as ChatSessionsResponse;
  } catch (err: any) {
    throw toApiError(err, "Failed to fetch chat sessions");
  }
}

/**
 * Get conversation history for a specific chat session.
 *
 * GET /chat/history/{session_id}?limit=
 */
export async function getChatHistory(
  sessionId: string,
  limit?: number
): Promise<ChatHistoryResponse> {
  try {
    const res = await authApi.get(
      `${API_BASE_URL}/api/v1/chat/history/${encodeURIComponent(sessionId)}`,
      {
        params: typeof limit === "number" ? { limit } : undefined,
      }
    );
    return res.data as ChatHistoryResponse;
  } catch (err: any) {
    throw toApiError(err, "Failed to fetch chat history");
  }
}

/**
 * Send a message inside an existing authenticated session.
 * This is the session-based version of sendChatMessage.
 *
 * POST /chat/message
 */
export async function sendChatMessageWithSession(args: {
  content: string;
  sessionId: string;
}): Promise<ChatMessage> {
  const { content, sessionId } = args;

  try {
    const res = await authApi.post(
      `${API_BASE_URL}/api/v1/chat/message`,
      {
        content,
        session_id: sessionId,
      }
    );

    const assistant = res.data?.assistant_message as ChatMessage | undefined;

    if (!assistant || typeof assistant.content !== "string") {
      throw new ApiError(
        "Missing assistant message",
        500,
        "NO_ASSISTANT_MESSAGE",
        res.data
      );
    }

    return assistant;
  } catch (err: any) {
    throw toApiError(err, "Failed to send chat message in session");
  }
}

export async function mdChatMessageWithSession(args: {
  content: string;
  sessionId: string;
}): Promise<mdChatMessage> {
  const { content, sessionId } = args;

  try {
    const res = await authApi.post(
      `${API_BASE_URL}/api/v1/mdchat/message`,
      {
        content,
        session_id: sessionId,
      }
    );

    const assistant = res.data?.assistant_message as mdChatMessage | undefined;

    if (!assistant || typeof assistant.content !== "string") {
      throw new ApiError(
        "Missing assistant message",
        500,
        "NO_ASSISTANT_MESSAGE",
        res.data
      );
    }

    return assistant;
  } catch (err: any) {
    throw toApiError(err, "Failed to send chat message in session");
  }
}

/* =======================================================
 *  OPTIONAL HELPER – "smart" send
 *  You can use this later if you want one function
 *  that chooses guest vs session automatically.
 *  (Not used anywhere yet; safe to keep unused.)
 * =======================================================
 */

export async function sendSmartChatMessage(page: string, args: {
  content: string;
  isAuthenticated: boolean;
  sessionId?: string;
}): Promise<{
  replyText: string;
  assistantMessage?: ChatMessage;
  mdIsFile?: boolean;
}> {
  const { content, isAuthenticated, sessionId } = args;

  // Guest → use existing public function
  if (!isAuthenticated) {
    const replyText = await sendChatMessage(content);
    return { replyText };
  }

  // Authenticated but no session passed → caller should get/create one first
  if (!sessionId) {
    throw new Error("sessionId is required for authenticated chat");
  }

  if (page === "md") {
    const assistant = await mdChatMessageWithSession({ content, sessionId });
    return { replyText: assistant.content, assistantMessage: assistant, mdIsFile: assistant.isFile };
  }

  const assistant = await sendChatMessageWithSession({ content, sessionId });
  return { replyText: assistant.content, assistantMessage: assistant };
}
