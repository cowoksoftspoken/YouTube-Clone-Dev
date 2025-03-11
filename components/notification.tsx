import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const Notification = ({
  type = "info",
  text,
  duration = 3000,
}: {
  type: "success" | "error" | "info";
  text: string;
  duration: number;
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  const typeStyles = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    info: "bg-blue-500 text-white",
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "fixed bottom-5 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-md",
            "dark:bg-gray-900 dark:text-white dark:shadow-lg",
            typeStyles[type]
          )}
        >
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification;
