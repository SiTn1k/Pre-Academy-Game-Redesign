import React, { useState, useCallback, useRef } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TapEvent {
  id: number;
  xPct: number;
  yPct: number;
  value: number;
}

// ─── Epochs of Ukrainian History ───────────────────────────────────────────────

interface Epoch {
  id: number;
  name: string;
  shortName: string;
  period: string;
  description: string;
  icon: string;
  currencyIcon: string;
  currencyName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    textPrimary: string;
    border: string;
    success: string;
  };
}

export const EPOCHS: Epoch[] = [
  { id: 1, name: "Трипільська культура", shortName: "Трипілля", period: "4500–2700 до н.е.", description: "Перша велика землеробська цивілізація на території сучасної України та один з найбільших центрів ранньосередньовічної культури.", icon: "🏺", currencyIcon: "🏺", currencyName: "Глиняні мірky", colors: { primary: "#C4783C", secondary: "#8B5E34", accent: "#E8A857", background: "#1A1209", textPrimary: "#E8A857", border: "rgba(232, 168, 87, 0.2)", success: "#8BC34A" } },
  { id: 2, name: "Скіфія", shortName: "Скіфи", period: "VII–III ст. до н.е.", description: "Воїни-номади, які створили величну культуру золотого віку. Скіфське мистецтво вражає світ донині.", icon: "⚔️", currencyIcon: "🪙", currencyName: "Скіфські солиди", colors: { primary: "#D4AF37", secondary: "#8B6914", accent: "#FFD700", background: "#0D0D0D", textPrimary: "#FFD700", border: "rgba(255, 215, 0, 0.2)", success: "#90EE90" } },
  { id: 3, name: "Сарматія", shortName: "Сармати", period: "III ст. до н.е. – IV ст. н.е.", description: "Легендарні вершники, чиї традиції вплинули на культуру слов'янських народів. Амазонки — їх найвідоміші жінки-воїни.", icon: "🏇", currencyIcon: "💎", currencyName: "Бурштин", colors: { primary: "#6B8E9F", secondary: "#4A6670", accent: "#9FCDDF", background: "#0A1520", textPrimary: "#9FCDDF", border: "rgba(159, 205, 223, 0.2)", success: "#7CFC00" } },
  { id: 4, name: "Античні міста", shortName: "Елліни", period: "VI ст. до н.е. – IV ст. н.е.", description: "Грецькі колонії на теренах України — Ольвія, Херсонес, Пантікапей. Колиска античної цивілізації.", icon: "🏛️", currencyIcon: "🪼", currencyName: "Драхми", colors: { primary: "#4A90A4", secondary: "#2E5A6B", accent: "#7EC8E3", background: "#0D1520", textPrimary: "#7EC8E3", border: "rgba(126, 200, 227, 0.2)", success: "#40E0D0" } },
  { id: 5, name: "Київська Русь", shortName: "Русь", period: "IX–XIII ст.", description: "Перша держава східних слов'ян. Київ — мати городів руських. Софія Київська — світова спадщина ЮНЕСКО.", icon: "⛪", currencyIcon: "🪙", currencyName: "Гривні", colors: { primary: "#4A90D9", secondary: "#1E3A5F", accent: "#6BB3F0", background: "#050A10", textPrimary: "#4A90D9", border: "rgba(74, 144, 217, 0.2)", success: "#4169E1" } },
  { id: 6, name: "Галицько-Волинське князівство", shortName: "Галичина", period: "XIV–XIV ст.", description: "Наступник Київської Русі. Єдине східнослов'янське королівство в історії — Королівство Русь.", icon: "🦁", currencyIcon: "🪙", currencyName: "Практи", colors: { primary: "#DC143C", secondary: "#8B0000", accent: "#FF4444", background: "#0F0505", textPrimary: "#DC143C", border: "rgba(220, 20, 60, 0.2)", success: "#228B22" } },
  { id: 7, name: "Козацька доба", shortName: "Козаки", period: "XVI–XVII ст.", description: "Вільні воїни-захисники українського народу. Запорозька Січ — символ козацької волі та державницьких традицій.", icon: "🏇", currencyIcon: "🪙", currencyName: "Дукати", colors: { primary: "#F5C842", secondary: "#B8860B", accent: "#FFD700", background: "#07090F", textPrimary: "#F5C842", border: "rgba(245, 200, 66, 0.2)", success: "#32CD32" } },
  { id: 8, name: "Кримське ханство", shortName: "Крим", period: "XV–XVIII ст.", description: "Остання ханська держава в історії Європи. Бахчисарай — столиця кримськотатарського народу.", icon: "🕌", currencyIcon: "💰", currencyName: "Аспри", colors: { primary: "#40E0D0", secondary: "#00CED1", accent: "#00FFFF", background: "#031515", textPrimary: "#40E0D0", border: "rgba(64, 224, 208, 0.2)", success: "#2E8B57" } },
  { id: 9, name: "Українська козацька держава", shortName: "Гетьманщина", period: "XVII–XVIII ст.", description: "Автономна козацька держава під протекторатом Російської та Османської імперій з власними дипломатиними традиціями.", icon: "⚜️", currencyIcon: "🪙", currencyName: "Рейтарські златії", colors: { primary: "#9370DB", secondary: "#6A5ACD", accent: "#BA55D3", background: "#050510", textPrimary: "#9370DB", border: "rgba(106, 90, 205, 0.2)", success: "#9370DB" } },
  { id: 10, name: "Національне відродження", shortName: "Відродження", period: "XIX ст.", description: "Період національного пробудження. Тарас Шевченко та Іван Франко — генії, що заснували сучасну українську літературу.", icon: "🔱", currencyIcon: "💰", currencyName: "Карбованці", colors: { primary: "#32CD32", secondary: "#228B22", accent: "#00FF00", background: "#031003", textPrimary: "#32CD32", border: "rgba(50, 205, 50, 0.2)", success: "#FFD700" } },
  { id: 11, name: "УНР та модернізація", shortName: "УНР", period: "1918–1940", description: "Перша незалежна українська держава XX століття. Героїка боротьби за independence триває в серцях українців.", icon: "🇺🇦", currencyIcon: "💴", currencyName: "Українські карбованці", colors: { primary: "#FFD700", secondary: "#005BBB", accent: "#005BBB", background: "#030810", textPrimary: "#FFD700", border: "rgba(0, 91, 187, 0.2)", success: "#005BBB" } },
  { id: 12, name: "Незалежна Україна", shortName: "Незалежність", period: "1991–дотепер", description: "Сучасна незалежна держава. Героїчний народ будує демократичну Європейську Україну попри всі випробування.", icon: "🇺🇦", currencyIcon: "₴", currencyName: "Гривні", colors: { primary: "#FFD700", secondary: "#005BBB", accent: "#005BBB", background: "#040810", textPrimary: "#FFD700", border: "rgba(0, 91, 187, 0.25)", success: "#228B22" } },
];

