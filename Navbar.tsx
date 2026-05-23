import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Search, BookOpen, Moon, Brain, Compass, Heart, Trophy, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/learn", label: "Belajar" },
  { href: "/journey", label: "Perjalanan" },
  { href: "/healing", label: "Healing" },
  { href: "/rank", label: "Rank" },
  { href: "/dashboard", label: "Dashboard" },
];

const MORE_LINKS = [
  { href: "/juz", label: "Juz" },
  { href: "/community", label: "Komunitas" },
  { href: "/quiz", label: "Quiz" },
  { href: "/prayer", label: "Waktu Sholat" },
  { href: "/progress", label: "Progress" },
  { href: "/bookmark", label: "Bookmark" },
  { href: "/ramadan", label: "Ramadan" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setMoreOpen(false); }, [location]);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "backdrop-blur-2xl bg-black/60 border-b border-white/5 shadow-2xl" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <span className="flex items-center gap-2 cursor-pointer group">
              <span className="text-primary text-2xl"><BookOpen className="w-7 h-7" /></span>
              <span className="font-bold text-lg tracking-tight text-glow text-primary">Al-Qur'an AI</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href}>
                <span className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${location === link.href ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}>
                  {link.label}
                </span>
              </Link>
            ))}
            <div className="relative">
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200"
              >
                Lainnya ▾
              </button>
              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 w-44 glass-panel rounded-2xl p-2 border border-white/10"
                  >
                    {MORE_LINKS.map(link => (
                      <Link key={link.href} href={link.href}>
                        <span className={`block px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 ${location === link.href ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}>
                          {link.label}
                        </span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/ai-search">
              <button className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200" data-testid="button-search">
                <Search className="w-5 h-5" />
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 hidden lg:flex">
                <LayoutGrid className="w-5 h-5" />
              </button>
            </Link>
            <button
              className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-200"
              onClick={() => setMenuOpen(!menuOpen)}
              data-testid="button-menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-0 right-0 z-40 glass-panel border-b border-white/10 lg:hidden max-h-[80vh] overflow-y-auto"
          >
            <nav className="flex flex-col p-4 gap-1">
              {[...NAV_LINKS, ...MORE_LINKS].map(link => (
                <Link key={link.href} href={link.href}>
                  <span className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${location === link.href ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}>
                    {link.label}
                  </span>
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}