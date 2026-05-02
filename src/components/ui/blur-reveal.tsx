"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface BlurRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function BlurReveal({
  children,
  className,
  delay = 0,
  duration = 0.8,
}: BlurRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
      whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: duration,
        delay: delay,
        type: "spring",
        stiffness: 100,
        damping: 20,
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
