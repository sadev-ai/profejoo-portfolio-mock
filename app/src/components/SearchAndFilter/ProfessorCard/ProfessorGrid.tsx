"use client"

import { useState, useEffect } from "react"
import ExpandableProfessorCard, { type Professor } from "@/components/SearchAndFilter/ProfessorCard/ProfessorExpandableCard"
import { AnimatePresence, motion } from "framer-motion"
import { useMediaQuery } from "@/hooks/useMediaQuery"

interface ProfessorGridProps {
  professors: Professor[]
}

export default function ProfessorGrid({ professors: initialData }: ProfessorGridProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [professorList, setProfessorList] = useState(initialData)
  const [swapped, setSwapped] = useState(false)

  useEffect(() => {
    setProfessorList(initialData)
    setExpandedId(null)
    setSwapped(false)
  }, [initialData])

  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
  const handleException1 = useMediaQuery("(min-width: 550px) and (max-width: 639px)");
  const handleException2 = useMediaQuery("(min-width: 420px) and (max-width: 550px)");

  const columns = (!isDesktop && isTablet) ? 2 : 4;


  const handleExpand = (id: string) => {
    setProfessorList((prev) => {
      const current = [...prev]
      const index = current.findIndex((p) => p.id === id)
      if (index === -1) return current
      const isLastInRow = (index + 1) % columns === 0

      if (expandedId === id) {
        setExpandedId(null)
        if (swapped) {
          setSwapped(false)
          return initialData.slice()
        }
        return current
      }

      if (isLastInRow && index > 0) {
        const temp = current[index - 1]
        current[index - 1] = current[index]
        current[index] = temp
        setSwapped(true)
      } else {
        setSwapped(false)
      }

      setExpandedId(id)
      return current
    })
  }

  const items: Array<{ type: "card" | "panel"; data?: Professor; direction?: "left" | "right" }> = []

  professorList.forEach((p, i) => {
    const isLastInRow = (i + 1) % columns === 0
    items.push({ type: "card", data: p })

    if (expandedId === p.id) {
      if (!isLastInRow) {
        items.push({ type: "panel", data: p, direction: "right" })
      } else {
        items.splice(items.length - 1, 0, { type: "panel", data: p, direction: "left" })
      }
    }
  })

  return (
    <div className={handleException1 ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-3 px-36  md:px-3 lg:px-3 items-start" : (handleException2 ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-3 px-23 md:px-3 lg:px-3 items-start" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-3 px-6 md:px-3 lg:px-3 items-start") } >
      <AnimatePresence initial={false}>
        {items.map((item) =>
          item.type === "card" ? (
            <motion.div layout key={item.data!.id}>
              <ExpandableProfessorCard
                professor={item.data!}
                expanded={expandedId === item.data!.id}
                onExpandedChange={() => handleExpand(item.data!.id)}
              />
            </motion.div>
          ) : (
            <motion.div
              key={`panel-${item.data!.id}`}
              layout
              initial={{
                opacity: 0,
                x: item.direction === "left" ? -50 : 50,
                scale: 0.98,
              }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{
                opacity: 0,
                x: item.direction === "left" ? -50 : 50,
                scale: 0.98,
              }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="h-[415px] rounded-2xl bg-transparent p-0 shadow-none border-none overflow-hidden"
            />
          )
        )}
      </AnimatePresence>
    </div>
  )
}
