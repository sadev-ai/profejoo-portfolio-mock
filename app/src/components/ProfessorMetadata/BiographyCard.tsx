// components/BiographyCard.tsx
import React from "react";

type Props = { text: string };

const BiographyCard: React.FC<Props> = ({ text }) => {
  return (
    <div className="bg-white w-full rounded-3xl shadow-md px-6 py-6 md:px-8 md:py-7">
      <h2 className="text-xl font-semibold text-primary-400 mb-4">Biography</h2>
      <p className="text-slate-700 leading-relaxed text-sm md:text-base whitespace-pre-line">
        {text}
      </p>
    </div>
  );
};

export default BiographyCard;
