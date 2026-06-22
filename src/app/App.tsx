import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TapEvent {
  id: number;
  xPct: number;
  yPct: number;
  value: number;
}

type TabId = "game" | "artifacts" | "expedition" | "profile" | "settings";

// ─── Game Data (demo) ─────────────────────────────────────────────────────────

const EPOCH = {
  name: "Козацька доба",
  period: "XVI–XVII ст.",
  icon: "🏇",
  currencyIcon: "🪙",
  currencyName: "Дукати",
};

const GENERATORS = [
  { id: 1, name: "Козацький табір", icon: "⛺", level: 8,  production: 12,  cost: 24_000,  canBuyAt: 24_000  },
  { id: 2, name: "Січ Запорозька",  icon: "🏰", level: 5,  production: 45,  cost: 87_000,  canBuyAt: 87_000  },
  { id: 3, name: "Чайки та гармати",icon: "⚓", level: 3,  production: 120, cost: 210_000, canBuyAt: 210_000 },
  { id: 4, name: "Гетьманська рада",icon: "📜", level: 1,  production: 310, cost: 580_000, canBuyAt: 580_000 },
];

const TASKS = [
  { id: 1, icon: "👆", name: "Натисни 500 разів",    progress: 342, target: 500, reward: "2 500 🪙", claimed: false },
  { id: 2, icon: "🏗️", name: "Купи генератор 3 рази", progress: 1,   target: 3,   reward: "500 XP",   claimed: false },
  { id: 3, icon: "📦", name: "Відкрий артефакт",      progress: 1,   target: 1,   reward: "1 000 🪙", claimed: true  },
];

