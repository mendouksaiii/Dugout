"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Backdrop } from "@/components/ui/Backdrop";
import { HoverWord, LetterWave } from "@/components/ui/HoverText";
import { RelatedLinks } from "@/components/ui/RelatedLinks";
import { FOOTBALL_IMAGERY } from "@/lib/imagery";

// ─── Mock market data ─────────────────────────────────────────────────────────
const TOURNAMENT_OPENS = new Date("2026-06-11T20:00:00Z"); // World Cup 2026 opening match

interface Outright {
  id: string;
  category: string;
  question: string;
  options: { label: string; pct: number; flag?: string }[];
  volume: string;
}

const OUTRIGHTS: Outright[] = [
  {
    id: "winner",
    category: "WORLD CUP 2026",
    question: "Who lifts the trophy?",
    volume: "412 OKB",
    options: [
      { label: "Argentina",   pct: 18, flag: "🇦🇷" },
      { label: "Brazil",      pct: 16, flag: "🇧🇷" },
      { label: "France",      pct: 14, flag: "🇫🇷" },
      { label: "England",     pct: 12, flag: "🏴" },
      { label: "Spain",       pct: 11, flag: "🇪🇸" },
      { label: "Germany",     pct: 8,  flag: "🇩🇪" },
      { label: "Portugal",    pct: 7,  flag: "🇵🇹" },
      { label: "Field (Any other)",  pct: 14 },
    ],
  },
  {
    id: "topscorer",
    category: "GOLDEN BOOT",
    question: "Top scorer of the tournament?",
    volume: "188 OKB",
    options: [
      { label: "Kylian Mbappé",       pct: 22, flag: "🇫🇷" },
      { label: "Vinícius Jr.",        pct: 14, flag: "🇧🇷" },
      { label: "Harry Kane",          pct: 12, flag: "🏴" },
      { label: "Jude Bellingham",     pct: 9,  flag: "🏴" },
      { label: "Lautaro Martínez",    pct: 8,  flag: "🇦🇷" },
      { label: "Field",                pct: 35 },
    ],
  },
  {
    id: "goldenball",
    category: "GOLDEN BALL",
    question: "Player of the tournament?",
    volume: "127 OKB",
    options: [
      { label: "Mbappé",     pct: 19, flag: "🇫🇷" },
      { label: "Bellingham", pct: 14, flag: "🏴" },
      { label: "Vinícius Jr.", pct: 12, flag: "🇧🇷" },
      { label: "Rodri",      pct: 9,  flag: "🇪🇸" },
      { label: "Messi",      pct: 7,  flag: "🇦🇷" },
      { label: "Field",      pct: 39 },
    ],
  },
  {
    id: "darkhorse",
    category: "DARK HORSE",
    question: "Will any unseeded team reach the SF?",
    volume: "62 OKB",
    options: [
      { label: "Yes",  pct: 33 },
      { label: "No",   pct: 67 },
    ],
  },
];

interface GroupMatch {
  matchday: number;
  group: string;
  home: { name: string; flag: string; odds: number };
  away: { name: string; flag: string; odds: number };
  draw: number;
  date: string;
  status: "upcoming" | "live" | "settled";
}

const GROUP_MATCHES: GroupMatch[] = [
  { matchday: 1, group: "A", home: { name: "Mexico",      flag: "🇲🇽", odds: 38 }, away: { name: "Saudi Arabia",  flag: "🇸🇦", odds: 34 }, draw: 28, date: "Jun 11", status: "upcoming" },
  { matchday: 1, group: "B", home: { name: "Canada",      flag: "🇨🇦", odds: 41 }, away: { name: "Iceland",       flag: "🇮🇸", odds: 32 }, draw: 27, date: "Jun 12", status: "upcoming" },
  { matchday: 1, group: "C", home: { name: "USA",         flag: "🇺🇸", odds: 47 }, away: { name: "Australia",     flag: "🇦🇺", odds: 27 }, draw: 26, date: "Jun 12", status: "upcoming" },
  { matchday: 1, group: "D", home: { name: "Argentina",   flag: "🇦🇷", odds: 62 }, away: { name: "Egypt",         flag: "🇪🇬", odds: 18 }, draw: 20, date: "Jun 13", status: "upcoming" },
  { matchday: 1, group: "E", home: { name: "France",      flag: "🇫🇷", odds: 58 }, away: { name: "Japan",         flag: "🇯🇵", odds: 22 }, draw: 20, date: "Jun 13", status: "upcoming" },
  { matchday: 1, group: "F", home: { name: "Brazil",      flag: "🇧🇷", odds: 64 }, away: { name: "Senegal",       flag: "🇸🇳", odds: 18 }, draw: 18, date: "Jun 14", status: "upcoming" },
  { matchday: 1, group: "G", home: { name: "England",     flag: "🏴", odds: 55 }, away: { name: "South Korea",   flag: "🇰🇷", odds: 23 }, draw: 22, date: "Jun 14", status: "upcoming" },
  { matchday: 1, group: "H", home: { name: "Spain",       flag: "🇪🇸", odds: 60 }, away: { name: "Morocco",       flag: "🇲🇦", odds: 20 }, draw: 20, date: "Jun 15", status: "upcoming" },
];

