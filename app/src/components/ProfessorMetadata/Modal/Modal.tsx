// Modal.tsx -> for Email/SOP Display
import { AnimatePresence } from "framer-motion";
import { type ModalProps } from "./modalType";
import { ModalBackdrop } from "./ModalBackdrop";
import { ModalContainer } from "./ModalContainer";
import { useEffect } from "react";

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
}: ModalProps) {
  
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <ModalBackdrop onClick={onClose} />
          <ModalContainer title={title} description={description}>
            {children}
          </ModalContainer>
        </>
      )}
    </AnimatePresence>
  );
}
