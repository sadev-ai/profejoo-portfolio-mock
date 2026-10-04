"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TopicCard } from "@/components/FaqChatbot/TopicCard";
import { TopicQuestions } from "@/components/FaqChatbot/TopicQuestions";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface Topic {
  id: string;
  title: string;
  description?: string;

  faqs?: {
    question: string;
    answer: string;
  }[];
}

interface FaqTopicsProps {
  className?: string;
}

const MOCK_TOPICS: Topic[] = [
  {
    id: "getting-started",
    title: "Getting started",
    description: "Basics of using the product for the first time.",
    faqs: [
      {
        question: "What is Profejoo and how does it work?",
        answer:
          "Profejoo helps students find professors and universities that match their research interests using AI-powered data analysis.",
      },
      {
        question: "Is Profejoo free to use?",
        answer:
          "Yes, Profejoo offers a free tier with powerful matching features.",
      },
    ],
  },
  {
    id: "billing",
    title: "Billing & payments",
    description: "Invoices, payment methods, and subscriptions.",
    faqs: [
      {
        question: "How can I upgrade my subscription?",
        answer:
          "You can upgrade your plan from the billing section in your account dashboard.",
      },
      {
        question: "What payment methods are supported?",
        answer:
          "We support major credit cards and secure online payment providers.",
      },
    ],
  },
  {
    id: "account",
    title: "Account & profile",
    description: "Login, security, and profile settings.",
    faqs: [
      {
        question: "How do I reset my password?",
        answer:
          "Click on 'Forgot password' on the login page and follow the instructions.",
      },
      {
        question: "Can I edit my profile information?",
        answer:
          "Yes, you can update your profile anytime from your account settings.",
      },
    ],
  },
  {
    id: "integrations",
    title: "Integrations",
    description: "Connecting to other tools and platforms.",
    faqs: [
      {
        question: "Does Profejoo integrate with external tools?",
        answer:
          "Yes, Profejoo can connect with several research and productivity tools.",
      },
      {
        question: "How do I enable integrations?",
        answer:
          "You can manage integrations from the settings page in your dashboard.",
      },
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    description: "Fixing common issues and errors.",
    faqs: [
      {
        question: "Why can't I log in to my account?",
        answer:
          "Make sure your email and password are correct or reset your password if needed.",
      },
      {
        question: "The search results are not loading. What should I do?",
        answer:
          "Try refreshing the page or clearing your browser cache.",
      },
    ],
  },
  {
    id: "other",
    title: "Other questions",
    description: "Anything that doesn’t fit the other topics.",
    faqs: [
      {
        question: "How can I contact support?",
        answer:
          "You can reach our support team through the contact form in the help center.",
      },
      {
        question: "Where can I report a bug?",
        answer:
          "Use the feedback option in your dashboard to report bugs.",
      },
    ],
  },

  // new topics

  {
    id: "search",
    title: "Search & matching",
    description: "Finding professors based on your research interests.",
    faqs: [
      {
        question: "How does the AI matching system work?",
        answer:
          "Our AI analyzes research keywords, publications, and academic fields to match you with relevant professors.",
      },
      {
        question: "Can I filter search results?",
        answer:
          "Yes, you can filter by country, university, research field, and more.",
      },
    ],
  },
  {
    id: "professors",
    title: "Professors",
    description: "Information about professors and their research.",
    faqs: [
      {
        question: "Where does professor data come from?",
        answer:
          "We collect data from public university websites and academic publications.",
      },
      {
        question: "Can I suggest a professor to add?",
        answer:
          "Yes, you can submit suggestions through our feedback form.",
      },
      {
        question: "Can I suggest a professor to add?",
        answer:
          "Yes, you can submit suggestions through our feedback form.",
      },
      {
        question: "Can I suggest a professor to add?",
        answer:
          "Yes, you can submit suggestions through our feedback form.",
      },
      {
        question: "Can I suggest a professor to add?",
        answer:
          "Yes, you can submit suggestions through our feedback form.",
      },
      {
        question: "Can I suggest a professor to add?",
        answer:
          "Yes, you can submit suggestions through our feedback form.",
      },
      {
        question: "Can I suggest a professor to add?",
        answer:
          "Yes, you can submit suggestions through our feedback form.",
      },
      {
        question: "Can I suggest a professor to add?",
        answer:
          "Yes, you can submit suggestions through our feedback form.",
      },
      {
        question: "Can I suggest a professor to add?",
        answer:
          "Yes, you can submit suggestions through our feedback form.",
      },
      {
        question: "Can I suggest a professor to add?",
        answer:
          "Yes, you can submit suggestions through our feedback form.",
      },
      {
        question: "Can I suggest a professor to add?",
        answer:
          "Yes, you can submit suggestions through our feedback form.",
      },
      {
        question: "Can I suggest a professor to add?",
        answer:
          "Yes, you can submit suggestions through our feedback form.",
      },
      {
        question: "Can I suggest a professor to add?",
        answer:
          "Yes, you can submit suggestions through our feedback form.",
      },
      {
        question: "Can I suggest a professor to add?",
        answer:
          "Yes, you can submit suggestions through our feedback form.",
      },
      {
        question: "Can I suggest a professor to add?",
        answer:
          "Yes, you can submit suggestions through our feedback form.",
      },
      {
        question: "Can I suggest a professor to add?",
        answer:
          "Yes, you can submit suggestions through our feedback form.",
      },
      {
        question: "Can I suggest a professor to add?",
        answer:
          "Yes, you can submit suggestions through our feedback form.",
      },
    ],
  },
  {
    id: "universities",
    title: "Universities",
    description: "Information about universities and programs.",
    faqs: [
      {
        question: "Can I search universities by country?",
        answer:
          "Yes, you can filter universities based on country and research fields.",
      },
      {
        question: "Do you include ranking information?",
        answer:
          "Some university profiles include ranking and research strength indicators.",
      },
    ],
  },
  {
    id: "privacy",
    title: "Privacy & security",
    description: "How we protect your data and privacy.",
    faqs: [
      {
        question: "Is my personal data secure?",
        answer:
          "Yes, we follow industry security practices to protect your information.",
      },
      {
        question: "Do you share my data with third parties?",
        answer:
          "No, we do not sell or share your personal data without your consent.",
      },
    ],
  },
];

export const FaqTopics: React.FC<FaqTopicsProps> = ({ className = "" }) => {
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);

  const topics = MOCK_TOPICS;
  const activeTopic = topics.find((t) => t.id === activeTopicId) ?? null;

  const handleException = useMediaQuery("(min-width: 768px) and (max-width: 880px)");

  const handleOpenTopic = (topicId: string) => {
    setActiveTopicId(topicId);
  };

  const handleBackToGrid = () => {
    setActiveTopicId(null);
  };

  const wrapperClasses = ["w-full", "md:h-full", className]
    .filter(Boolean)
    .join(" ");

  const stackClasses = [
    "relative flex w-full flex-col gap-4",
    "self-stretch max-h-[80vh] md:max-h-none md:h-full md:min-h-0 md:flex-1",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClasses}>
      <motion.div
        layout
        className={stackClasses}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
      >
        <AnimatePresence mode="wait">
          {!activeTopic && (
            <motion.div
              key="topics-grid"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className={
                handleException
                  ? "grid h-full min-h-0 overflow-y-auto grid-cols-1 gap-4 p-2 auto-rows-fr"
                  : "grid h-full min-h-0 overflow-y-auto grid-cols-1 gap-4 p-3 auto-rows-fr md:grid-cols-2 md:gap-6 md:p-5"
              }
            >
              {topics.map((topic) => (
                <motion.button
                  key={topic.id}
                  type="button"
                  layoutId={topic.id}
                  onClick={() => handleOpenTopic(topic.id)}
                  className="text-balance h-full w-full cursor-pointer focus:outline-none focus-visible:ring-2
                   focus-visible:ring-orange-300 focus-visible:ring-offset-2 
                   focus-visible:ring-offset-slate-50 rounded-3xl"
                >
                  <TopicCard topic={topic} />
                </motion.button>
              ))}
            </motion.div>
          )}

          {activeTopic && (
            <motion.div
              key="topic-detail"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              /* ✅ Spacing, margin, and padding were adjusted here to closely match the reference image */
              className="flex flex-col gap-6 p-4 md:p-6 min-h-0 max-h-[80vh] md:max-h-none md:h-full md:flex-1 overflow-y-auto"
            >
              {/* Header: back button + selected TopicCard */}
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={handleBackToGrid}
                  /* ✅ Button styles were edited to create a pill shape and precisely match the box next to it */
                  className="mt-1.5 inline-flex items-center justify-center rounded-full
                   border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 
                   shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none 
                   focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 
                   focus-visible:ring-offset-slate-50"
                  aria-label="Back to all topics"
                >
                  <span className="mr-1.5 flex h-4 w-4 items-center justify-center">
                    <svg
                      viewBox="0 0 20 20"
                      className="h-full w-full"
                      aria-hidden="true"
                    >
                      <path
                        d="M11.5 4.5L7 9l4.5 4.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="hidden sm:inline">All topics</span>
                </button>

                <motion.div layoutId={activeTopic.id} className="flex-1">
                  <TopicCard topic={activeTopic} isActive />
                </motion.div>
              </div>

              {/* Placeholder vertical card for the questions area */}
              <TopicQuestions topic={activeTopic} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};