const ARTIFACTS = [
  { name: "Козацька шабля",   icon: "⚔️", rarity: "Legendary", level: 3, bonus: "XP ×2.5"    },
  { name: "Бунчук гетьмана",  icon: "🏳️", rarity: "Epic",      level: 2, bonus: "Пасив ×1.8"  },
  { name: "Люлька кошового",  icon: "🪬", rarity: "Rare",      level: 4, bonus: "Монет ×1.4"  },
  { name: "Сагайдак та лук",  icon: "🏹", rarity: "Common",    level: 1, bonus: "XP ×1.2"    },
  { name: "Порохівниця",      icon: "💣", rarity: "Rare",      level: 2, bonus: "Монет ×1.3"  },
  { name: "Козацький барабан",icon: "🥁", rarity: "Epic",      level: 1, bonus: "Пасив ×1.5"  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "М";
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + "К";
  return n.toString();
}

function fmtTime(minutes: number): string {
  if (minutes >= 60) return `${Math.floor(minutes / 60)}г ${minutes % 60}хв`;
  return `${minutes}хв`;
}

// ─── SVG Decorations ─────────────────────────────────────────────────────────

function CornerOrnament({ flipX, flipY }: { flipX?: boolean; flipY?: boolean }) {
  return (
    <svg
      viewBox="0 0 44 44"
      fill="none"
      className="w-11 h-11"
      style={{ transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})` }}
    >
      <path d="M4 40 L4 4 L40 4" stroke="#F5C842" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
      <path d="M4 4 Q22 4 22 22" stroke="#F5C842" strokeWidth="0.7" strokeDasharray="2.5 2.5" opacity="0.2" />
      <circle cx="4"  cy="4"  r="2.5" fill="#F5C842" opacity="0.5" />
      <circle cx="4"  cy="40" r="1.5" fill="#F5C842" opacity="0.25" />
      <circle cx="40" cy="4"  r="1.5" fill="#F5C842" opacity="0.25" />
    </svg>
  );
}

function GridTexture() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="hg" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M0 0 L28 0 M0 0 L0 28" stroke="#F5C842" strokeWidth="0.3" opacity="0.1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hg)" />
    </svg>
  );
}

function OrnamentalDivider() {
  return (
    <svg viewBox="0 0 240 10" fill="none" className="w-full h-2.5 text-amber-400/30">
      <path d="M0 5 Q30 1 60 5 Q90 9 120 5 Q150 1 180 5 Q210 9 240 5" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="60"  cy="5" r="1.5" fill="currentColor" opacity="0.5" />
      <circle cx="120" cy="5" r="2"   fill="currentColor" opacity="0.6" />
      <circle cx="180" cy="5" r="1.5" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

// ─── Inline Icons ─────────────────────────────────────────────────────────────

function IcoGamepad({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="3"/>
      <path d="M6 12h4M8 10v4M15 11h2M15 13h2"/>
    </svg>
  );
}
function IcoGem({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="6,3 18,3 22,9 12,21 2,9"/>
      <polyline points="2,9 12,13 22,9"/>
      <line x1="12" y1="3" x2="12" y2="13"/>
    </svg>
  );
}
function IcoSword({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 9.5L3 21M5 17l-2 2M3 19l2-2M21 3l-9.5 9.5M16 3h5v5l-9 9-5-5 9-9z"/>
    </svg>
  );
}
function IcoUser({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  );
}
function IcoSettings({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  );
}
function IcoLock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────

function Header({ level, xp, xpToNext, currency, passivePerSec }: {
  level: number; xp: number; xpToNext: number; currency: number; passivePerSec: number;
}) {
  const pct = Math.min(100, (xp / xpToNext) * 100);
  return (
    <div className="shrink-0 bg-[#07090F]/98 backdrop-blur-sm border-b border-amber-400/10"
         style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="px-4 pt-2.5 pb-2">
        {/* Top row */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          {/* Epoch badge */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0 text-lg">
              {EPOCH.icon}
            </div>
            <div className="min-w-0">
              <div
                className="text-amber-300 text-xs font-semibold tracking-wide uppercase leading-tight truncate"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {EPOCH.name}
              </div>
              <div className="text-amber-400/40 text-[10px] leading-tight">{EPOCH.period}</div>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Passive */}
            <div className="text-right">
              <div className="text-[9px] text-white/30 leading-none uppercase tracking-wide">Пасив</div>
              <div className="text-green-400 text-xs font-bold leading-tight" style={{ fontFamily: "'DM Mono', monospace" }}>
                +{fmt(passivePerSec)}/с
              </div>
            </div>
            {/* Currency */}
            <div className="text-right">
              <div className="text-[9px] text-white/30 leading-none uppercase tracking-wide">{EPOCH.currencyIcon}</div>
              <div className="text-amber-300 text-xs font-bold leading-tight" style={{ fontFamily: "'DM Mono', monospace" }}>
                {fmt(currency)}
              </div>
            </div>
            {/* Level pill */}
            <div
              className="bg-amber-400 text-[#070A13] font-bold text-sm rounded-xl px-2.5 py-1 min-w-[2.75rem] text-center shadow-[0_0_12px_rgba(245,200,66,0.3)]"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {level}
            </div>
          </div>
        </div>

        {/* XP bar row */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-white/30 uppercase tracking-widest shrink-0">XP</span>
          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-300"
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          </div>
          <span
            className="text-[9px] text-white/30 shrink-0 tabular-nums"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            {fmt(xp)}/{fmt(xpToNext)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Ad Banner ────────────────────────────────────────────────────────────────

function AdBanner({ position }: { position: "top" | "bottom" }) {
  return (
    <div className={`shrink-0 px-3 ${position === "top" ? "pt-2 pb-1" : "pt-1 pb-2"}`}>
      <div className="relative h-12 rounded-2xl border border-white/8 bg-[#0B0E17] overflow-hidden flex items-center px-3 gap-3 cursor-pointer active:opacity-75 transition-opacity">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/10 via-transparent to-purple-900/10" />
        {/* Ad icon */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/25 to-purple-600/25 border border-indigo-400/20 flex items-center justify-center shrink-0">
          <span className="text-sm">🎮</span>
        </div>
        {/* Copy */}
        <div className="flex-1 min-w-0">
          <div className="text-white/60 text-xs font-medium leading-none truncate">Discover the best strategy game</div>
          <div className="text-white/25 text-[9px] leading-none mt-0.5 uppercase tracking-wider">Sponsored</div>
        </div>
        {/* CTA */}
        <div className="shrink-0 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white/40 text-[10px] uppercase tracking-wide">AD</span>
        </div>
      </div>
    </div>
  );
}

// ─── Tap Medallion ───────────────────────────────────────────────────────────

function TapMedallion({ onTap, tapPower }: { onTap: () => void; tapPower: number }) {
  const [pressing, setPressing] = useState(false);

  const fire = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onTap();
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-0">
      {/* Outer pulse rings */}
      <div className="absolute w-56 h-56 rounded-full border border-amber-400/12 animate-ping"
           style={{ animationDuration: "3.2s" }} />
      <div className="absolute w-48 h-48 rounded-full border border-amber-400/18 animate-ping"
           style={{ animationDuration: "2.4s", animationDelay: "0.8s" }} />

      {/* Tick marks on decorative ring */}
      <div className="absolute w-[10.5rem] h-[10.5rem] rounded-full border border-amber-400/25">
        {[0,45,90,135,180,225,270,315].map(deg => (
          <div
            key={deg}
            className="absolute inset-0 flex justify-center"
            style={{ transform: `rotate(${deg}deg)` }}
          >
            <div className="w-px h-2 bg-amber-400/40 rounded-full" />
          </div>
        ))}
      </div>

      {/* Ambient glow */}
      <div className="absolute w-36 h-36 rounded-full bg-amber-400/8 blur-2xl" />

      {/* Main button */}
      <motion.button
        animate={{ scale: pressing ? 0.90 : 1 }}
        transition={{ duration: 0.09, ease: "easeOut" }}
        className="relative w-32 h-32 rounded-full flex flex-col items-center justify-center
          bg-gradient-to-b from-[#1E1A06] to-[#0E0C04]
          border-2 border-amber-400/40
          shadow-[0_0_48px_rgba(245,200,66,0.12),inset_0_1px_4px_rgba(255,255,255,0.08),inset_0_-2px_6px_rgba(0,0,0,0.5)]
          cursor-pointer"
        onTouchStart={e => { setPressing(true); fire(e); }}
        onTouchEnd={() => setPressing(false)}
        onMouseDown={e => { setPressing(true); fire(e); }}
        onMouseUp={() => setPressing(false)}
        onMouseLeave={() => setPressing(false)}
      >
        {/* Inner ring */}
        <div className="absolute inset-2.5 rounded-full border border-amber-400/15" />
        {/* Icon */}
        <span className="text-5xl select-none relative z-10 -mt-1">{EPOCH.icon}</span>
        <span className="text-[9px] text-amber-400/50 uppercase tracking-[3px] mt-0.5 relative z-10 select-none">
          Натисни
        </span>
      </motion.button>

      {/* Tap power badge */}
      <div className="mt-4">
        <div className="bg-[#070A13]/90 border border-amber-400/20 rounded-full px-3 py-1 flex items-center gap-1.5">
          <span className="text-amber-400 text-xs">⚡</span>
          <span
            className="text-amber-300 text-[11px] font-bold"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            +{tapPower} XP
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Atmospheric Game Canvas ──────────────────────────────────────────────────

function GameCanvas({ onTap, tapEvents, tapPower }: {
  onTap: () => void;
  tapEvents: TapEvent[];
  tapPower: number;
}) {
  return (
    <div className="relative w-full h-full bg-gradient-to-b from-[#0D1E10] via-[#091210] to-[#070A13] overflow-hidden">
      <GridTexture />

      {/* Radial center glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-72 rounded-full bg-amber-400/5 blur-[60px]" />
      </div>

      {/* Corner ornaments */}
      <div className="absolute top-2 left-2 pointer-events-none"><CornerOrnament /></div>
      <div className="absolute top-2 right-2 pointer-events-none"><CornerOrnament flipX /></div>
      <div className="absolute bottom-10 left-2 pointer-events-none"><CornerOrnament flipY /></div>
      <div className="absolute bottom-10 right-2 pointer-events-none"><CornerOrnament flipX flipY /></div>

      {/* Era label */}
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 text-amber-400/20 text-[10px] uppercase tracking-[5px] font-semibold select-none"
        style={{ fontFamily: "'Cinzel', serif" }}
      >
        {EPOCH.period}
      </div>

      {/* Tap medallion */}
      <TapMedallion onTap={onTap} tapPower={tapPower} />

      {/* Floating XP numbers */}
      <AnimatePresence>
        {tapEvents.map(ev => (
          <motion.div
            key={ev.id}
            className={`absolute pointer-events-none select-none font-bold ${
              ev.value >= 100 ? "text-amber-300 text-xl" : "text-yellow-200/90 text-base"
            }`}
            style={{
              left: `${ev.xPct}%`,
              top: `${ev.yPct}%`,
              fontFamily: "'DM Mono', monospace",
              textShadow: "0 0 14px rgba(245,200,66,0.7)",
            }}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -72, scale: ev.value >= 100 ? 1.3 : 1.05 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.05, ease: "easeOut" }}
          >
            +{ev.value}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Bottom ambient labels */}
      <div className="absolute bottom-3 left-4 right-4 flex justify-between pointer-events-none">
        <span className="text-amber-400/25 text-[10px] font-mono">Рівень 42 / 960</span>
        <span className="text-amber-400/25 text-[10px] font-mono">#7 у грі</span>
      </div>
    </div>
  );
}

// ─── Booster Bar ─────────────────────────────────────────────────────────────

function BoosterBar({ boosts, energy, maxEnergy, streak }: {
  boosts: { type: string; multiplier: number; minutesLeft: number }[];
  energy: number; maxEnergy: number; streak: number;
}) {
  const energyPct = Math.min(100, (energy / maxEnergy) * 100);
  const low = energyPct < 30;
  return (
    <div className="shrink-0 bg-[#07090F]/95 backdrop-blur-sm border-t border-b border-amber-400/8 px-4 py-2.5">
      <div className="flex items-center justify-between gap-3">
        {/* Active boosts */}
        <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
          {boosts.map((b, i) => (
            <div
              key={i}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                b.type === "xp"
                  ? "bg-amber-400/10 border-amber-400/25 text-amber-300"
                  : "bg-green-400/10 border-green-400/25 text-green-300"
              }`}
            >
              <span>{b.type === "xp" ? "⚡" : "💰"}</span>
              <span>×{b.multiplier}</span>
              <span className="opacity-50">{fmtTime(b.minutesLeft)}</span>
            </div>
          ))}
          {boosts.length === 0 && (
            <span className="text-white/25 text-[10px]">Немає активних бустів</span>
          )}
          <button className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-purple-400/25 bg-purple-400/10 text-purple-300 active:scale-95 transition-transform">
            <span>▶</span>
            <span>+30хв</span>
          </button>
        </div>

        {/* Energy + Streak */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs">⚡</span>
            <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${low ? "bg-red-400" : "bg-yellow-400"}`}
                style={{ width: `${energyPct}%` }}
              />
            </div>
            <span
              className={`text-[10px] font-mono shrink-0 ${low ? "text-red-400/70" : "text-white/40"}`}
              style={{ fontFamily: "'DM Mono', monospace" }}
            >
              {energy}
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            <span className="text-sm">🔥</span>
            <span className="text-amber-300 text-[11px] font-bold" style={{ fontFamily: "'DM Mono', monospace" }}>
              {streak}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Generator Card ───────────────────────────────────────────────────────────

function GeneratorCard({ gen, currency }: { gen: typeof GENERATORS[0]; currency: number }) {
  const canBuy = currency >= gen.cost;
  return (
    <div className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
      canBuy ? "border-amber-400/20 bg-card" : "border-white/5 bg-card opacity-55"
    }`}>
      <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0 text-xl">
        {gen.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-white/90 text-sm font-semibold truncate">{gen.name}</span>
          <span className="bg-amber-400/15 text-amber-400/80 text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0">
            Lv.{gen.level}
          </span>
        </div>
        <div className="text-green-400/70 text-[10px]">+{fmt(gen.production)} XP/с</div>
      </div>
      <div className="shrink-0">
        <button
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
            canBuy ? "bg-primary text-primary-foreground hover:brightness-110" : "bg-white/5 text-white/25 cursor-not-allowed"
          }`}
          disabled={!canBuy}
        >
          <div className="text-[9px] opacity-70 leading-none">{EPOCH.currencyIcon}</div>
          <div style={{ fontFamily: "'DM Mono', monospace" }}>{fmt(gen.cost)}</div>
        </button>
      </div>
    </div>
  );
}

// ─── Daily Tasks ─────────────────────────────────────────────────────────────

function DailyTasksCard() {
  const [open, setOpen] = useState(true);
  const claimable = TASKS.filter(t => !t.claimed && t.progress >= t.target).length;

  return (
    <div className="rounded-2xl border border-amber-400/15 bg-card overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-3.5 active:bg-white/5 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🔥</span>
          <span className="text-white/90 text-sm font-semibold" style={{ fontFamily: "'Cinzel', serif" }}>
            Щоденні завдання
          </span>
          {claimable > 0 && (
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/35 text-xs">
            {TASKS.filter(t => t.claimed).length}/3
          </span>
          <span className={`text-white/30 text-xs transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
            ▼
          </span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3.5 space-y-2">
              {TASKS.map(task => {
                const done = task.progress >= task.target;
                return (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border ${
                      task.claimed
                        ? "bg-green-900/20 border-green-400/15"
                        : done
                        ? "bg-amber-400/10 border-amber-400/20"
                        : "bg-white/5 border-white/5"
                    }`}
                  >
                    <span className="text-sm shrink-0">{task.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-white/80 text-xs font-medium mb-1 leading-tight">{task.name}</div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            task.claimed ? "bg-green-400" : done ? "bg-amber-400" : "bg-amber-400/50"
                          }`}
                          style={{ width: `${Math.min(100, (task.progress / task.target) * 100)}%` }}
                        />
                      </div>
                      <div className="text-white/25 text-[9px] mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>
                        {task.progress}/{task.target}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {task.claimed ? (
                        <span className="text-green-400 text-base">✓</span>
                      ) : done ? (
                        <button className="bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-lg active:scale-95 transition-transform whitespace-nowrap">
                          {task.reward}
                        </button>
                      ) : (
                        <span className="text-white/25 text-[10px] whitespace-nowrap">{task.reward}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Artifacts Tab ────────────────────────────────────────────────────────────

const RARITY_STYLES: Record<string, string> = {
  Legendary: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  Epic:      "border-purple-400/40 bg-purple-400/10 text-purple-300",
  Rare:      "border-blue-400/40 bg-blue-400/10 text-blue-300",
  Common:    "border-white/10 bg-white/5 text-white/50",
};

function ArtifactsTab() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-amber-400/10 flex items-center justify-between shrink-0">
        <div>
          <div className="text-white/90 font-semibold text-sm" style={{ fontFamily: "'Cinzel', serif" }}>
            Артефакти
          </div>
          <div className="text-white/35 text-xs mt-0.5">6 з 24 зібрано</div>
        </div>
        <button className="bg-primary text-primary-foreground text-xs font-bold px-3 py-2 rounded-xl active:scale-95 transition-transform">
          📦 Відкрити (500 🪙)
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-2.5">
          {ARTIFACTS.map((a, i) => (
            <div key={i} className={`p-3 rounded-2xl border ${RARITY_STYLES[a.rarity]}`}>
              <div className="text-2xl mb-2">{a.icon}</div>
              <div className="text-[11px] font-semibold text-white/90 leading-tight mb-1">{a.name}</div>
              <div className="text-[9px] opacity-50 mb-1.5 uppercase tracking-wide">{a.rarity} · Lv.{a.level}</div>
              <div className="text-[11px] font-bold">{a.bonus}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

const LEADERBOARD = [
  { rank: 1,  name: "Богдан_Петренко",  xp: "8.7М", isMe: false },
  { rank: 2,  name: "Остап_Кравченко",  xp: "6.2М", isMe: false },
  { rank: 3,  name: "Ярослав_Мороз",    xp: "5.9М", isMe: false },
  { rank: 7,  name: "Козак_Іван (Ви)",  xp: "2.4М", isMe: true  },
];

function ProfileTab({ level, currency, streak }: { level: number; currency: number; streak: number }) {
  return (
    <div className="h-full overflow-y-auto p-3 space-y-3">
      {/* Player card */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-amber-400/15">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/25 to-amber-800/25 border border-amber-400/30 flex items-center justify-center text-2xl shrink-0">
          🏇
        </div>
        <div>
          <div className="text-white/90 font-bold text-base leading-tight" style={{ fontFamily: "'Cinzel', serif" }}>
            Козак Іван
          </div>
          <div className="text-amber-400/60 text-xs mt-0.5">{EPOCH.name} · Рівень {level}</div>
          <div className="text-white/30 text-[10px] mt-0.5">ID: 2847391</div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Всього XP", value: "2.4М", icon: "⚡" },
          { label: "Серія",     value: `${streak}д`,      icon: "🔥" },
          { label: "Дукати",    value: fmt(currency),     icon: "🪙" },
        ].map((s, i) => (
          <div key={i} className="p-3 rounded-2xl bg-card border border-white/5 text-center">
            <div className="text-xl mb-1.5">{s.icon}</div>
            <div className="text-white/90 font-bold text-sm leading-none" style={{ fontFamily: "'DM Mono', monospace" }}>
              {s.value}
            </div>
            <div className="text-white/30 text-[9px] mt-1 leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="rounded-2xl bg-card border border-amber-400/15 overflow-hidden">
        <div className="px-4 py-3 border-b border-amber-400/10">
          <div className="text-amber-300/80 text-xs font-semibold uppercase tracking-wider" style={{ fontFamily: "'Cinzel', serif" }}>
            Таблиця лідерів
          </div>
        </div>
        <div className="divide-y divide-white/5">
          {LEADERBOARD.map((entry, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-3 transition-colors ${entry.isMe ? "bg-amber-400/5" : ""}`}
            >
              <span className="text-sm w-6 text-center shrink-0">
                {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : (
                  <span className="text-white/30 text-xs font-bold" style={{ fontFamily: "'DM Mono', monospace" }}>
                    {entry.rank}
                  </span>
                )}
              </span>
              <span className={`flex-1 text-sm ${entry.isMe ? "text-amber-300 font-semibold" : "text-white/70"}`}>
                {entry.name}
              </span>
              <span className="text-white/30 text-xs" style={{ fontFamily: "'DM Mono', monospace" }}>{entry.xp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Prestige teaser */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-900/30 to-purple-900/20 border border-purple-400/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-amber-400 text-sm">⭐</span>
          <span className="text-white/80 text-sm font-semibold" style={{ fontFamily: "'Cinzel', serif" }}>Переродження</span>
          <span className="bg-purple-400/20 text-purple-300 text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase">Незабаром</span>
        </div>
        <p className="text-white/40 text-xs leading-relaxed">
          Досягни рівня 960 в епоху Незалежності, щоб відродитись і відкрити Академію.
        </p>
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-white/30 mb-1">
            <span>Прогрес</span>
            <span style={{ fontFamily: "'DM Mono', monospace" }}>42/960</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full" style={{ width: "4.4%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

function SettingsTab() {
  const items = [
    { label: "Мова",          value: "Українська", icon: "🌐" },
    { label: "Звукові ефекти",value: "Увімкнено",  icon: "🔊" },
    { label: "Вібрація",      value: "Увімкнено",  icon: "📳" },
    { label: "Синхронізація", value: "Онлайн",     icon: "☁️"  },
  ];
  return (
    <div className="h-full overflow-y-auto p-3 space-y-3">
      <div className="rounded-2xl bg-card border border-white/8 overflow-hidden divide-y divide-white/5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5">
            <span className="text-base">{item.icon}</span>
            <span className="flex-1 text-white/80 text-sm">{item.label}</span>
            <span className="text-white/35 text-xs">{item.value}</span>
          </div>
        ))}
      </div>
      <div className="rounded-2xl bg-card border border-white/8 p-4 text-center">
        <div className="text-amber-400/60 text-xs">Jolt Time v1.8.0</div>
        <div className="text-white/25 text-[10px] mt-0.5">© 2025 Jolt Studio</div>
      </div>
    </div>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────

type NavItem = {
  id: TabId;
  label: string;
  Icon: React.FC<{ className?: string }>;
  badge?: number;
  locked?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { id: "game",       label: "Гра",      Icon: IcoGamepad  },
  { id: "artifacts",  label: "Реліквії", Icon: IcoGem,    badge: 2 },
  { id: "expedition", label: "Академія", Icon: IcoSword,  locked: true },
  { id: "profile",    label: "Профіль",  Icon: IcoUser     },
  { id: "settings",   label: "",         Icon: IcoSettings },
];

function Navigation({ tab, setTab }: { tab: TabId; setTab: (t: TabId) => void }) {
  return (
    <div
      className="shrink-0 bg-[#07090F]/99 border-t border-amber-400/10"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex">
        {NAV_ITEMS.map(({ id, label, Icon, badge, locked }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 relative transition-all ${
                locked ? "opacity-35" : active ? "opacity-100" : "opacity-45 hover:opacity-70"
              }`}
              onClick={() => !locked && setTab(id)}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-colors ${active ? "text-amber-400" : "text-white/60"}`} />
                {locked && (
                  <IcoLock className="absolute -top-1.5 -right-2 w-3 h-3 text-white/40" />
                )}
                {badge && !locked && (
                  <div className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-[7px] font-bold leading-none">{badge}</span>
                  </div>
                )}
              </div>
              {label && (
                <span className={`text-[10px] font-medium transition-colors ${active ? "text-amber-400" : "text-white/35"}`}>
                  {label}
                </span>
              )}
              {active && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-amber-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState<TabId>("game");
  const [tapEvents, setTapEvents] = useState<TapEvent[]>([]);
  const [state, setState] = useState({
    level:         42,
    xp:            3400,
    xpToNext:      5000,
    currency:      187_420,
    passivePerSec: 340,
    tapPower:      85,
    energy:        680,
    maxEnergy:     1000,
    dailyStreak:   7,
    boosts: [
      { type: "xp",      multiplier: 2,   minutesLeft: 47 },
      { type: "currency",multiplier: 1.5, minutesLeft: 23 },
    ],
  });

  const tapId  = useRef(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  const handleTap = useCallback(() => {
    const s = stateRef.current;
    const value = s.tapPower + Math.floor(Math.random() * Math.ceil(s.tapPower * 0.18));
    const id    = ++tapId.current;

    // Random position near center of canvas (expressed as %)
    const xPct = 42 + Math.random() * 16;
    const yPct = 28 + Math.random() * 30;

    setTapEvents(prev => [...prev.slice(-9), { id, xPct, yPct, value }]);
    setState(prev => {
      const newXp  = prev.xp + value;
      const lvlUp  = newXp >= prev.xpToNext;
      return {
        ...prev,
        xp:       lvlUp ? newXp - prev.xpToNext : newXp,
        level:    lvlUp ? prev.level + 1 : prev.level,
        currency: prev.currency + Math.floor(value * 0.38),
        energy:   Math.max(0, prev.energy - 1),
      };
    });

    setTimeout(() => setTapEvents(prev => prev.filter(e => e.id !== id)), 1100);
  }, []);

  return (
    <div
      className="h-screen flex flex-col overflow-hidden select-none bg-background text-foreground"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Header ── */}
      <Header
        level={state.level}
        xp={state.xp}
        xpToNext={state.xpToNext}
        currency={state.currency}
        passivePerSec={state.passivePerSec}
      />

      {/* ── Top Ad Slot ── */}
      <AdBanner position="top" />

      {/* ── Game Canvas (always visible) ── */}
      <div className="shrink-0 h-[248px] sm:h-[288px] md:h-[320px]">
        <GameCanvas
          onTap={handleTap}
          tapEvents={tapEvents}
          tapPower={state.tapPower}
        />
      </div>

      {/* ── Booster / Energy Bar ── */}
      <BoosterBar
        boosts={state.boosts}
        energy={state.energy}
        maxEnergy={state.maxEnergy}
        streak={state.dailyStreak}
      />

      {/* ── Divider ── */}
      <div className="shrink-0 px-4 py-1">
        <OrnamentalDivider />
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {tab === "game" && (
            <motion.div
              key="game"
              className="h-full overflow-y-auto p-3 space-y-2.5"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <DailyTasksCard />
              <div
                className="text-white/25 text-[9px] uppercase tracking-[3px] px-1 pt-1"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Генератори
              </div>
              {GENERATORS.map(gen => (
                <GeneratorCard key={gen.id} gen={gen} currency={state.currency} />
              ))}
              <div className="h-2" />
            </motion.div>
          )}

          {tab === "artifacts" && (
            <motion.div key="artifacts" className="h-full"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}>
              <ArtifactsTab />
            </motion.div>
          )}

          {tab === "profile" && (
            <motion.div key="profile" className="h-full"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}>
              <ProfileTab level={state.level} currency={state.currency} streak={state.dailyStreak} />
            </motion.div>
          )}

          {tab === "settings" && (
            <motion.div key="settings" className="h-full"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}>
              <SettingsTab />
            </motion.div>
          )}

          {tab === "expedition" && (
            <motion.div key="expedition" className="h-full flex flex-col items-center justify-center gap-4 p-6"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}>
              <div className="text-5xl">🔒</div>
              <div className="text-center">
                <div className="text-white/80 font-semibold mb-1" style={{ fontFamily: "'Cinzel', serif" }}>Академія заблокована</div>
                <div className="text-white/40 text-sm">Розблоковується на 2-му переродженні</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom Ad Slot ── */}
      <AdBanner position="bottom" />

      {/* ── Navigation ── */}
      <Navigation tab={tab} setTab={setTab} />
    </div>
  );
}
