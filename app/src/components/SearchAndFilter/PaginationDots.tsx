"use client"

import { motion } from "framer-motion"

interface PaginationDotsProps {
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
}

interface eachProps {
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
  isActive: boolean
  page: number
}

function eachPaginationDot({ totalPages, currentPage, onPageChange, isActive, page }: eachProps)
{
        return (
          <motion.button
            key={page}
            onClick={() => onPageChange(page)}
            whileTap={{ scale: 0.9 }}
            className={`flex items-center justify-center text-sm font-medium transition-all ${
              isActive
                ? "w-10 h-7 rounded-full bg-gray-800 text-white"
                : "w-7 h-7 rounded-full bg-gray-300 text-gray-700 hover:bg-gray-400"
            }`}
          >
            {page}
          </motion.button>
        );
}

export default function PaginationDots({
  totalPages,
  currentPage,
  onPageChange,
}: PaginationDotsProps) {
  return (
    <div className="flex justify-center items-center gap-3 mt-8 select-none">
      {Array.from({ length: totalPages }, (_, i) => {
        const page = i + 1
        const isActive = page === currentPage
        if((page === currentPage+2 && page !== totalPages) || (page === currentPage-2 && page !== 1))
        {
          return (
            <div className="font-bold text-xl">. . .</div>
          )
        }
        else if(page === currentPage || page === currentPage+1 || page === currentPage-1 || page === 1 || page === totalPages)
        {
          return eachPaginationDot({totalPages, currentPage, onPageChange, isActive, page})
        }
      })}
    </div>
  )
}