// Current epoch (default - index 6 = Cossack era)
const EPOCH = EPOCHS[6];

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

// ─── Epoch Info Card ───────────────────────────────────────────────────────────

function EpochInfoCard() {
  const epoch = useEpoch();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mx-4 my-3 rounded-3xl p-5 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${epoch.colors.background}f5 0%, ${epoch.colors.background}dd 100%)`,
        border: `1px solid ${epoch.colors.primary}30`,
        boxShadow: `0 0 40px ${epoch.colors.primary}15, inset 0 1px 0 ${epoch.colors.primary}10`,
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Decorative corner ornaments */}
      <div className="absolute top-2 left-2 w-6 h-6 border-l border-t rounded-tl-xl" style={{ borderColor: `${epoch.colors.primary}40` }} />
      <div className="absolute top-2 right-2 w-6 h-6 border-r border-t rounded-tr-xl" style={{ borderColor: `${epoch.colors.primary}40` }} />
      <div className="absolute bottom-2 left-2 w-6 h-6 border-l border-b rounded-bl-xl" style={{ borderColor: `${epoch.colors.primary}40` }} />
      <div className="absolute bottom-2 right-2 w-6 h-6 border-r border-b rounded-br-xl" style={{ borderColor: `${epoch.colors.primary}40` }} />

      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-3xl opacity-20"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${epoch.colors.primary}30 0%, transparent 60%)` }}
      />

      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Epoch name */}
        <h2 
          className="text-xl font-bold uppercase mb-1"
          style={{ 
            fontFamily: "'Cinzel', serif",
            color: epoch.colors.primary,
            letterSpacing: '0.2em',
            textShadow: `0 0 20px ${epoch.colors.primary}50`,
          }}
        >
          {epoch.name}
        </h2>

        {/* Period */}
        <p 
          className="text-xs uppercase tracking-[0.3em] mb-4"
          style={{ 
            fontFamily: "'Cinzel', serif",
            color: `${epoch.colors.primary}80`,
          }}
        >
          {epoch.period}
        </p>

        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${epoch.colors.primary}50)` }} />
          <span className="text-lg">{epoch.icon}</span>
          <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${epoch.colors.primary}50)` }} />
        </div>

        {/* Description */}
        <p 
          className="text-sm leading-relaxed"
          style={{ 
            color: epoch.colors.textPrimary,
            opacity: 0.85,
          }}
        >
          {epoch.description}
        </p>
      </div>
    </motion.div>
  );
}