const NOVELTY = [
  { question: "First red card of the tournament?",     yes: 78, sub: "Within first 5 matches" },
  { question: "Hat-trick scored in the group stage?",  yes: 64, sub: "Any player, any match" },
  { question: "Match decided on penalties in KO?",     yes: 71, sub: "Round of 16 or later" },
  { question: "VAR overturns a goal in the Final?",    yes: 28, sub: "Final match only" },
];

// ─── Live countdown hook ─────────────────────────────────────────────────────
function useCountdown(target: Date) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!now) return { d: 0, h: 0, m: 0, s: 0, ready: false };
  const diff = Math.max(0, target.getTime() - now.getTime());
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s, ready: true };
}

// ─── PAGE ────────────────────────────────────────────────────────────────────
export default function PredictPage() {
  const c = useCountdown(TOURNAMENT_OPENS);

  return (
    <>
      <Navbar />
      <main className="relative min-h-[100dvh] pt-32 sm:pt-36 pb-24 px-4 sm:px-8">
        <Backdrop src={FOOTBALL_IMAGERY.trophy} opacity={0.22} blur={3} overlay="hero" blend="luminosity" scale={1.05} />
        <div className="pointer-events-none absolute inset-0 -z-10 floodlight-left" />
        <div className="pointer-events-none absolute inset-0 -z-10 floodlight-right" />
        <div className="pointer-events-none absolute inset-0 -z-10 scanlines opacity-25" />

        <div className="relative mx-auto max-w-7xl">
          {/* ─── HEADER ──────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-dugout-gold/15 hairline px-3 py-1 hover-lift">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-dugout-gold animate-live-dot" />
                <span className="font-mono text-[10px] tracking-[0.22em] text-dugout-gold uppercase">
                  Markets · Locked
                </span>
              </div>
              <h1 className="mt-5 font-display text-white text-7xl sm:text-9xl leading-[0.85]">
                <LetterWave text="Predict" glow="white" charDelay={28} liftPx={12} /><br/>
                <span className="text-dugout-gold">
                  <LetterWave text="the cup." glow="gold" charDelay={30} liftPx={14} />
                </span>
              </h1>
              <p className="mt-4 text-white/55 max-w-xl">
                On-chain prediction markets for every group match, knockout fixture, and tournament-long
                outright. Resolved by the same Oracle that scores Squad Wars.
              </p>
            </div>

            {/* Countdown */}
            <CountdownPanel c={c} />
          </div>

          {/* ─── LOCKED NOTICE STRIP ────────────────────────────────── */}
          <div className="rounded-2xl p-[1.5px] bg-gradient-to-r from-dugout-gold/40 via-white/10 to-dugout-electric/30 mb-14">
            <div className="rounded-[calc(1rem-1.5px)] bg-dugout-surface/80 backdrop-blur-sm hairline inner-glow px-5 py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <LockIcon />
                <div>
                  <div className="font-display text-lg text-white leading-none">Markets open at kickoff.</div>
                  <div className="font-mono text-[10px] tracking-[0.22em] text-white/45 uppercase mt-1">
                    Mexico vs Saudi Arabia · June 11 · Estadio Azteca
                  </div>
                </div>
              </div>
              <button
                disabled
                className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] hairline px-4 py-2 font-mono text-[11px] tracking-[0.22em] text-white/60 uppercase cursor-not-allowed"
              >
                <BellIcon />
                Notify me on open
              </button>
            </div>
          </div>

          {/* ─── FEATURED OUTRIGHTS ─────────────────────────────────── */}
          <section>
            <SectionHead
              eyebrow={<><span className="text-dugout-gold">★</span> TOURNAMENT OUTRIGHTS</>}
              title={<>Long bets, <span className="text-dugout-gold">big swings.</span></>}
              right={<div className="font-mono text-[10px] tracking-[0.22em] text-white/40 uppercase">Settled after the Final</div>}
            />
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
              {OUTRIGHTS.map((m, i) => (
                <div key={m.id} className="reveal" style={{ ["--stagger-delay" as any]: `${i * 80}ms` }}>
                  <OutrightCard market={m} />
                </div>
              ))}
            </div>
          </section>

          {/* ─── GROUP MATCH MARKETS ────────────────────────────────── */}
          <section className="mt-20">
            <SectionHead
              eyebrow={<>MATCHDAY 1 · GROUP STAGE</>}
              title={<>Bet the <span className="text-dugout-electric">opening 8.</span></>}
              right={<div className="font-mono text-[10px] tracking-[0.22em] text-white/40 uppercase">Settled same day</div>}
            />
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-3">
              {GROUP_MATCHES.map((m, i) => (
                <div key={`${m.group}-${m.home.name}`} className="reveal" style={{ ["--stagger-delay" as any]: `${i * 50}ms` }}>
                  <MatchCard match={m} />
                </div>
              ))}
            </div>
          </section>

          {/* ─── NOVELTY MARKETS ────────────────────────────────────── */}
          <section className="mt-20">
            <SectionHead
              eyebrow={<>NOVELTY</>}
              title={<>For <span className="text-dugout-gold">degenerates.</span></>}
              right={<div className="font-mono text-[10px] tracking-[0.22em] text-white/40 uppercase">Niche · binary YES/NO</div>}
            />
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-3">
              {NOVELTY.map((n, i) => (
                <div key={i} className="reveal" style={{ ["--stagger-delay" as any]: `${i * 60}ms` }}>
                  <NoveltyCard {...n} />
                </div>
              ))}
            </div>
          </section>

          {/* ─── INFO STRIP ─────────────────────────────────────────── */}
          <section className="mt-24">
            <div className="rounded-[2rem] p-1.5 bg-white/[0.04] hairline-strong">
              <div className="rounded-[calc(2rem-0.375rem)] bg-dugout-surface/70 hairline inner-glow p-6 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                <InfoTile label="Settlement" value="Oracle-based" sub="Same matchday data used by Squad Wars" />
                <InfoTile label="Fee" value="2% on profit" sub="Only winners pay · taken from PnL" />
                <InfoTile label="Markets" value="120+" sub="Outrights · matches · novelty" />
              </div>
            </div>
          </section>

          {/* ─── CTA ────────────────────────────────────────────────── */}
          <section className="mt-20 text-center">
            <p className="text-white/55 mb-4 font-mono text-[11px] tracking-[0.22em] uppercase">While you wait</p>
            <Link
              href="/squad"
              className="group inline-flex items-center gap-3 rounded-full bg-dugout-gold pl-8 pr-2.5 py-3.5 text-dugout-black
                transition-transform duration-150 ease-out-strong active:scale-[0.96] hover:bg-dugout-gold-light animate-hot-edge"
            >
              <span className="font-display text-xl tracking-wider">DRAFT YOUR SQUAD</span>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-dugout-black/15 transition-transform duration-200 ease-out-strong group-hover:translate-x-0.5">
                <Arrow />
              </span>
            </Link>
          </section>

          <RelatedLinks current="/predict" />
        </div>
      </main>
    </>
  );
}

