"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Flag, HeartPulse, Mountain, ScrollText, Settings } from "lucide-react";
import type { ReactNode } from "react";
import { APP_NAME, NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const iconMap = {
  "/dashboard": Mountain,
  "/checkin": HeartPulse,
  "/plan": Flag,
  "/history": ScrollText,
  "/analytics": Compass,
  "/settings": Settings,
} as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-28 pt-4 md:max-w-5xl md:px-6">
      <header className="glass-card mb-4 rounded-[28px] px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="mini-label">6か月の伴走アプリ</p>
            <h1 className="font-[var(--font-ui)] text-xl font-semibold tracking-tight">
              {APP_NAME}
            </h1>
          </div>
          <div className="pill">
            <Mountain className="h-4 w-4" />
            継続優先
          </div>
        </div>
      </header>

      <main className="page-grid flex-1">{children}</main>

      <nav className="glass-card fixed inset-x-4 bottom-4 z-20 rounded-[26px] px-2 py-2 md:inset-x-auto md:left-1/2 md:w-[720px] md:-translate-x-1/2">
        <ul className="grid grid-cols-6 gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.href as keyof typeof iconMap];
            const active = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 rounded-[18px] px-2 py-3 text-[11px] font-medium text-[var(--muted)] transition-colors",
                    active && "bg-white text-[var(--primary)] shadow-sm",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
