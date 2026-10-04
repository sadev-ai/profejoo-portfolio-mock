// components/HighlightsCard.tsx
import React from "react";

type Props = { items: string[] };

const HighlightsCard: React.FC<Props> = ({ items }) => {
  return (
    <div className="bg-white rounded-3xl shadow-md px-6 py-6 md:px-8 md:py-7">
      <h2 className="text-xl font-semibold text-primary-400 mb-4">Highlights</h2>
      <ul className="list-disc list-inside space-y-2 text-slate-700 text-sm md:text-base">
        {items.map((li, i) => <li key={i}>{li}</li>)}
      </ul>
    </div>
  );
};

export default HighlightsCard;