// ─── PIECES ─────────────────────────────────────────────────────────────────

function CountdownPanel({ c }: { c: { d: number; h: number; m: number; s: number; ready: boolean } }) {
  return (
    <div className="rounded-2xl p-[1.5px] bg-gradient-to-br from-dugout-gold/40 to-dugout-gold/0">
      <div className="rounded-[calc(1rem-1.5px)] bg-dugout-black/60 backdrop-blur-sm hairline inner-glow px-5 py-3">
        <div className="font-mono text-[10px] tracking-[0.22em] text-white/40 uppercase mb-2 text-center">
          Markets unlock in
        </div>
        <div className="flex items-baseline gap-4 font-mono tabular-nums">
          <TimeChip label="DAYS" value={c.d} />
          <Sep />
          <TimeChip label="HRS"  value={c.h} />
          <Sep />
          <TimeChip label="MIN"  value={c.m} />
          <Sep />
          <TimeChip label="SEC"  value={c.s} flicker />
        </div>
      </div>
    </div>
  );
}

function TimeChip({ label, value, flicker }: { label: string; value: number; flicker?: boolean }) {
  return (
    <div className="text-center">
      <div className={`font-display text-4xl text-dugout-gold tabular-nums leading-none ${flicker ? "animate-scoreboard" : ""}`}
        style={{ textShadow: "0 0 16px rgba(212,175,55,0.4)" }}>
        {String(value).padStart(2, "0")}
      </div>
      <div className="font-mono text-[9px] tracking-[0.22em] text-white/40 uppercase mt-1">{label}</div>
    </div>
  );
}

