import React from "react";

interface Topic {
  id: string;
  title: string;
  description?: string;
}

interface TopicCardProps {
  topic: Topic;
  isActive?: boolean;
}

export const TopicCard: React.FC<TopicCardProps> = ({ topic, isActive }) => {
  const containerClasses = [
    "flex flex-col justify-center h-full w-full rounded-3xl bg-white p-5 md:p-6",
    "shadow-[0_18px_45px_rgba(227,240,245,0.9)]",
    "transition-transform transition-shadow transition-colors duration-200",
    isActive
      ? "items-left text-left ring-1 ring-(--secondary-100)"
      : "hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(227,240,245,1)] hover:bg-(--secondary-100)/30",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses}>
      <h3 className="text-base font-semibold text-slate-900 md:text-lg">
        {topic.title}
      </h3>
      {topic.description && (
        <p className="text-sm text-slate-500 md:text-[0.9rem]">
          {topic.description}
        </p>
      )}
    </div>
  );
};
