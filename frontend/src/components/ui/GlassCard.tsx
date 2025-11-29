import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import type { ReactNode } from "react";

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    hoverEffect?: boolean;
    gradient?: "none" | "cyan" | "purple" | "emerald" | "amber";
}

export function GlassCard({
    children,
    className,
    hoverEffect = true,
    gradient = "none"
}: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }} // Smooth cubic-bezier
            className={cn(
                "liquid-glass p-8", // Use the new utility class
                hoverEffect && "hover:scale-[1.01]", // Subtle scale on hover
                className
            )}
        >
            {/* Dynamic Light Reflection (Crystal Edge enhancement) */}
            <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10 pointer-events-none" />

            {/* Gradient Glow Effect (Refined for Liquid look) */}
            {gradient !== "none" && (
                <div className={cn(
                    "absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[80px] opacity-30 pointer-events-none transition-opacity duration-700 mix-blend-screen",
                    gradient === "cyan" && "bg-cyan-400",
                    gradient === "purple" && "bg-purple-400",
                    gradient === "emerald" && "bg-emerald-400",
                    gradient === "amber" && "bg-amber-400",
                )} />
            )}

            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
}
