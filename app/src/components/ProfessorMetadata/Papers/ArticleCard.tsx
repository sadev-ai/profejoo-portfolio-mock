import { Copy } from "lucide-react";

type ArticleCardProps = {
  title: string;
  authors: string[];
  semester: string;
  citations: number;
  onClick?: () => void;
};

export default function ArticleCard({
  title,
  authors,
  semester,
  citations,
  onClick,
}: ArticleCardProps) {
  return (
    <div
      onClick={onClick}
      className="
        group relative cursor-pointer
        w-[160px] aspect-[1/1.414]
        rounded-xl border border-gray-300
        bg-white
        flex flex-col items-center text-center
        px-3 py-4
        transition-all duration-300 ease-out
        hover:bg-gradient-to-b hover:from-gray-200 hover:to-gray-400
        hover:shadow-md
      "
    >
      {/* Title */}
      <h3 className="font-semibold text-sm leading-snug mb-4 line-clamp-3">
        {title}
      </h3>

      {/* Authors */}
      <div className="text-[11px] text-gray-800 space-y-0.5 mb-3">
        {authors.map((author) => (
          <p key={author}>{author}</p>
        ))}
      </div>

      {/* Semester */}
      <p className="text-[11px] text-gray-700 mb-auto">
        {semester}
      </p>

      {/* Citations */}
      <p className="text-sm font-semibold mt-3">
        +{citations} cited
      </p>

      {/* Copy Icon */}
      <button
        className="
          absolute bottom-2 right-2
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          p-1.5 rounded-md
          hover:bg-black/10
        "
        onClick={(e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(title);
        }}
        aria-label="Copy article title"
      >
        <Copy className="h-4 w-4" />
      </button>
    </div>
  );
}
