import { Link, useLocation } from "wouter";
import { Home, Brain, Compass, Heart, LayoutGrid } from "lucide-react";

const BOTTOM_NAV = [
  { href: "/", icon: Home, label: "Beranda" },
  { href: "/learn", icon: Brain, label: "Belajar" },
  { href: "/journey", icon: Compass, label: "Journey" },
  { href: "/healing", icon: Heart, label: "Healing" },
  { href: "/dashboard", icon: LayoutGrid, label: "Dashboard" },
];

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-white/10">
      <div className="flex items-center justify-around px-2 py-2">
        {BOTTOM_NAV.map((item) => {
          const isActive =
            location === item.href ||
            (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <button
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all duration-200 ${isActive ? "text-primary" : "text-muted-foreground"}`}
              >
                <item.icon
                  className={`w-5 h-5 transition-all duration-200 ${isActive ? "drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" : ""}`}
                />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
