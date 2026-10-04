import React, { useState, useEffect, useRef } from "react";
import Chatbot from "@/components/FaqChatbot/Chatbot";
import { FaqTopics } from "@/components/FaqChatbot/FAQTopics";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { MessageCircle, X } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function ChatbotPage() {
  const [open, setOpen] = useState(false);
  const [isChatFocused, setIsChatFocused] = useState(false);
  
  // ✅ Reference for detecting clicks outside the chatbot
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleException = useMediaQuery("(min-width: 768px) and (max-width: 880px)");

  // Close on ESC
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setIsChatFocused(false); // also exit focus when Esc is pressed
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // ✅ Logic for exiting focus (if a click happened outside the chatbot)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isChatFocused &&
        chatContainerRef.current &&
        !chatContainerRef.current.contains(event.target as Node)
      ) {
        setIsChatFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isChatFocused]);

  // Lock body scroll when sidebar is open (mobile)
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // If user resizes to desktop, close mobile drawer
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false); 
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="w-full min-h-screen bg-(--secondary-50)/30 flex flex-col">
      <Navbar />

      {/* ✅ The height is pinned here: h-[calc(100vh-160px)]
        flex-1 no longer lets it stretch. It's locked between 600 and 850 pixels.
      */}
      <div className="w-full flex flex-col md:flex-row items-stretch h-[calc(100vh-160px)] min-h-[600px] max-h-[850px] gap-4 justify-center mb-4 px-4 transition-all duration-500">
        
        {/* FAQ Topics Section */}
        <div className={`transition-all duration-500 ease-in-out h-full ${
          handleException 
            ? (isChatFocused ? "hidden" : "w-full") 
            : (isChatFocused ? "w-full md:w-[50%] lg:w-[40%]" : "w-full md:w-1/2")
        }`}>
          <div className="flex flex-col h-full w-full min-h-0 rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden">
            <FaqTopics />
          </div>
        </div>

        {/* Desktop Chatbot Section */}
        <div 
          ref={chatContainerRef} // ✅ Attaching the ref to the chatbot container
          className={`transition-all duration-500 ease-in-out h-full ${
            handleException 
              ? (isChatFocused ? "w-full flex" : "hidden") 
              : (isChatFocused ? "hidden md:flex w-full md:w-[50%] lg:w-[60%]" : "hidden md:flex w-full md:w-1/2")
          }`}
        >
          <div className="flex flex-col h-full w-full min-h-0 rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden">
            <Chatbot onInteract={() => setIsChatFocused(true)} />
          </div>
        </div>

      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className={handleException ?
          [
            "fixed right-5 bottom-6 z-[2500]",
            "h-14 w-14 rounded-full shadow-lg",
            "bg-secondary-400 hover:bg-secondary-600 text-white",
            "flex items-center justify-center",
            "transition active:scale-95",
            open ? "hidden" : "block",
          ].join(" ") : [
            "md:hidden fixed right-5 bottom-6 z-[2500]",
            "h-14 w-14 rounded-full shadow-lg",
            "bg-secondary-400 hover:bg-secondary-600 text-white",
            "flex items-center justify-center",
            "transition active:scale-95",
            open ? "hidden" : "block",
          ].join(" ")}
        aria-label="Open chatbot"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      <div
        className={handleException ?
          [
            "fixed inset-0 z-[2400] transition",
            open ? "pointer-events-auto" : "pointer-events-none",
          ].join(" ") : [
            "md:hidden fixed inset-0 z-[2400] transition",
            open ? "pointer-events-auto" : "pointer-events-none",
          ].join(" ")}
        aria-hidden={!open}
      >
        <div
          className={[
            "absolute inset-0 bg-black/40 transition-opacity",
            open ? "opacity-100" : "opacity-0",
          ].join(" ")}
          onClick={() => setOpen(false)}
        />

        <aside
          className={[
            "absolute right-0 top-0 h-full w-[92%] max-w-[420px]",
            "bg-white shadow-2xl",
            "transition-transform duration-300",
            open ? "translate-x-0" : "translate-x-full",
            "flex flex-col",
          ].join(" ")}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary-400" />
              <span className="font-semibold text-primary-400">Chatbot</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-2 hover:bg-gray-100"
              aria-label="Close chatbot"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 min-h-0 p-3">
            <div className="h-full min-h-0 flex flex-col">
              <Chatbot onInteract={() => setIsChatFocused(true)} />
            </div>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
}