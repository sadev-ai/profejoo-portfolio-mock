import React, { useState } from "react";
import { motion } from "framer-motion";
import { QuestionItem } from "@/components/FaqChatbot/QuestionItem";

interface Topic {
  id: string;
  title: string;
  description?: string;

  faqs?: {
    question: string;
    answer: string;
  }[];
}

interface TopicQuestionsProps {
  topic: Topic;
}

export const TopicQuestions: React.FC<TopicQuestionsProps> = ({ topic }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <motion.div
      layout
      className="flex flex-col rounded-3xl border border-slate-100 bg-white/80 p-6 md:p-7 shadow-lg overflow-hidden max-h-[600px] md:max-h-none md:h-full md:min-h-0"
    >
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-medium uppercase tracking-wide text-(--secondary-400)">
          {/*topic.title*/}Questions
        </p>
      </div>

      {/* FAQ LIST */}
      <div className="mt-3 flex-1 overflow-y-auto pr-1 space-y-2">
        {topic.faqs?.map((qa, index) => (
          <QuestionItem
            key={qa.question}
            item={qa}
            isOpen={openIndex === index}
            onToggle={() => handleToggle(index)}
          />
        ))}

        {!topic.faqs?.length && (
          <p className="text-slate-500 text-sm italic">
            No questions available for this topic yet.
          </p>
        )}
      </div>
    </motion.div>
  );
};
