// pages/ExamplePage.tsx
import { useState } from "react";
import { Modal } from "@/components/ProfessorMetadata/Modal/Modal";
import { TiptapEditor } from "@/components/emailsop";

export default function ExamplePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [docType, ] = useState<"Email" | "SOP">("Email");
  const [content, setContent] = useState("");

  return (
    // <div className="p-8">
    //   <button
    //     onClick={() => setIsModalOpen(true)}
    //     className="px-4 py-2 bg-blue-600 text-white rounded-md"
    //   >
    //     Open Modal
    //   </button>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Your Generated Email/SOP" // fix later
          description="Review the generated draft carefully, then make any edits you need before moving forward."
        >
        {/* Replace this later with ANY component */}
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
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    // </div>
  );
}
