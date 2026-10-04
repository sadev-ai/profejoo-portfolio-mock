// src/components/snf/profcard/ProfessorExpandableCard.tsx
"use client"

import { useState, type MouseEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart } from "lucide-react"
import ScrollableTags from "@/components/SearchAndFilter/ProfessorCard/ScrollableTags"
import { cubicBezier } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useMediaQuery } from "@/hooks/useMediaQuery"
import { formatCompactNumber } from "@/lib/utils"
import { professorDetailPath } from "@/constants/routes"

export interface Professor {
  id: string
  name: string
  university: string
  field: string
  department: string
  tags: string[]
  stats: { yearsActivity: number; hIndex: number; citations: number }
  avatar: string
  about?: string
  highlights?: string[]
}

type Props = {
  professor: Professor
  expanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  /** height of the whole card */
  height?: number
  /** width of the inline panel; we’ll ignore the numeric value for responsiveness and use 100% of a column */
  panelWidth?: number
  /** left card min width hint (just for inner layout spacing) */
  baseWidth?: number
  /** if false, disable expand behavior + right panel */
  expandable?: boolean
}

const smoothEasing = cubicBezier(0.4, 0.0, 0.2, 1)

export default function ExpandableProfessorCard({
  professor,
  expanded: controlledExpanded,
  onExpandedChange,
  height = 415,
  panelWidth = 340,
  baseWidth = 350,
  expandable = true,
}: Props) {
  const navigate = useNavigate()
  const [internalExpanded, setInternalExpanded] = useState(false)

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const canExpand = expandable && isDesktop;


  const rawExpanded =
    controlledExpanded !== undefined ? controlledExpanded : internalExpanded

  // if not expandable, card is always treated as collapsed
  const expanded = canExpand ? rawExpanded : false;

  const setExpanded = (v: boolean) => {
    if (!expandable) return
    if (onExpandedChange) onExpandedChange(v)
    else setInternalExpanded(v)
  }

  const [liked, setLiked] = useState(false)
  const toggle = () => {
    if (!canExpand) return
    setExpanded(!expanded)
  }
  const stop = (e: MouseEvent) => e.stopPropagation()
  const yearsActive = Math.max(
    0,
    new Date().getFullYear() - professor.stats.yearsActivity
  )

  return (
    <motion.div
      aria-expanded={expandable ? expanded : undefined}
      tabIndex={0}
      layout
      transition={{ layout: { duration: 0.6, ease: smoothEasing } }}
      style={{ height }}
      className={`relative w-full overflow-visible ${
        expanded ? "rounded-l-[24px]" : "rounded-[24px]"
      } border transition-all duration-500 border-gray-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.01] bg-gradient-to-b from-white to-[#B8DAE8]/35 focus:outline-none`}
    >
      {/* LEFT: main card */}
      <motion.div
        layout="position"
        style={{ width: "100%", height: "100%", maxWidth: baseWidth }}
        className="flex flex-col justify-between px-[12px] pb-[26px] pt-[12px] cursor-pointer"
        onClick={canExpand ? toggle : undefined}
      >
        <div>
          <div className="flex flex-col items-start pt-5 relative">
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={(e) => {
                  stop(e)
                  setLiked((l) => !l)
                }}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-pressed={liked}
                aria-label={liked ? "Unlike" : "Like"}
              >
                <Heart
                  className={`w-5 h-5 ${
                    liked ? "fill-red-500 text-red-500" : "text-gray-400"
                  }`}
                />
              </button>
            </div>

            <img
              src={professor.avatar}
              alt={professor.name}
              className="w-[84px] h-[84px] rounded-full border-2 border-(--secondary-400) mt-[10px]"
            />
            <div className="flex flex-col gap-[5px] mt-3">
              <h3 className="font-semibold text-xl">{professor.name}</h3>
              <p className="text-sm text-gray-650">{professor.field}</p>
              <p className="text-sm text-gray-500">{professor.university}</p>
            </div>
          </div>

          <div onClick={stop}>
            <ScrollableTags tags={professor.tags} />
          </div>
        </div>

        <div className="flex justify-between items-center text-center text-sm mt-3">
          <div className="flex-1">
            <div className="font-semibold text-lg">{yearsActive}</div>
            <div className="text-gray-500">Active Years</div>
          </div>

          <div className="w-px h-8 bg-gray-300 mx-3"></div>

          <div className="flex-1">
            <div className="font-semibold text-lg">
              {professor.stats.hIndex}
            </div>
            <div className="text-gray-500">H-index</div>
          </div>

          <div className="w-px h-8 bg-gray-300 mx-3"></div>

          <div className="flex-1">
            <div className="font-semibold text-lg">
              {formatCompactNumber(professor.stats.citations)}
            </div>
            <div className="text-gray-500">Citations</div>
          </div>
        </div>

        <div className="flex justify-center mt-4">
          <motion.button
            role="button"
            whileTap={{ scale: 0.97 }}
            className="bg-secondary-400 hover:bg-[#238DBF] text-white font-medium rounded-lg px-6 py-2 shadow transition cursor-pointer active:scale-95"
            onClick={(e) => {
              e.stopPropagation()
              navigate(professorDetailPath(professor.id))
            }}
          >
            Show Professor
          </motion.button>
        </div>
      </motion.div>

      {/* RIGHT: details panel – only if expandable */}
      <AnimatePresence initial={false} mode="popLayout">
        {canExpand && expanded && (
          <motion.aside
            key="meta"
            className="absolute top-0 left-full h-full bg-white/95 backdrop-blur-lg border-l shadow-lg rounded-r-[24px]"
            style={{ width: "100%" }}
            initial={{
              x: Math.min(panelWidth, 320),
              opacity: 0,
              filter: "blur(5px)",
            }}
            animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{
              x: Math.min(panelWidth, 320),
              opacity: 0,
              filter: "blur(5px)",
            }}
            transition={{ duration: 0.45, ease: smoothEasing }}
            onClick={stop}
          >
            <div className="flex h-full flex-col justify-between p-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">About</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {professor.about ||
                      `Professor ${professor.name} specializes in ${professor.field} and leads research in the ${professor.department} department.`}
                  </p>
                </div>

                {professor.highlights?.length ? (
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Highlights</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {professor.highlights.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
