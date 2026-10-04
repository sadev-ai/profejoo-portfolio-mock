import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Message, type ChatMessage } from "./Message";
import {
  getOrCreateChatSession,
  getChatHistory,
  sendSmartChatMessage,
} from "@/services/chatbot.service";
import { useAuth } from "@/hooks/useAuth";

type ButtonState = "ready" | "disabled" | "loading";
type ChatbotPageMode = "default" | "md";

const MOCK_MESSAGES: ChatMessage[] = [
  {
    message:
      "I'm here and ready to help! You can type your question like you're chatting with a real person.",
    isUserMessage: false,
  },
  {
    message: "Hi there! How can I assist you today?",
    isUserMessage: false,
  },
];

type ChatbotProps = {
  page?: ChatbotPageMode;
  onInteract?: () => void;
};

export default function Chatbot({ page = "default", onInteract }: ChatbotProps) {
  const { isAuthenticated } = useAuth();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  const trimmedInput = input.trim();
  const buttonState: ButtonState = thinking
    ? "loading"
    : trimmedInput.length === 0
      ? "disabled"
      : "ready";

  const isReady = buttonState === "ready";
  const isLoading = buttonState === "loading";

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const streamTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  useEffect(() => {
    return () => {
      if (streamTimeoutRef.current) {
        window.clearTimeout(streamTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setSessionId(null);
      return;
    }

    const initSession = async () => {
      try {
        setLoadingHistory(true);
        const session = await getOrCreateChatSession();
        setSessionId(session.session_id);
        const history = await getChatHistory(session.session_id);

        const uiMessages: ChatMessage[] = history.messages.map((m) => ({
          message: m.content,
          isUserMessage: m.role === "user",
        }));

        const noHistory = !history.messages || history.messages.length === 0;
        const inactiveSession = session.is_active === false;

        if (noHistory || inactiveSession) {
          setMessages([...MOCK_MESSAGES]);
        } else {
          setMessages(uiMessages);
        }
      } catch (err) {
        console.error("Failed to init session:", err);
      } finally {
        setLoadingHistory(false);
      }
    };

    initSession();
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) return;
    setMessages((prev) => {
      if (prev.length > 0) return prev;
      return [...MOCK_MESSAGES];
    });
  }, [isAuthenticated]);

  const streamBotResponse = (text: string): Promise<number> => {
    return new Promise<number>((resolve) => {
      let targetIndex = -1;

      if (streamTimeoutRef.current) {
        window.clearTimeout(streamTimeoutRef.current);
        streamTimeoutRef.current = null;
      }

      setMessages((prev) => {
        const next = [...prev, { message: "", isUserMessage: false } as ChatMessage];
        targetIndex = next.length - 1;
        return next;
      });

      if (!text) {
        setMessages((prev) => {
          if (targetIndex < 0 || !prev[targetIndex]) return prev;
          const updated = [...prev];
          updated[targetIndex] = { ...updated[targetIndex], message: "" };
          return updated;
        });
        resolve(targetIndex);
        return;
      }

      let charIndex = 0;

      const typeNext = () => {
        charIndex += 1;
        const nextSlice = text.slice(0, charIndex);

        setMessages((prev) => {
          if (targetIndex < 0 || !prev[targetIndex]) return prev;
          const updated = [...prev];
          updated[targetIndex] = { ...updated[targetIndex], message: nextSlice };
          return updated;
        });

        if (charIndex < text.length) {
          streamTimeoutRef.current = window.setTimeout(typeNext, 18);
        } else {
          streamTimeoutRef.current = null;
          resolve(targetIndex);
        }
      };

      streamTimeoutRef.current = window.setTimeout(typeNext, 20);
    });
  };

  const replaceMessageWithFileComponent = (index: number) => {
    setMessages((prev) => {
      if (index < 0 || index >= prev.length) return prev;
      const updated = [...prev];
      updated[index] = {
        message: "",
        isUserMessage: false,
        isFile: true,
      };
      return updated;
    });
  };

  const handleSend = async () => {
    if (!trimmedInput || thinking) return;

    onInteract?.(); 

    const userMsg: ChatMessage = {
      message: trimmedInput,
      isUserMessage: true,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);

    try {
      const { replyText } = await sendSmartChatMessage(page, {
        content: trimmedInput,
        isAuthenticated,
        sessionId: sessionId ?? undefined,
      });

      const streamedIndex = await streamBotResponse(replyText);

      if (page === "md") {
        replaceMessageWithFileComponent(streamedIndex);
      }
    } catch (error) {
      let fallbackMessage = "Unknown error.";

      if (axios.isAxiosError(error)) {
        fallbackMessage =
          (error.response?.data as any)?.error ||
          (error.response?.data as any)?.message ||
          error.message ||
          fallbackMessage;
      } else if (error instanceof Error) {
        fallbackMessage = error.message;
      }

      const streamedIndex = await streamBotResponse(fallbackMessage);

      if (page === "md") {
        replaceMessageWithFileComponent(streamedIndex);
      }
    }

    setThinking(false);
  };

  const baseButtonClasses =
    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 " +
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 " +
    "focus-visible:outline-(--secondary-300)";

  const buttonModeClasses: Record<typeof buttonState, string> = {
    ready:
      "bg-(--secondary-400) text-white hover:bg-(--secondary-500) hover:-translate-y-0.5 " +
      "hover:shadow-lg active:scale-95 cursor-pointer",
    disabled:
      "bg-gray-200 text-gray-400 cursor-not-allowed opacity-70 pointer-events-none",
    loading: "bg-(--secondary-200) text-(--secondary-600) cursor-progress",
  };

  const renderButtonIcon = () => {
    if (isLoading) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-4 w-4 animate-spin"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="9" className="opacity-30" />
          <path d="M21 12a9 9 0 00-9-9" strokeLinecap="round" />
        </svg>
      );
    }

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
        className="w-5 h-5"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20V4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 11l7-7 7 7" />
      </svg>
    );
  };

  return (
    <div
      className="
        flex flex-col h-full w-full min-h-0
        rounded-xl bg-white p-4 overflow-hidden
      "
    >
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-2 pb-3"
      >
        {messages.map((msg, idx) => (
          <Message key={idx} msg={msg} />
        ))}

        {thinking && (
          <div className="text-xs text-gray-400">
            AI is typing…
          </div>
        )}
      </div>

      <div className="mt-2 h-px shrink-0 bg-gray-200" />

      <div className="mt-3 flex shrink-0 items-center space-x-2">
        <textarea
          rows={1}
          value={input}
          onFocus={() => onInteract?.()}
          onChange={(e) => {
            setInput(e.target.value);
            
            if(e.target.value.trim().length > 0) {
              onInteract?.();
            }

            const el = e.target as HTMLTextAreaElement;
            el.style.height = "auto";

            const computed = window.getComputedStyle(el);
            let lineHeight = parseFloat(computed.lineHeight);
            if (Number.isNaN(lineHeight)) lineHeight = 20;

            const maxHeight = lineHeight * 3;
            const newHeight = Math.min(el.scrollHeight, maxHeight);

            el.style.height = `${newHeight}px`;
            el.style.overflowY =
              el.scrollHeight > maxHeight ? "auto" : "hidden";
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();

              const el = e.target as HTMLTextAreaElement;
              setTimeout(() => {
                el.style.height = "auto";
                el.style.overflowY = "hidden";
              }, 0);
            }
          }}
          className="
            flex-1
            rounded-xl
            border
            border-gray-300
            px-4
            py-2
            text-sm
            resize-none
            overflow-hidden
            focus:border-(--secondary-400)
            focus:outline-none
          "
          placeholder="Send a message..."
        />

        <button
          type="button"
          onClick={isReady ? handleSend : undefined}
          disabled={!isReady}
          aria-label="Send message"
          className={`${baseButtonClasses} ${buttonModeClasses[buttonState]}`}
        >
          {renderButtonIcon()}
        </button>
      </div>
    </div>
  );
}