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
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={cn(
                "relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-xl p-6",
                hoverEffect && "transition-all duration-300 hover:border-white/10 hover:bg-slate-900/60 hover:shadow-xl hover:-translate-y-1",
                className
            )}
        >
            {/* Gradient Glow Effect */}
            {gradient !== "none" && (
                <div className={cn(
                    "absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity duration-500",
                    gradient === "cyan" && "bg-cyan-500",
                    gradient === "purple" && "bg-purple-500",
                    gradient === "emerald" && "bg-emerald-500",
                    gradient === "amber" && "bg-amber-500",
                )} />
            )}

            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
}
