import React, { useState } from "react";
import { Modal } from "@/components/ProfessorMetadata/Modal/Modal";
import { TiptapEditor } from "@/components/emailsop";

type FileComponentProps = {
  title?: string;
  subtitle?: string;
  className?: string;

  // optional: let parent provide initial content
  initialContent?: string;
};

export function FileComponent({
  title = "Your Email generated successfully",
  subtitle = "Tap to show and edit",
  className = "",
  initialContent = "",
}: FileComponentProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // from your TestPage/ExamplePage
  const [docType] = useState<"Email" | "SOP">("Email");
  const [content, setContent] = useState(initialContent);

  return (
    <>
      <div
        className={[
          "flex items-center gap-2",
          "w-full max-w-full",
          "rounded-2xl bg-white px-4 py-3",
          "shadow-lg cursor-pointer",
          className,
        ].join(" ")}
        role="button"
        tabIndex={0}
        onClick={() => setIsModalOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setIsModalOpen(true);
        }}
      >
        <div className="grid h-10 w-10 place-items-center rounded-full bg-(--secondary-400)">
          <MailIcon className="h-5 w-5 text-black" />
        </div>

        <div className="min-w-0">
          <div className="text-sm font-medium text-black truncate">{title}</div>
          <div className="mt-0.5 text-xs text-black/50 truncate">
            {subtitle}
          </div>
        </div>
      </div>

      {/* ✅ In-place TestPage UI (modal) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Your Generated Email/SOP"
        description="Review the generated draft carefully, then make any edits you need before moving forward."
      >
        <div className="flex h-full flex-col">
          <TiptapEditor
            content={content}
            onChange={setContent}
            placeholder={
              docType === "Email"
                ? "Write your email here..."
                : "Write your statement of purpose here..."
            }
            minHeight="0px"
            className="flex-1 min-h-0"
          />

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-700 hover:text-primary-400"
            >
              Cancel
            </button>

            <button
              className="px-4 py-2 bg-primary-400 text-white rounded-xl hover:bg-(--primary-300)"
              onClick={() => {
                // TODO: hook saving logic here
                setIsModalOpen(false);
              }}
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function MailIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M5.5 7.5 12 12l6.5-4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