function Sep() {
  return <span className="font-display text-3xl text-white/20 leading-none">:</span>;
}

function OutrightCard({ market }: { market: Outright }) {
  const top = [...market.options].sort((a, b) => b.pct - a.pct)[0];

  return (
    <div className="group relative rounded-2xl p-[1.5px] bg-white/[0.04] hairline-strong hover-lift overflow-hidden">
      {/* Lock blur overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 backdrop-blur-[1.5px] bg-dugout-black/10" />
      <div className="absolute inset-0 pointer-events-none z-20 flex items-start justify-end p-3">
        <div className="rounded-full bg-dugout-black/70 backdrop-blur px-2 py-1 inline-flex items-center gap-1.5 ring-1 ring-white/10">
          <LockIcon size={10} />
          <span className="font-mono text-[9px] tracking-[0.2em] text-white/60 uppercase">Locked</span>
        </div>
      </div>

      <div className="rounded-[calc(1rem-1.5px)] bg-dugout-surface/70 hairline inner-glow p-6 relative">
        {/* Head */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="font-mono text-[10px] tracking-[0.22em] text-dugout-gold/80 uppercase">{market.category}</div>
            <div className="mt-2 font-display text-2xl text-white leading-tight">
              <HoverWord glow="gold">{market.question}</HoverWord>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-mono text-[9px] tracking-[0.22em] text-white/40 uppercase">Volume</div>
            <div className="font-display text-lg text-dugout-gold tabular-nums leading-none mt-1">{market.volume}</div>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2">
          {market.options.map((o) => {
            const isLeader = o.label === top.label;
            return (
              <div
                key={o.label}
                className={`relative rounded-lg px-3 py-2.5 overflow-hidden transition-colors duration-200
                  ${isLeader ? "bg-dugout-gold/10" : "bg-white/[0.03]"}`}
              >
                {/* Progress fill */}
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-700 ease-out-strong"
                  style={{
                    width: `${o.pct}%`,
                    background: isLeader
                      ? "linear-gradient(to right, rgba(212,175,55,0.20), rgba(212,175,55,0.04))"
                      : "linear-gradient(to right, rgba(255,255,255,0.06), rgba(255,255,255,0.01))",
                  }}
                />
                <div className="relative flex items-center justify-between">
                  <span className="text-sm text-white/90 flex items-center gap-2">
                    {o.flag && <span aria-hidden>{o.flag}</span>}
                    <HoverWord glow={isLeader ? "gold" : "white"}>{o.label}</HoverWord>
                  </span>
                  <span className={`font-display text-lg tabular-nums tracking-tight ${isLeader ? "text-dugout-gold" : "text-white/75"}`}>
                    {o.pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MatchCard({ match: m }: { match: GroupMatch }) {
  return (
    <div className="group relative rounded-2xl p-[1.5px] bg-white/[0.04] hairline-strong hover-lift overflow-hidden">
      {/* Lock layer */}
      <div className="absolute inset-0 pointer-events-none z-10 backdrop-blur-[1.5px] bg-dugout-black/10" />

      <div className="relative rounded-[calc(1rem-1.5px)] bg-dugout-surface/70 hairline inner-glow px-5 py-4 grid grid-cols-12 gap-3 items-center">
        {/* MD/group */}
        <div className="col-span-2 sm:col-span-1">
          <div className="font-mono text-[8px] tracking-[0.22em] text-white/40 uppercase">Grp</div>
          <div className="font-display text-2xl text-dugout-gold leading-none">{m.group}</div>
        </div>

        {/* Home */}
        <div className="col-span-3 text-right">
          <div className="font-mono text-[8px] tracking-[0.22em] text-white/40 uppercase">{m.home.odds}%</div>
          <div className="font-display text-lg text-white leading-tight">{m.home.flag} {m.home.name}</div>
        </div>

        {/* vs */}
        <div className="col-span-2 sm:col-span-2 text-center">
          <div className="font-mono text-[8px] tracking-[0.22em] text-white/30 uppercase">vs</div>
          <div className="font-mono text-[10px] tracking-[0.15em] text-white/55 mt-1">{m.date}</div>
        </div>

        {/* Away */}
        <div className="col-span-3">
          <div className="font-mono text-[8px] tracking-[0.22em] text-white/40 uppercase">{m.away.odds}%</div>
          <div className="font-display text-lg text-white leading-tight">{m.away.flag} {m.away.name}</div>
        </div>

        {/* Draw + lock */}
        <div className="col-span-2 sm:col-span-3 flex items-center justify-end gap-3">
          <div className="text-right">
            <div className="font-mono text-[8px] tracking-[0.22em] text-white/40 uppercase">Draw</div>
            <div className="font-display text-base text-white/70 tabular-nums leading-none">{m.draw}%</div>
          </div>
          <button
            disabled
            className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] hairline px-3 py-1.5 cursor-not-allowed"
          >
            <LockIcon size={10} />
            <span className="font-mono text-[9px] tracking-[0.22em] text-white/45 uppercase">Locked</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function NoveltyCard({ question, yes, sub }: { question: string; yes: number; sub: string }) {
  const no = 100 - yes;
  return (
    <div className="group relative rounded-2xl p-[1.5px] bg-white/[0.04] hairline-strong hover-lift overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-10 backdrop-blur-[1.5px] bg-dugout-black/10" />

      <div className="relative rounded-[calc(1rem-1.5px)] bg-dugout-surface/70 hairline inner-glow p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-display text-xl text-white leading-tight">
              <HoverWord glow="gold">{question}</HoverWord>
            </div>
            <div className="font-mono text-[9px] tracking-[0.18em] text-white/40 uppercase mt-1">{sub}</div>
          </div>
          <LockIcon size={12} />
        </div>

        {/* YES / NO bar */}
        <div className="mt-5 rounded-full h-2.5 overflow-hidden bg-white/[0.04] hairline flex">
          <div className="bg-dugout-electric/60" style={{ width: `${yes}%`, boxShadow: "0 0 10px rgba(0,255,135,0.3)" }} />
          <div className="bg-dugout-red/60" style={{ width: `${no}%` }} />
        </div>

        <div className="mt-2 flex items-center justify-between font-mono text-[11px] tabular-nums">
          <div className="flex items-center gap-1.5 text-dugout-electric">
            <span className="h-1.5 w-1.5 rounded-full bg-dugout-electric" />
            YES <span className="text-white/80">{yes}%</span>
          </div>
          <div className="flex items-center gap-1.5 text-dugout-red">
            NO <span className="text-white/80">{no}%</span>
            <span className="h-1.5 w-1.5 rounded-full bg-dugout-red" />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="hover-lift cursor-default">
      <div className="font-mono text-[9px] tracking-[0.22em] text-white/40 uppercase">{label}</div>
      <div className="font-display text-3xl text-white leading-none mt-2">
        <HoverWord glow="gold">{value}</HoverWord>
      </div>
      <div className="font-mono text-[10px] tracking-[0.18em] text-white/40 mt-2 leading-relaxed">{sub}</div>
    </div>
  );
}

function SectionHead({ eyebrow, title, right }: { eyebrow: React.ReactNode; title: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between flex-wrap gap-4">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] hairline px-3 py-1 font-mono text-[10px] tracking-[0.22em] text-white/70 uppercase hover-lift">
          {eyebrow}
        </div>
        <h2 className="mt-4 font-display text-white text-5xl sm:text-6xl leading-[0.9]">{title}</h2>
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

function LockIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size + 2} viewBox="0 0 12 14" fill="none" className="text-dugout-gold/80">
      <path d="M2 6V4a4 4 0 018 0v2M2 6h8v7H2V6z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9zM10 21a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
