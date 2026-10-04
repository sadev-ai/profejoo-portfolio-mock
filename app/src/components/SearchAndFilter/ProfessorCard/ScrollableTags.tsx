import { ChevronRight, ChevronLeft } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"

export default function ScrollableTags({ tags }: { tags: string[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 5)
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5)
    }
  }

  const scrollByAmount = (amount: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" })
    }
  }

  useEffect(() => {
    checkScroll()
    const ref = scrollRef.current
    if (ref) ref.addEventListener("scroll", checkScroll)
    return () => {if (ref) {ref.removeEventListener("scroll", checkScroll)}}
  }, [])

  return (
    <div className="relative mt-2 group">
      {/* Left scroll button */}
      {canScrollLeft && (
        <button
          onClick={() => scrollByAmount(-150)}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow hover:bg-white transition z-10 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto transition-opacity"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
      )}

      {/* Scrollable tags container */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth pr-6"
      >
        {tags.map((t) => (
          <Badge
            key={t}
            variant="outline"
            className="whitespace-nowrap shrink-0 bg-(--accent-400)/63 text-white px-2 py-1"
          >
            {t}
          </Badge>
        ))}
      </div>

      {/* Right scroll button */}
      {canScrollRight && (
        <button
          onClick={() => scrollByAmount(150)}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow hover:bg-white transition z-10 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto transition-opacity"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      )}
    </div>
  )
}