function CornerOrnament({ flipX, flipY, epoch }: { flipX?: boolean; flipY?: boolean; epoch?: Epoch }) {
  const color = epoch?.colors.primary || "#F5C842";
  return (
    <svg
      viewBox="0 0 44 44"
      fill="none"
      className="w-11 h-11"
      style={{ transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})` }}
    >
      <path d="M4 40 L4 4 L40 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
      <path d="M4 4 Q22 4 22 22" stroke={color} strokeWidth="0.7" strokeDasharray="2.5 2.5" opacity="0.2" />
      <circle cx="4"  cy="4"  r="2.5" fill={color} opacity="0.5" />
      <circle cx="4"  cy="40" r="1.5" fill={color} opacity="0.25" />
      <circle cx="40" cy="4"  r="1.5" fill={color} opacity="0.25" />
    </svg>
  );
}

function GridTexture({ epoch }: { epoch?: Epoch }) {
  const color = epoch?.colors.primary || "#F5C842";
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="hg" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M0 0 L28 0 M0 0 L0 28" stroke={color} strokeWidth="0.3" opacity="0.1" />
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

function IcoZap({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
}

function IcoTicket({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 010-6h20a3 3 0 010 6"/>
      <path d="M2 15a3 3 0 000 6h20a3 3 0 000-6"/>
      <line x1="12" y1="3" x2="12" y2="21"/>
    </svg>
  );
}

function IcoPlay({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────

function Header({ level, xp, xpToNext, currency, passivePerSec }: {
  level: number; xp: number; xpToNext: number; currency: number; passivePerSec: number;
}) {
  const epoch = useEpoch();
  const pct = Math.min(100, (xp / xpToNext) * 100);
  return (
    <div 
      className="shrink-0 backdrop-blur-sm border-b"
      style={{ 
        paddingTop: "env(safe-area-inset-top)",
        backgroundColor: `${epoch.colors.background}e0`,
        borderColor: epoch.colors.border,
      }}
    >
      <div className="px-4 pt-2.5 pb-2">
        {/* Top row */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          {/* Epoch badge */}
          <div className="flex items-center gap-2 min-w-0">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-lg border"
              style={{ 
                backgroundColor: `${epoch.colors.primary}15`,
                borderColor: `${epoch.colors.primary}30`,
              }}
            >
              {epoch.icon}
            </div>
            <div className="min-w-0">
              <div
                className="text-xs font-semibold tracking-wide uppercase leading-tight truncate"
                style={{ fontFamily: "'Cinzel', serif", color: epoch.colors.primary }}
              >
                {epoch.name}
              </div>
              <div className="text-[10px] leading-tight" style={{ color: `${epoch.colors.primary}60` }}>{epoch.period}</div>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Passive */}
            <div className="text-right">
              <div className="text-[9px] text-white/30 leading-none uppercase tracking-wide">Пасив</div>
              <div className="text-xs font-bold leading-tight" style={{ fontFamily: "'DM Mono', monospace", color: epoch.colors.success }}>
                +{fmt(passivePerSec)}/с
              </div>
            </div>
            {/* Currency */}
            <div className="text-right">
              <div className="text-[9px] text-white/30 leading-none uppercase tracking-wide">{epoch.currencyIcon}</div>
              <div className="text-xs font-bold leading-tight" style={{ fontFamily: "'DM Mono', monospace", color: epoch.colors.primary }}>
                {fmt(currency)}
              </div>
            </div>
            {/* Level pill */}
            <div
              className="font-bold text-sm rounded-xl px-2.5 py-1 min-w-[2.75rem] text-center"
              style={{ 
                fontFamily: "'Cinzel', serif",
                backgroundColor: epoch.colors.primary,
                color: epoch.colors.background,
                boxShadow: `0 0 12px ${epoch.colors.primary}50`,
              }}
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
              className="h-full rounded-full"
              style={{ 
                background: `linear-gradient(to right, ${epoch.colors.primary}, ${epoch.colors.accent})`,
              }}
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
  const epoch = useEpoch();
  const [pressing, setPressing] = useState(false);

  const fire = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onTap();
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      {/* Museum exhibit container - perfectly centered */}
      <div className="flex flex-col items-center">
        
        {/* Concentric sacred circles - museum pedestal effect */}
        <div className="relative flex items-center justify-center">
          {/* Outermost circle */}
          <div 
            className="absolute rounded-full border animate-pulse"
            style={{ 
              width: '280px', 
              height: '280px', 
              borderColor: `${epoch.colors.primary}12`,
              animationDuration: '4s',
            }} 
          />
          {/* Second circle */}
          <div 
            className="absolute rounded-full border"
            style={{ 
              width: '240px', 
              height: '240px', 
              borderColor: `${epoch.colors.primary}18`,
              animation: 'spin 60s linear infinite',
            }} 
          />
          {/* Third circle */}
          <div 
            className="absolute rounded-full border"
            style={{ 
              width: '200px', 
              height: '200px', 
              borderColor: `${epoch.colors.primary}25`,
              animation: 'spin 45s linear infinite reverse',
            }} 
          />
          {/* Fourth circle - inner */}
          <div 
            className="absolute rounded-full border"
            style={{ 
              width: '160px', 
              height: '160px', 
              borderColor: `${epoch.colors.primary}35`,
              animation: 'spin 30s linear infinite',
            }} 
          />
          
          {/* Golden glow halo behind artifact */}
          <div 
            className="absolute w-32 h-32 rounded-full blur-3xl"
            style={{ 
              backgroundColor: `${epoch.colors.primary}25`,
              boxShadow: `0 0 80px 20px ${epoch.colors.primary}15`,
            }} 
          />
          
          {/* Main artifact button */}
          <motion.button
            animate={{ scale: pressing ? 0.92 : 1 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            className="relative w-28 h-28 rounded-full flex flex-col items-center justify-center cursor-pointer z-10"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${epoch.colors.primary}40, ${epoch.colors.background} 70%)`,
              border: `3px solid ${epoch.colors.primary}80`,
              boxShadow: `
                0 0 60px ${epoch.colors.primary}30,
                0 0 100px ${epoch.colors.primary}15,
                inset 0 2px 20px ${epoch.colors.primary}20,
                inset 0 -4px 10px rgba(0,0,0,0.5)
              `,
            }}
            onTouchStart={e => { setPressing(true); fire(e); }}
            onTouchEnd={() => setPressing(false)}
            onMouseDown={e => { setPressing(true); fire(e); }}
            onMouseUp={() => setPressing(false)}
            onMouseLeave={() => setPressing(false)}
          >
            {/* Inner decorative ring */}
            <div 
              className="absolute inset-3 rounded-full border"
              style={{ borderColor: `${epoch.colors.primary}30` }} 
            />
            {/* Artifact icon */}
            <span className="text-6xl select-none relative z-10">{epoch.icon}</span>
          </motion.button>
        </div>

        {/* Artifact name - museum plaque style */}
        <div className="mt-8 text-center">
          <h2 
            className="text-lg font-bold uppercase"
            style={{ 
              fontFamily: "'Cinzel', serif",
              color: epoch.colors.primary,
              textShadow: `0 0 20px ${epoch.colors.primary}40`,
              letterSpacing: '0.5em',
            }}
          >
            НАТИСНИ
          </h2>
          {/* Decorative line under name */}
          <div className="flex items-center justify-center gap-3 mt-2">
            <div className="h-px w-12" style={{ backgroundColor: `${epoch.colors.primary}40` }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: epoch.colors.primary }} />
            <div className="h-px w-12" style={{ backgroundColor: `${epoch.colors.primary}40` }} />
          </div>
        </div>

        {/* Reward button - museum display info */}
        <div className="mt-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${epoch.colors.primary}30, ${epoch.colors.primary}15)`,
              border: `1px solid ${epoch.colors.primary}50`,
              color: epoch.colors.primary,
              boxShadow: `0 0 20px ${epoch.colors.primary}20`,
              fontFamily: "'Cinzel', serif",
              letterSpacing: '0.1em',
            }}
            onClick={fire}
          >
            <span className="text-lg">⚡</span>
            <span>+{tapPower} XP</span>
          </motion.button>
        </div>
        
        {/* Subtle instruction */}
        <p 
          className="mt-4 text-[10px] uppercase"
          style={{ 
            color: `${epoch.colors.primary}50`,
            fontFamily: "'Cinzel', serif",
            letterSpacing: '0.3em',
          }}
        >
          Торкніться експоната
        </p>
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
  const epoch = useEpoch();
  
  return (
    <div 
      className="relative w-full h-full overflow-hidden"
      style={{ backgroundColor: epoch.colors.background }}
    >
      <GridTexture epoch={epoch} />

      {/* Radial center glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-72 h-72 rounded-full blur-[60px]" style={{ backgroundColor: `${epoch.colors.primary}08` }} />
      </div>

      {/* Corner ornaments */}
      <div className="absolute top-2 left-2 pointer-events-none"><CornerOrnament epoch={epoch} /></div>
      <div className="absolute top-2 right-2 pointer-events-none"><CornerOrnament epoch={epoch} flipX /></div>
      <div className="absolute bottom-10 left-2 pointer-events-none"><CornerOrnament epoch={epoch} flipY /></div>
      <div className="absolute bottom-10 right-2 pointer-events-none"><CornerOrnament epoch={epoch} flipX flipY /></div>

      {/* Tap medallion */}
      <TapMedallion onTap={onTap} tapPower={tapPower} />

      {/* Floating XP numbers */}
      <AnimatePresence>
        {tapEvents.map(ev => (
          <motion.div
            key={ev.id}
            className={`absolute pointer-events-none select-none font-bold ${
              ev.value >= 100 ? "text-xl" : "text-base"
            }`}
            style={{
              left: `${ev.xPct}%`,
              top: `${ev.yPct}%`,
              fontFamily: "'DM Mono', monospace",
              color: ev.value >= 100 ? epoch.colors.primary : epoch.colors.accent,
              textShadow: `0 0 14px ${epoch.colors.primary}80`,
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
        <span className="text-[10px] font-mono" style={{ color: `${epoch.colors.primary}40` }}>Рівень 42 / 960</span>
        <span className="text-[10px] font-mono" style={{ color: `${epoch.colors.primary}40` }}>#7 у грі</span>
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
  path: string;
  label: string;
  Icon: React.FC<{ className?: string }>;
  badge?: number;
  locked?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { path: "/tap",        label: "Гра",       Icon: IcoGamepad  },
  { path: "/",           label: "Завдання",  Icon: IcoGem     },
  { path: "/boosters",   label: "Бустери",   Icon: IcoZap     },
  { path: "/artifacts",  label: "Реліквії",  Icon: IcoGem,    badge: 2 },
  { path: "/profile",    label: "Профіль",   Icon: IcoUser     },
  { path: "/settings",   label: "",          Icon: IcoSettings },
];

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div
      className="shrink-0 bg-[#07090F]/99 border-t border-amber-400/10"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex">
        {NAV_ITEMS.map(({ path, label, Icon, badge, locked }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 relative transition-all ${
                locked ? "opacity-35" : isActive ? "opacity-100" : "opacity-45 hover:opacity-70"
              }`}
              onClick={() => !locked && navigate(path)}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-amber-400" : "text-white/60"}`} />
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
                <span className={`text-[10px] font-medium transition-colors ${isActive ? "text-amber-400" : "text-white/35"}`}>
                  {label}
                </span>
              )}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-amber-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Game State Context ───────────────────────────────────────────────────────

interface GameState {
  level: number;
  xp: number;
  xpToNext: number;
  currency: number;
  passivePerSec: number;
  tapPower: number;
  energy: number;
  maxEnergy: number;
  dailyStreak: number;
  boosts: { type: string; multiplier: number; minutesLeft: number }[];
  currentEpochIndex: number;
}

interface GameContextValue {
  state: GameState;
  tapEvents: TapEvent[];
  handleTap: () => void;
  setEpoch: (index: number) => void;
  setState: React.Dispatch<React.SetStateAction<GameState>>;
}

const GameContext = React.createContext<GameContextValue | null>(null);

function useGame() {
  const ctx = React.useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}

// Convenience hook for current epoch
function useEpoch() {
  const { state } = useGame();
  return EPOCHS[state.currentEpochIndex];
}

// ─── Page Layout ──────────────────────────────────────────────────────────────

function PageLayout({ children }: { children: React.ReactNode }) {
  const { state } = useGame();
  const epoch = useEpoch();
  return (
    <div
      className="h-screen flex flex-col overflow-hidden select-none"
      style={{ 
        fontFamily: "'Inter', sans-serif",
        backgroundColor: epoch.colors.background,
      }}
    >
      <Header
        level={state.level}
        xp={state.xp}
        xpToNext={state.xpToNext}
        currency={state.currency}
        passivePerSec={state.passivePerSec}
      />
      <AdBanner position="top" />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
      <AdBanner position="bottom" />
      <Navigation />
    </div>
  );
}

// ─── Full Screen Tap Page ─────────────────────────────────────────────────────

function TapPage() {
  const { state, tapEvents, handleTap, setEpoch } = useGame();
  const epoch = useEpoch();
  const [showEpochSelector, setShowEpochSelector] = useState(false);
  const [tapParticles, setTapParticles] = useState<{id: number; x: number; y: number; color: string}[]>([]);
  const [comboText, setComboText] = useState("");
  const particleId = useRef(0);

  const handleTapWithEffects = (e: React.TouchEvent | React.MouseEvent) => {
    handleTap();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const newParticles = Array.from({ length: 8 }, () => ({
      id: particleId.current++,
      x: clientX,
      y: clientY,
      color: Math.random() > 0.5 ? epoch.colors.primary : epoch.colors.accent,
    }));
    setTapParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setTapParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 800);
    if (Math.random() > 0.85) {
      const combos = ["🔥 КОМБО!", "⚡ СУПЕР!", "💥 МЕГА!", "🌟 ЛЕГЕНДАРНО!"];
      setComboText(combos[Math.floor(Math.random() * combos.length)]);
      setTimeout(() => setComboText(""), 800);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden select-none" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Background with gradient layers */}
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 30%, ${epoch.colors.primary}15 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, ${epoch.colors.secondary}10 0%, transparent 40%), radial-gradient(ellipse at 80% 70%, ${epoch.colors.accent}08 0%, transparent 35%), ${epoch.colors.background}` }} />
      
      {/* Animated stars/particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 rounded-full animate-pulse" style={{ left: `${(i * 17 + 5) % 100}%`, top: `${(i * 23 + 10) % 100}%`, backgroundColor: epoch.colors.primary, opacity: 0.3 + (i % 5) * 0.1, animationDuration: `${2 + (i % 3)}s`, animationDelay: `${i * 0.2}s` }} />
        ))}
      </div>

      <Header level={state.level} xp={state.xp} xpToNext={state.xpToNext} currency={state.currency} passivePerSec={state.passivePerSec} />

      {/* Epoch selector */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20">
        <button onClick={() => setShowEpochSelector(!showEpochSelector)} className="flex items-center gap-2 px-4 py-2 rounded-full border transition-all hover:scale-105" style={{ backgroundColor: `${epoch.colors.primary}20`, borderColor: epoch.colors.border }}>
          <span className="text-lg">{epoch.icon}</span>
          <span className="text-xs font-semibold" style={{ color: epoch.colors.primary }}>{epoch.shortName}</span>
          <svg className={`w-4 h-4 transition-transform ${showEpochSelector ? 'rotate-180' : ''}`} style={{ color: epoch.colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        {showEpochSelector && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-72 max-h-80 overflow-y-auto rounded-2xl border shadow-2xl" style={{ backgroundColor: `${epoch.colors.background}f0`, borderColor: epoch.colors.border, backdropFilter: 'blur(20px)' }}>
            <div className="p-2 space-y-1">
              {EPOCHS.map((e, i) => (
                <button key={e.id} onClick={() => { setEpoch(i); setShowEpochSelector(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${i === state.currentEpochIndex ? 'scale-105' : 'hover:scale-[1.02]'}`} style={{ backgroundColor: i === state.currentEpochIndex ? `${e.colors.primary}30` : 'transparent' }}>
                  <span className="text-2xl">{e.icon}</span>
                  <div className="text-left flex-1">
                    <div className="text-white text-sm font-semibold">{e.shortName}</div>
                    <div className="text-white/40 text-[10px]">{e.period}</div>
                  </div>
                  {i === state.currentEpochIndex && <svg className="w-5 h-5" style={{ color: e.colors.primary }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <div className="w-full h-full"><GameCanvas onTap={handleTapWithEffects} tapEvents={tapEvents} tapPower={state.tapPower} /></div>

      {/* Tap particles */}
      {tapParticles.map(p => (
        <motion.div key={p.id} className="absolute w-2 h-2 rounded-full pointer-events-none" style={{ left: p.x, top: p.y, backgroundColor: p.color, boxShadow: `0 0 10px ${p.color}` }} initial={{ opacity: 1, scale: 1 }} animate={{ opacity: 0, scale: 0, y: -100 }} transition={{ duration: 0.8, ease: "easeOut" }} />
      ))}

      {/* Combo text */}
      {comboText && (
        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1.2 }} exit={{ opacity: 0, scale: 0.5 }} className="absolute top-1/3 left-1/2 -translate-x-1/2 pointer-events-none" style={{ color: epoch.colors.primary, textShadow: `0 0 20px ${epoch.colors.primary}`, fontFamily: "'Cinzel', serif", fontSize: '2rem', fontWeight: 'bold' }}>
          {comboText}
        </motion.div>
      )}

      {/* Decorative rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="absolute rounded-full border" style={{ width: `${250 + i * 100}px`, height: `${250 + i * 100}px`, borderColor: `${epoch.colors.primary}${Math.max(5, 20 - i * 7)}`, animation: `spin ${20 + i * 10}s linear infinite`, animationDirection: i % 2 === 0 ? 'reverse' : 'normal' }} />
        ))}
      </div>

      {/* Epoch Info Card - historical information */}
      <div className="absolute bottom-20 left-0 right-0 z-10">
        <EpochInfoCard />
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}><Navigation /></div>
    </div>
  );
}

// ─── Game Tasks Page ──────────────────────────────────────────────────────────

function GameTasksPage() {
  const { state } = useGame();
  return (
    <PageLayout>
      <div className="p-3 space-y-3">
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
      </div>
    </PageLayout>
  );
}

// ─── Artifacts Page ──────────────────────────────────────────────────────────

function ArtifactsPage() {
  return (
    <PageLayout>
      <ArtifactsTab />
    </PageLayout>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────

function ProfilePage() {
  const { state } = useGame();
  return (
    <PageLayout>
      <ProfileTab level={state.level} currency={state.currency} streak={state.dailyStreak} />
    </PageLayout>
  );
}

// ─── Settings Page ────────────────────────────────────────────────────────────

function SettingsPage() {
  return (
    <PageLayout>
      <SettingsTab />
    </PageLayout>
  );
}

// ─── Expedition Page ───────────────────────────────────────────────────────────

function ExpeditionPage() {
  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
        <div className="text-5xl">🔒</div>
        <div className="text-center">
          <div className="text-white/80 font-semibold mb-1" style={{ fontFamily: "'Cinzel', serif" }}>Академія заблокована</div>
          <div className="text-white/40 text-sm">Розблоковується на 2-му переродженні</div>
        </div>
      </div>
    </PageLayout>
  );
}

// ─── Boosters Page ─────────────────────────────────────────────────────────────

function BoostersPage() {
  const { state, setState } = useGame();
  const epoch = useEpoch();

  const handleWatchAd = (boostType: "xp" | "currency") => {
    // Simulate watching ad - in real app would integrate with ad SDK
    const duration = 30;
    const multiplier = 3;
    
    setState(prev => ({
      ...prev,
      boosts: [
        ...prev.boosts.filter(b => b.type !== boostType),
        { type: boostType, multiplier, minutesLeft: duration }
      ]
    }));
  };

  const activeBoosts = state.boosts;

  return (
    <PageLayout>
      <div className="p-3 space-y-4">
        {/* Header */}
        <div className="text-center py-2">
          <h1 className="text-lg font-bold text-white" style={{ fontFamily: "'Cinzel', serif", color: epoch.colors.primary }}>
            🎁 Бустери
          </h1>
          <p className="text-white/40 text-xs mt-1">Дивись рекламу та отримуй x3</p>
        </div>

        {/* Active Boosts */}
        {activeBoosts.length > 0 && (
          <div className="rounded-2xl p-4 border" style={{ backgroundColor: `${epoch.colors.primary}10`, borderColor: epoch.colors.border }}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: epoch.colors.primary }}>
              ⏱️ Активні бустери
            </div>
            <div className="space-y-2">
              {activeBoosts.map((boost, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-black/20">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{boost.type === "xp" ? "⚡" : "💰"}</span>
                    <div>
                      <div className="text-white/90 text-sm font-semibold">
                        x{boost.multiplier} {boost.type === "xp" ? "XP" : "Валюта"}
                      </div>
                      <div className="text-white/40 text-xs">{boost.minutesLeft} хв</div>
                    </div>
                  </div>
                  <div className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${epoch.colors.success}30`, color: epoch.colors.success }}>
                    Активний
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Boosts */}
        <div className="space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-white/30 px-1">
            Доступні бустери
          </div>

          {/* XP Boost */}
          <div 
            className="rounded-2xl p-4 border transition-all hover:scale-[1.02]"
            style={{ backgroundColor: `${epoch.colors.primary}10`, borderColor: epoch.colors.border }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ backgroundColor: `${epoch.colors.primary}20` }}
                >
                  ⚡
                </div>
                <div>
                  <div className="text-white font-semibold" style={{ fontFamily: "'Cinzel', serif" }}>
                    x3 XP на 30 хвилин
                  </div>
                  <div className="text-white/50 text-sm mt-1">
                    Всі тапи приносять в 3 рази більше досвіду
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleWatchAd("xp")}
              className="w-full mt-4 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              style={{ 
                backgroundColor: epoch.colors.primary,
                color: epoch.colors.background,
              }}
            >
              <IcoPlay className="w-4 h-4" />
              Дивитись рекламу
            </button>
          </div>

          {/* Currency Boost */}
          <div 
            className="rounded-2xl p-4 border transition-all hover:scale-[1.02]"
            style={{ backgroundColor: `${epoch.colors.primary}10`, borderColor: epoch.colors.border }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ backgroundColor: `${epoch.colors.primary}20` }}
                >
                  💰
                </div>
                <div>
                  <div className="text-white font-semibold" style={{ fontFamily: "'Cinzel', serif" }}>
                    x3 Валюта на 30 хвилин
                  </div>
                  <div className="text-white/50 text-sm mt-1">
                    Всі тапи приносять в 3 рази більше монет
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleWatchAd("currency")}
              className="w-full mt-4 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              style={{ 
                backgroundColor: epoch.colors.primary,
                color: epoch.colors.background,
              }}
            >
              <IcoPlay className="w-4 h-4" />
              Дивитись рекламу
            </button>
          </div>

          {/* Passive Boost */}
          <div 
            className="rounded-2xl p-4 border transition-all hover:scale-[1.02]"
            style={{ backgroundColor: `${epoch.colors.primary}10`, borderColor: epoch.colors.border }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ backgroundColor: `${epoch.colors.primary}20` }}
                >
                  📈
                </div>
                <div>
                  <div className="text-white font-semibold" style={{ fontFamily: "'Cinzel', serif" }}>
                    x3 Пасивний дохід на 30 хвилин
                  </div>
                  <div className="text-white/50 text-sm mt-1">
                    Генератори працюють в 3 рази швидше
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleWatchAd("passive")}
              className="w-full mt-4 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              style={{ 
                backgroundColor: epoch.colors.primary,
                color: epoch.colors.background,
              }}
            >
              <IcoPlay className="w-4 h-4" />
              Дивитись рекламу
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="text-center text-white/30 text-xs py-4">
          {epoch.currencyIcon} Один бустер = 30 хвилин x3
        </div>
      </div>
    </PageLayout>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [tapEvents, setTapEvents] = useState<TapEvent[]>([]);
  const [state, setState] = useState<GameState>({
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
    currentEpochIndex: 6,
  });

  const tapId  = useRef(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  const handleTap = useCallback(() => {
    const s = stateRef.current;
    const value = s.tapPower + Math.floor(Math.random() * Math.ceil(s.tapPower * 0.18));
    const id    = ++tapId.current;

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

  const setEpoch = useCallback((index: number) => {
    setState(prev => ({ ...prev, currentEpochIndex: index }));
  }, []);

  return (
    <BrowserRouter>
      <GameContext.Provider value={{ state, tapEvents, handleTap, setEpoch, setState }}>
        <Routes>
          <Route path="/tap"        element={<TapPage />} />
          <Route path="/"           element={<GameTasksPage />} />
          <Route path="/boosters"   element={<BoostersPage />} />
          <Route path="/artifacts"  element={<ArtifactsPage />} />
          <Route path="/profile"    element={<ProfilePage />} />
          <Route path="/settings"   element={<SettingsPage />} />
          <Route path="/expedition" element={<ExpeditionPage />} />
        </Routes>
      </GameContext.Provider>
    </BrowserRouter>
  );
}
