// ModalContainer.tsx
import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface ModalContainerProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export function ModalContainer({
  title,
  description,
  children,
}: ModalContainerProps) {
  return (
    <div className="fixed inset-0 z-50 px-[10vw] md:px-[15vw] lg:px-[20vw] xl:px-[25vw] py-[15vh] pointer-events-none">
      <motion.div
        className="bg-white rounded-xl shadow-xl w-full h-full p-6 overflow-hidden pointer-events-auto flex flex-col"
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        {/* Text Section */}
        <div className="mb-4 text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {title}
          </h2>

          {description && (
            <p className="mt-2 text-sm text-gray-600">
              {description}
            </p>
          )}
        </div>

        {/* Replaceable Content */}
        <div className="flex-1 min-h-0">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
