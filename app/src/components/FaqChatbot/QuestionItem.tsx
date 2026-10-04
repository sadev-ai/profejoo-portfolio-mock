import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface QA {
  question: string;
  answer: string;
}

interface QuestionItemProps {
  item: QA;
  isOpen: boolean;
  onToggle: () => void;
}

export const QuestionItem: React.FC<QuestionItemProps> = ({
  item,
  isOpen,
  onToggle,
}) => {
  return (
    <motion.div layout className="mb-3">
      {/* QUESTION HEADER */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between rounded-2xl px-5 py-4 bg-white shadow-sm hover:bg-slate-50 transition"
      >
        <span className="text-[1rem] font-medium text-slate-800">
          {item.question}
        </span>

        <span className="text-(--secondary-500) text-xl leading-none">
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {/* ANSWER PANEL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              layout
              className="px-5 py-4 mt-1 rounded-2xl bg-(--secondary-400) text-white"
            >
              <p className="text-sm leading-relaxed">{item.answer}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
