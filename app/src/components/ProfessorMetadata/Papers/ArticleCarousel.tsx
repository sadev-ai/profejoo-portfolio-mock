import { useEffect, useRef, useState } from "react";
import ArticleCard from "./ArticleCard";

type Article = {
  id: string;
  title: string;
  authors: string[];
  semester: string;
  citations: number;
};

type Props = {
  articles: Article[];
};

const CARD_WIDTH = 160;
const GAP = 16;

export default function ArticleCarousel({ articles }: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateButtons = () => {
    const el = scrollerRef.current;
    if (!el) return;

    const eps = 2;
    setCanLeft(el.scrollLeft > eps);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - eps);
  };

  useEffect(() => {
    updateButtons();
    const el = scrollerRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);

    return () => {
      el.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, [articles.length]);

  const scrollByOne = (dir: "left" | "right") => {
    scrollerRef.current?.scrollBy({
      left: dir === "left" ? -(CARD_WIDTH + GAP) : CARD_WIDTH + GAP,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative w-full">
      {/* Left button */}
      <button
        disabled={!canLeft}
        onClick={() => scrollByOne("left")}
        className="
          absolute left-1 top-1/2 -translate-y-1/2 z-10
          w-9 h-9 rounded-full bg-white shadow
          flex items-center justify-center
          disabled:opacity-30 disabled:cursor-not-allowed
        "
      >
        &lt;
      </button>

      {/* Right button */}
      <button
        disabled={!canRight}
        onClick={() => scrollByOne("right")}
        className="
          absolute right-1 top-1/2 -translate-y-1/2 z-10
          w-9 h-9 rounded-full bg-white shadow
          flex items-center justify-center
          disabled:opacity-30 disabled:cursor-not-allowed
        "
      >
        &gt;
      </button>

      {/* Scroll container */}
      <div
        ref={scrollerRef}
        className="
          w-full overflow-x-auto overflow-y-hidden
          scroll-smooth
          snap-x snap-mandatory
          px-12
          [scrollbar-width:none] [-ms-overflow-style:none]
        "
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div
          className="flex py-2"
          style={{ gap: GAP }}
        >
          {articles.map((article) => (
            <div key={article.id} className="shrink-0 snap-start">
              <ArticleCard
                title={article.title}
                authors={article.authors}
                semester={article.semester}
                citations={article.citations}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
