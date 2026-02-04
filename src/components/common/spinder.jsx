import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLoading } from "@/context/LoadingContext";

const ANIMATION_DURATION = 0.3;

export function LoadingSpinner() {
  const { isLoading } = useLoading();

  return createPortal(
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          key="loading-overlay"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: ANIMATION_DURATION }}
        >
          <motion.div
            className="relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: ANIMATION_DURATION }}
          >
            {/* Spinner ngoài */}
            <motion.div
              className="h-16 w-16 rounded-full border-4 border-white/20 border-t-white"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            />
            
            {/* Spinner trong */}
            <motion.div
              className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-b-white/40"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            />
            
            {/* Loading text */}
            <motion.p
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-medium text-white whitespace-nowrap"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Loading...
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}