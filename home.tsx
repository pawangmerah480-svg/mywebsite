import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { BookOpen, Star, Clock, ChevronRight, Search, Zap, Award, RotateCcw } from "lucide-react";
import { useGetStats, useGetPrayerTimes } from "@workspace/api-client-react";
import { getSurahList, RANDOM_QUOTES, JUZ_DATA, type Surah } from "@/lib/quran-api";
import { getStorage, setStorage, STORAGE_KEYS } from "@/lib/storage";

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

function PrayerWidget() {
  const { data: prayer } = useGetPrayerTimes({ city: "Jakarta", country: "ID" });
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null);

  useEffect(() => {
    if (!prayer) return;
    const now = new Date();
    const prayers = [
      { name: "Fajr", time: prayer.timings.Fajr },
      { name: "Dhuhr", time: prayer.timings.Dhuhr },
      { name: "Asr", time: prayer.timings.Asr },
      { name: "Maghrib", time: prayer.timings.Maghrib },
      { name: "Isha", time: prayer.timings.Isha },
    ];
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const next = prayers.find(p => {
      const [h, m] = p.time.split(":").map(Number);
      return h * 60 + m > nowMins;
    }) ?? prayers[0];
    setNextPrayer(next);
  }, [prayer]);

  if (!prayer) return (
    <div className="glass-panel rounded-2xl p-4 animate-pulse">
      <div className="h-4 bg-white/5 rounded w-1/2 mb-2" />
      <div className="h-6 bg-white/5 rounded w-1/3" />
    </div>
  );

  return (
    <motion.div {...fadeUp} className="glass-panel rounded-2xl p-5 box-glow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Clock className="w-4 h-4 text-primary" />
          <span>Waktu Sholat</span>
        </div>
        <span className="text-xs text-muted-foreground">{prayer.hijriDate}</span>
      </div>
      {nextPrayer && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-1">Sholat Berikutnya</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary text-glow">{nextPrayer.time}</span>
            <span className="text-sm text-foreground">{nextPrayer.name}</span>
          </div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        {[
          { name: "Subuh", time: prayer.timings.Fajr },
          { name: "Dzuhur", time: prayer.timings.Dhuhr },
          { name: "Ashar", time: prayer.timings.Asr },
          { name: "Magrib", time: prayer.timings.Maghrib },
          { name: "Isya", time: prayer.timings.Isha },
          { name: "Syuruq", time: prayer.timings.Sunrise },
        ].map(p => (
          <div key={p.name} className="bg-white/5 rounded-xl p-2 text-center">
            <p className="text-[10px] text-muted-foreground">{p.name}</p>
            <p className="text-xs font-semibold text-foreground">{p.time}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function TasbihCounter() {
  const [count, setCount] = useState(() => getStorage<number>(STORAGE_KEYS.TASBIH, 0));
  const [ripple, setRipple] = useState(false);
  const TASBIH_LABELS = ["SubhanAllah", "Alhamdulillah", "Allahu Akbar"];
  const current = TASBIH_LABELS[Math.floor(count / 33) % 3];

  const tap = () => {
    const newCount = count + 1;
    setCount(newCount);
    setStorage(STORAGE_KEYS.TASBIH, newCount);
    setRipple(true);
    setTimeout(() => setRipple(false), 300);
  };

  const reset = () => {
    setCount(0);
    setStorage(STORAGE_KEYS.TASBIH, 0);
  };

  return (
    <motion.div {...fadeUp} className="glass-panel rounded-2xl p-5 text-center">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground">Tasbih Digital</h3>
        <button onClick={reset} className="text-muted-foreground hover:text-primary transition-colors" data-testid="button-reset-tasbih">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
      <button
        onClick={tap}
        data-testid="button-tasbih"
        className={`relative w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/40 flex items-center justify-center text-3xl font-bold text-primary transition-all duration-150 active:scale-95 ${ripple ? "ring-4 ring-primary/30" : ""} hover:border-primary/70 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] cursor-pointer`}
      >
        {count % 33 === 0 && count > 0 ? "33" : count % 33}
      </button>
      <p className="mt-3 text-sm font-medium text-primary">{current}</p>
      <p className="text-xs text-muted-foreground mt-1">Total: {count}</p>
    </motion.div>
  );
}

export default function Home() {
  const [surahList, setSurahList] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "Meccan" | "Medinan">("all");
  const [quoteIdx] = useState(() => Math.floor(Math.random() * RANDOM_QUOTES.length));
  const lastRead = getStorage<{ surahId: number; surahName: string; ayatNumber: number } | null>(STORAGE_KEYS.LAST_READ, null);
  const { data: stats } = useGetStats();

  useEffect(() => {
    getSurahList().then(list => {
      setSurahList(list);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = surahList.filter(s => {
    const matchSearch = !search || s.englishName.toLowerCase().includes(search.toLowerCase()) || s.name.includes(search) || String(s.number).includes(search);
    const matchFilter = filter === "all" || s.revelationType === filter;
    return matchSearch && matchFilter;
  });

  const quote = RANDOM_QUOTES[quoteIdx];

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-3xl mx-auto"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary/30 to-primary/5 border border-primary/20 flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.3)]"
          >
            <BookOpen className="w-10 h-10 text-primary" />
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            <span className="text-foreground">Baca Al-Qur'an</span>
            <br />
            <span className="text-primary text-glow">Dengan Nyaman</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Pengalaman membaca Al-Qur'an yang cinematic, cerdas, dan penuh makna.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/read/1">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(16,185,129,0.4)" }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-base transition-all duration-200"
                data-testid="button-start-reading"
              >
                Mulai Membaca
              </motion.button>
            </Link>
            {lastRead ? (
              <Link href={`/read/${lastRead.surahId}`}>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-3 rounded-2xl glass-panel border border-primary/20 text-primary font-semibold text-base transition-all duration-200 hover:border-primary/50"
                  data-testid="button-continue-reading"
                >
                  Lanjutkan — {lastRead.surahName} : {lastRead.ayatNumber}
                </motion.button>
              </Link>
            ) : (
              <Link href="/bookmark">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-3 rounded-2xl glass-panel border border-white/10 text-muted-foreground font-semibold text-base transition-all duration-200 hover:border-white/20"
                  data-testid="button-bookmarks"
                >
                  Lihat Bookmark
                </motion.button>
              </Link>
            )}
          </div>
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80 pointer-events-none" />
      </section>

      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Stats */}
        <motion.div
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-5 gap-3"
        >
          {[
            { label: "Total Surah", value: stats?.totalSurah ?? 114, icon: BookOpen, color: "text-primary" },
            { label: "Total Ayat", value: stats?.totalAyat ?? 6236, icon: Star, color: "text-secondary" },
            { label: "Total Juz", value: stats?.totalJuz ?? 30, icon: AlignJustify, color: "text-primary" },
            { label: "Pengguna", value: stats ? `${(stats.totalUsers / 1000).toFixed(0)}K+` : "12K+", icon: Award, color: "text-secondary" },
            { label: "Bookmark", value: stats ? `${(stats.totalBookmarks / 1000).toFixed(0)}K+` : "45K+", icon: Zap, color: "text-primary" },
          ].map(stat => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              className="glass-panel rounded-2xl p-4 text-center hover:box-glow transition-all duration-300"
            >
              <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Random Quote */}
        <motion.div {...fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }} className="glass-panel rounded-3xl p-8 text-center box-glow border border-primary/10">
          <p className="text-3xl md:text-4xl font-bold text-foreground leading-relaxed mb-4" style={{ fontFamily: "'Cairo', sans-serif", direction: "rtl" }}>
            {quote.arabic}
          </p>
          <p className="text-muted-foreground text-base italic mb-2">"{quote.translation}"</p>
          <span className="text-xs text-primary/70">{quote.surah}</span>
        </motion.div>

        {/* Widgets Row */}
        <div className="grid md:grid-cols-2 gap-4">
          <PrayerWidget />
          <TasbihCounter />
        </div>

        {/* Surah List */}
        <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={stagger}>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Cari surah..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-panel border border-white/10 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-all duration-200"
                data-testid="input-search-surah"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "Meccan", "Medinan"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${filter === f ? "bg-primary text-primary-foreground" : "glass-panel text-muted-foreground hover:text-foreground"}`}
                  data-testid={`filter-${f.toLowerCase()}`}
                >
                  {f === "all" ? "Semua" : f === "Meccan" ? "Makkiyah" : "Madaniyah"}
                </button>
              ))}
            </div>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="glass-panel rounded-2xl p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-xl" />
                    <div className="flex-1">
                      <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-white/5 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map(surah => (
                <motion.div key={surah.number} variants={fadeUp}>
                  <Link href={`/read/${surah.number}`}>
                    <motion.div
                      whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(16,185,129,0.1)" }}
                      className="glass-panel rounded-2xl p-4 flex items-center gap-3 cursor-pointer border border-white/5 hover:border-primary/20 transition-all duration-200"
                      data-testid={`card-surah-${surah.number}`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {surah.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-foreground truncate">{surah.englishName}</p>
                          <p className="text-sm text-right text-foreground ml-2 shrink-0" style={{ fontFamily: "'Cairo', sans-serif" }}>
                            {surah.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${surah.revelationType === "Meccan" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}>
                            {surah.revelationType === "Meccan" ? "Makkiyah" : "Madaniyah"}
                          </span>
                          <span className="text-xs text-muted-foreground">{surah.numberOfAyahs} ayat</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function AlignJustify({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}