// ModalBackdrop.tsx
import { motion } from "framer-motion";

interface ModalBackdropProps {
  onClick: () => void;
}

export function ModalBackdrop({ onClick }: ModalBackdropProps) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 z-40"
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    />
  );
}
