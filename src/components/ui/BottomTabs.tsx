"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Users, Scissors, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const tabs = [
  { name: "Início", href: "/", icon: Home },
  { name: "Agenda", href: "/agenda", icon: Calendar },
  { name: "Fila", href: "/fila", icon: Users },
  { name: "Serviços", href: "/servicos", icon: Scissors },
  { name: "Financeiro", href: "/financeiro", icon: DollarSign },
];

export function BottomTabs() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border z-50 px-2 pb-safe">
      <nav className="h-full flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-primary transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-tab-indicator"
                  className="absolute top-0 w-8 h-1 bg-primary rounded-b-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon
                className={cn(
                  "w-6 h-6 mb-1 transition-all duration-200",
                  isActive ? "text-primary scale-110" : ""
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium transition-all duration-200",
                  isActive ? "text-primary" : ""
                )}
              >
                {tab.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
