"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Navigation,
  Volume2,
  VolumeX,
  Heart,
  CheckCircle,
  CalendarPlus,
} from "lucide-react";

/* =========================================================================
   ✅ SIRF YAHAN SE SAB KUCH CHANGE KARO
   - Date ISO format mein: "YYYY-MM-DDTHH:mm:ss+05:00" (+05:00 = Pakistan time)
   - Countdown khud is date ki taraf chalta hai
   - Mehman ka naam link se: /card?to=Ahmed
   ========================================================================= */
const CARD = {
  groomName: "Ali",
  groomParents: "Son of Mr. & Mrs. Ahmed",
  brideName: "Ayesha",
  brideParents: "Daughter of Mr. & Mrs. Hassan",

  eventTitle: "Walima",
  start: "2026-12-29T19:00:00+05:00",
  venue: "Royal Palm Golf & Country Club",
  address: "Bab-e-Azam Grand Marquee, Canal Bank Road, Lahore",
  mapsLink: "https://maps.google.com",

  whatsapp: "923001234567", // country code ke sath, + ke baghair
  musicSrc: "/sajna.mp3",

  // 💌 Pyara sa paigham (apni marzi se badal sakte ho)
  message:
    "Allah Ta'ala ke fazl-o-karam se hamari zindagi ka sab se haseen safar shuru ho raha hai. Is khushi ke mauqe par hamari dili khwahish hai ke aap apne pyaar bhare qadam hamari mehfil mein rakhein, apni duaon se hamein nawazein aur is yaadgar shaam ko hamare saath mil kar aur bhi roshan bana dein. Aap ki tashreef hamare liye baais-e-izzat aur aap ki dua hamara sab se qeemti tohfa hogi.",

  program: [
    { time: "06:30 PM", label: "Mehmanon ka istiqbal" },
    { time: "07:00 PM", label: "Dulha dulhan ki aamad" },
    { time: "07:30 PM", label: "Dua aur dawat" },
    { time: "09:30 PM", label: "Rukhsati" },
  ],
};

/* ============================ HELPERS ============================ */
const PK = "Asia/Karachi";
const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: PK,
  }).format(new Date(iso));
const fmtTime = (iso: string) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: PK,
  }).format(new Date(iso));

const gcalLink = () => {
  const s = new Date(CARD.start);
  const e = new Date(s.getTime() + 4 * 3600 * 1000);
  const f = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `${CARD.eventTitle} - ${CARD.groomName} & ${CARD.brideName}`,
  )}&dates=${f(s)}/${f(e)}&location=${encodeURIComponent(`${CARD.venue}, ${CARD.address}`)}`;
};

const rnd = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const BULBS = ["#FFB547", "#FF7E9D", "#6FE7DD", "#FFE08A"];

function strandPoints(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  sag: number,
  n: number,
): [number, number][] {
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2 + sag * 2;
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push([
      (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2,
      (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2,
    ]);
  }
  return pts;
}

// [x1, y1, x2, y2, jhukaav, bulbon ki tadaad]
const STRANDS: [number, number, number, number, number, number][] = [
  [30, 262, 370, 262, 26, 18],
  [40, 200, 120, 200, 10, 6],
  [280, 200, 360, 200, 10, 6],
  [122, 182, 278, 182, 14, 9],
  [135, 150, 265, 150, 6, 8],
];

const ARCH = "M165 285 V225 A35 35 0 0 1 235 225 V285 Z";

/* ============================ HALL SCENE (SVG) ============================ */
function HallScene({ open, ping }: { open: boolean; ping?: boolean }) {
  const win = (x: number, y: number, d: number) => (
    <path
      key={`${x}-${y}`}
      className="win"
      style={{ animationDelay: `${d}s` }}
      d={`M${x} ${y + 20} v-13 a6 6 0 0 1 12 0 v13 z`}
      fill="#FFD27A"
    />
  );

  return (
    <svg
      viewBox="0 0 400 320"
      className={"hall" + (open ? " open" : "")}
      role="img"
      aria-label="Marriage hall"
    >
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F2D7A6" />
          <stop offset="1" stopColor="#B98349" />
        </linearGradient>
        <linearGradient id="domeG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#35B8A8" />
          <stop offset="1" stopColor="#146B6B" />
        </linearGradient>
        <radialGradient id="warm" cx="50%" cy="70%" r="70%">
          <stop offset="0" stopColor="#FFF4C2" />
          <stop offset="1" stopColor="#FF9F43" />
        </radialGradient>
        <clipPath id="archClip">
          <path d={ARCH} />
        </clipPath>
        <mask id="moonMask">
          <rect width="400" height="320" fill="#fff" />
          <circle cx="344" cy="38" r="15" fill="#000" />
        </mask>
      </defs>

      {/* Chand */}
      <circle
        cx="334"
        cy="44"
        r="18"
        fill="#FFE9A8"
        mask="url(#moonMask)"
        className="moon"
      />

      {/* Minarets */}
      {[118, 273].map((x) => (
        <g key={x}>
          <rect x={x} y="100" width="9" height="185" fill="url(#wall)" />
          <rect x={x - 3} y="130" width="15" height="4" fill="#F2C46D" />
          <path
            d={`M${x - 2} 100 Q${x + 4.5} 78 ${x + 11} 100Z`}
            fill="url(#domeG)"
          />
          <circle cx={x + 4.5} cy="76" r="2.5" fill="#F2C46D" />
        </g>
      ))}

      {/* Wings */}
      <rect x="40" y="200" width="80" height="85" fill="url(#wall)" />
      <rect x="280" y="200" width="80" height="85" fill="url(#wall)" />
      <path d="M48 200 Q80 148 112 200Z" fill="url(#domeG)" />
      <path d="M288 200 Q320 148 352 200Z" fill="url(#domeG)" />
      <circle cx="80" cy="152" r="2.5" fill="#F2C46D" />
      <circle cx="320" cy="152" r="2.5" fill="#F2C46D" />

      {/* Central block + dome */}
      <rect x="120" y="150" width="160" height="135" fill="url(#wall)" />
      <path d="M133 150 Q200 52 267 150Z" fill="url(#domeG)" />
      <line
        x1="200"
        y1="72"
        x2="200"
        y2="52"
        stroke="#F2C46D"
        strokeWidth="2"
      />
      <circle cx="200" cy="50" r="3.5" fill="#F2C46D" />
      <rect x="133" y="146" width="134" height="5" fill="#F2C46D" />

      {/* Windows */}
      {win(58, 226, 0)}
      {win(80, 226, 0.7)}
      {win(102, 226, 1.4)}
      {win(298, 226, 0.4)}
      {win(320, 226, 1.1)}
      {win(342, 226, 1.8)}
      {win(138, 188, 0.3)}
      {win(250, 188, 0.9)}

      {/* Darwaza */}
      <path d={ARCH} fill="#7A4A2A" />
      <g clipPath="url(#archClip)">
        <rect
          x="165"
          y="190"
          width="70"
          height="95"
          fill="url(#warm)"
          className="doorglow"
        />
        <rect
          x="165"
          y="190"
          width="35"
          height="95"
          fill="#5A2E22"
          stroke="#F2C46D"
          strokeWidth="1.5"
          className="dl"
        />
        <rect
          x="200"
          y="190"
          width="35"
          height="95"
          fill="#5A2E22"
          stroke="#F2C46D"
          strokeWidth="1.5"
          className="dr"
        />
      </g>
      <path d={ARCH} fill="none" stroke="#F2C46D" strokeWidth="3" />

      {/* Seedhiyan */}
      <rect x="150" y="285" width="100" height="8" fill="#C99A5B" />
      <rect x="140" y="293" width="120" height="8" fill="#A87A44" />

      {/* Darakht */}
      {[16, 384].map((x) => (
        <path
          key={x}
          d={`M${x} 285 C${x - 15} 240 ${x - 7} 190 ${x} 168 C${x + 7} 190 ${x + 15} 240 ${x} 285 Z`}
          fill="#0F3B2E"
        />
      ))}

      {/* Zameen aur roshni ka aks */}
      <rect x="0" y="301" width="400" height="19" fill="#1C1033" />
      <ellipse
        cx="200"
        cy="304"
        rx="120"
        ry="9"
        fill="url(#warm)"
        opacity=".4"
        className="doorglow"
      />

      {/* Fairy lights */}
      {STRANDS.map(([x1, y1, x2, y2, sag, n], s) => {
        const pts = strandPoints(x1, y1, x2, y2, sag, n);
        return (
          <g key={s}>
            <path
              d={`M${x1} ${y1} Q${(x1 + x2) / 2} ${(y1 + y2) / 2 + sag * 2} ${x2} ${y2}`}
              fill="none"
              stroke="rgba(255,255,255,.25)"
              strokeWidth=".8"
            />
            {pts.map(([x, y], i) => {
              const c = BULBS[(i + s) % BULBS.length];
              return (
                <g
                  key={i}
                  className="bulb"
                  style={{ animationDelay: `${(i * 0.17 + s * 0.4) % 2.4}s` }}
                >
                  <circle cx={x} cy={y + 2} r="5" fill={c} opacity=".28" />
                  <circle cx={x} cy={y + 2} r="2" fill={c} />
                </g>
              );
            })}
          </g>
        );
      })}

      {ping && !open && (
        <circle
          cx="200"
          cy="248"
          r="16"
          fill="none"
          stroke="#FFE9A8"
          strokeWidth="2"
          className="ping"
        />
      )}
    </svg>
  );
}

/* ============================ FIREWORKS ============================ */
type P = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  c: string;
};

function Fireworks({ trigger, auto }: { trigger: number; auto: boolean }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const parts = useRef<P[]>([]);

  const burst = useCallback((x: number, y: number) => {
    const colors = ["#FFB547", "#FF7E9D", "#6FE7DD", "#FFE08A", "#FFFFFF"];
    const c = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < 64; i++) {
      const a = (Math.PI * 2 * i) / 64;
      const s = 1.5 + Math.random() * 3.2;
      parts.current.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 0,
        max: 60 + Math.random() * 30,
        c,
      });
    }
  }, []);

  const randomBurst = useCallback(() => {
    const cv = ref.current;
    if (!cv) return;
    burst(
      cv.width * (0.15 + Math.random() * 0.7),
      cv.height * (0.12 + Math.random() * 0.35),
    );
  }, [burst]);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const resize = () => {
      cv.width = window.innerWidth;
      cv.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    let raf = 0;
    const loop = () => {
      ctx.clearRect(0, 0, cv.width, cv.height);
      parts.current = parts.current.filter((p) => p.life < p.max);
      for (const p of parts.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.045;
        p.vx *= 0.985;
        p.life++;
        ctx.globalAlpha = 1 - p.life / p.max;
        ctx.fillStyle = p.c;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  useEffect(() => {
    if (trigger > 0) [0, 350, 700].forEach((d) => setTimeout(randomBurst, d));
  }, [trigger, randomBurst]);

  useEffect(() => {
    if (!auto) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(randomBurst, 3800);
    return () => clearInterval(id);
  }, [auto, randomBurst]);

  return <canvas ref={ref} className="fw" />;
}

/* ============================ SMALL PIECES ============================ */
function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      className="rv"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Digit({ v }: { v: string }) {
  return (
    <span className="dg">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={v}
          initial={{ y: -16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 16, opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{ display: "inline-block" }}
        >
          {v}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ============================ MAIN ============================ */
export default function MarriageHallCard() {
  const [stage, setStage] = useState<"intro" | "opening" | "content">("intro");
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [guest, setGuest] = useState("");
  const [burstKey, setBurstKey] = useState(0);
  const [ameen, setAmeen] = useState(0);

  const [name, setName] = useState("");
  const [count, setCount] = useState("1");
  const [attending, setAttending] = useState<"yes" | "no">("yes");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    setMounted(true);
    const to = new URLSearchParams(window.location.search).get("to");
    if (to) {
      setGuest(to);
      setName(to);
    }
  }, []);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const target = Date.parse(CARD.start);
  const done = now !== null && now >= target;
  const diff = now === null ? 0 : Math.max(0, target - now);
  const units: [string, number][] = [
    ["Din", Math.floor(diff / 86400000)],
    ["Ghante", Math.floor(diff / 3600000) % 24],
    ["Minute", Math.floor(diff / 60000) % 60],
    ["Second", Math.floor(diff / 1000) % 60],
  ];

  const enter = () => {
    if (stage !== "intro") return;
    setStage("opening");
    setBurstKey((b) => b + 1);
    audioRef.current
      ?.play()
      .then(() => setPlaying(true))
      .catch(() => {});
    setTimeout(() => {
      setStage("content");
      setBurstKey((b) => b + 1);
    }, 2300);
  };

  const toggleMusic = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play()
        .then(() => setPlaying(true))
        .catch(() => {});
    }
  };

  const submitRSVP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const msg =
      `Assalam o Alaikum! ${name.trim()} ` +
      (attending === "yes"
        ? `inshaAllah ${CARD.eventTitle} mein shamil hoon ga/gi (${count} mehman).`
        : "afsos, shamil nahi ho sakoon ga/gi.") +
      (note.trim() ? ` ${note.trim()}` : "");
    setSent(true);
    setBurstKey((b) => b + 1);
    window.open(
      `https://wa.me/${CARD.whatsapp}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
  };

  const initials = `${CARD.groomName[0]}${CARD.brideName[0]}`;

  return (
    <div className="root">
      <audio ref={audioRef} src={CARD.musicSrc} loop preload="auto" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Italiana&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Great+Vibes&family=Amiri:wght@700&display=swap"
      />
      <style>{CSS}</style>

      {/* Raat ka aasman: sitare aur lanterns */}
      <div className="sky" />
      {mounted && (
        <>
          <div className="layer">
            {Array.from({ length: 70 }).map((_, i) => (
              <i
                key={i}
                className="star"
                style={{
                  left: `${rnd(i, 1) * 100}%`,
                  top: `${rnd(i, 2) * 75}%`,
                  width: 1 + rnd(i, 3) * 2.2,
                  height: 1 + rnd(i, 3) * 2.2,
                  animationDelay: `${rnd(i, 4) * 4}s`,
                  animationDuration: `${2 + rnd(i, 5) * 3}s`,
                }}
              />
            ))}
          </div>
          <div className="layer">
            {Array.from({ length: 9 }).map((_, i) => (
              <span
                key={i}
                className="lantern"
                style={{
                  left: `${6 + rnd(i, 7) * 88}%`,
                  animationDuration: `${16 + rnd(i, 8) * 12}s`,
                  animationDelay: `${-rnd(i, 9) * 24}s`,
                  transform: `scale(${0.7 + rnd(i, 10) * 0.7})`,
                }}
              />
            ))}
          </div>
        </>
      )}

      <Fireworks trigger={burstKey} auto={stage === "content"} />

      {stage === "content" && (
        <motion.div className="bar" style={{ scaleX: scrollYProgress }} />
      )}

      {stage === "content" && (
        <button className="music" onClick={toggleMusic} aria-label="Music">
          {playing ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      )}

      {/* ================= INTRO: DARWAZA ================= */}
      <AnimatePresence>
        {stage !== "content" && (
          <motion.div
            className="intro"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
            onClick={enter}
            role="button"
            aria-label="Darwaza kholein"
          >
            <motion.div
              className="intro-top"
              animate={
                stage === "opening"
                  ? { opacity: 0, y: -30 }
                  : { opacity: 1, y: 0 }
              }
              transition={{ duration: 0.8 }}
            >
              <span className="mini">Walima ka dawat naama</span>
              <span className="script gold shine">
                {CARD.groomName} &amp; {CARD.brideName}
              </span>
            </motion.div>

            <motion.div
              className="scene"
              animate={stage === "opening" ? { scale: 3.6 } : { scale: 1 }}
              style={{ transformOrigin: "50% 76%" }}
              transition={{
                duration: 2.1,
                ease: [0.65, 0, 0.35, 1],
                delay: stage === "opening" ? 0.5 : 0,
              }}
            >
              <HallScene open={stage === "opening"} ping />
            </motion.div>

            <motion.p
              className="hint"
              animate={
                stage === "opening"
                  ? { opacity: 0 }
                  : { opacity: [0.5, 1, 0.5] }
              }
              transition={
                stage === "opening"
                  ? { duration: 0.4 }
                  : { duration: 2.2, repeat: Infinity }
              }
            >
              Darwaza kholne ke liye tap karein
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= CONTENT ================= */}
      {stage === "content" && (
        <main className="page">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="hero-scene"
          >
            <HallScene open />
          </motion.div>

          <motion.div
            className="bismillah"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </motion.div>

          {guest && (
            <motion.p
              className="dear"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              Dear {guest},
            </motion.p>
          )}

          <motion.h1
            className="script gold shine big"
            initial={{
              opacity: 0,
              letterSpacing: "0.2em",
              filter: "blur(10px)",
            }}
            animate={{ opacity: 1, letterSpacing: "0em", filter: "blur(0px)" }}
            transition={{ delay: 0.8, duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {CARD.groomName}
          </motion.h1>
          <motion.p
            className="par"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            {CARD.groomParents}
          </motion.p>

          <motion.div
            className="amp"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.6, type: "spring", stiffness: 160 }}
          >
            <Heart size={22} fill="#FF7E9D" stroke="none" className="beat" />
          </motion.div>

          <motion.h1
            className="script gold shine big"
            initial={{
              opacity: 0,
              letterSpacing: "0.2em",
              filter: "blur(10px)",
            }}
            animate={{ opacity: 1, letterSpacing: "0em", filter: "blur(0px)" }}
            transition={{ delay: 1.8, duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {CARD.brideName}
          </motion.h1>
          <motion.p
            className="par"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
          >
            {CARD.brideParents}
          </motion.p>

          {/* PAIGHAM */}
          <Reveal>
            <section className="glass msg">
              <div className="mini">Dil se dawat</div>
              <p>{CARD.message}</p>
            </section>
          </Reveal>

          {/* COUNTDOWN */}
          <Reveal>
            <section className="sec">
              <h2 className="title">
                {done
                  ? "Jashan shuru ho chuka"
                  : `${CARD.eventTitle} mein baqi`}
              </h2>
              {!done && (
                <div className="count">
                  {units.map(([l, v]) => (
                    <div key={l} className="cbox">
                      <strong>
                        {now === null
                          ? "--"
                          : String(v)
                              .padStart(2, "0")
                              .split("")
                              .map((ch, i) => <Digit key={i} v={ch} />)}
                      </strong>
                      <span>{l}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </Reveal>

          {/* VENUE */}
          <Reveal>
            <section className="sec">
              <h2 className="title">{CARD.eventTitle} ki Mehfil</h2>
              <div className="venue-card">
                <div className="venue-in">
                  <div className="row">
                    <Calendar size={18} /> <span>{fmtDate(CARD.start)}</span>
                  </div>
                  <div className="row">
                    <Clock size={18} /> <span>{fmtTime(CARD.start)}</span>
                  </div>
                  <div className="line" />
                  <div className="row top">
                    <MapPin size={18} />
                    <span>
                      <b>{CARD.venue}</b>
                      <br />
                      <small>{CARD.address}</small>
                    </span>
                  </div>
                  <div className="btns">
                    <a
                      className="btn"
                      href={CARD.mapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Navigation size={15} /> Raasta dekhein
                    </a>
                    <a
                      className="btn ghost"
                      href={gcalLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <CalendarPlus size={15} /> Calendar mein add
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </Reveal>

          {/* PROGRAM */}
          <Reveal>
            <section className="sec">
              <h2 className="title">Shaam ka Program</h2>
              <div className="tl">
                <motion.i
                  className="tl-line"
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.6, ease: "easeInOut" }}
                />
                {CARD.program.map((p, i) => (
                  <motion.div
                    key={p.time}
                    className="tl-row"
                    initial={{ opacity: 0, x: i % 2 ? 30 : -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.7, delay: i * 0.12 }}
                  >
                    <em />
                    <b>{p.time}</b>
                    <span>{p.label}</span>
                  </motion.div>
                ))}
              </div>
            </section>
          </Reveal>

          {/* DUA */}
          <Reveal>
            <section className="glass dua">
              <h2 className="title">Dulha Dulhan ke liye Dua</h2>
              <p className="arabic">
                بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي
                خَيْرٍ
              </p>
              <p className="tarjuma">
                Allah aap ko barkat de, aap par barkat nazil farmaye aur aap
                dono ko khair mein jama rakhe.
              </p>
              <button
                className="btn"
                onClick={() => {
                  setAmeen((n) => n + 1);
                  setBurstKey((b) => b + 1);
                }}
              >
                <Heart size={15} /> Ameen
              </button>
              <p className="par" style={{ marginTop: 12 }}>
                {ameen > 0
                  ? `Aap ne ${ameen} baar ameen kaha. JazakAllah.`
                  : "Dua ke liye ameen par tap karein."}
              </p>
            </section>
          </Reveal>

          {/* RSVP */}
          <Reveal>
            <section className="glass rsvp">
              <h2 className="title">Aap ka jawab</h2>
              {!sent ? (
                <form onSubmit={submitRSVP}>
                  <input
                    required
                    placeholder="Aap ka poora naam"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <div className="seg">
                    <button
                      type="button"
                      className={attending === "yes" ? "on" : ""}
                      onClick={() => setAttending("yes")}
                    >
                      InshaAllah aaunga/aaungi
                    </button>
                    <button
                      type="button"
                      className={attending === "no" ? "on" : ""}
                      onClick={() => setAttending("no")}
                    >
                      Nahi aa sakoon ga/gi
                    </button>
                  </div>
                  {attending === "yes" && (
                    <select
                      value={count}
                      onChange={(e) => setCount(e.target.value)}
                    >
                      <option value="1">1 mehman</option>
                      <option value="2">2 mehman</option>
                      <option value="3">3 mehman</option>
                      <option value="4+">4 ya zyada (family)</option>
                    </select>
                  )}
                  <textarea
                    rows={2}
                    placeholder="Dulha dulhan ke liye paigham (optional)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <button className="btn big-btn" type="submit">
                    WhatsApp par jawab bhejein
                  </button>
                </form>
              ) : (
                <div className="thanks">
                  <CheckCircle size={42} color="#6FE7DD" />
                  <h3>Shukriya, {name}!</h3>
                  <p>
                    Aap ka jawab bhej diya gaya hai. Hum aap ke muntazir hain.
                  </p>
                </div>
              )}
            </section>
          </Reveal>

          <Reveal>
            <div className="end">
              <div className="seal">
                <span className="script">{initials}</span>
              </div>
              <p className="par">
                Aap ki tashreef hamare liye baais-e-izzat hogi
              </p>
              <span className="script gold shine fin">
                {CARD.groomName} &amp; {CARD.brideName}
              </span>
            </div>
          </Reveal>
        </main>
      )}
    </div>
  );
}

/* ============================ STYLES ============================ */
const CSS = `
.root{--night1:#120A2A;--night2:#2A1448;--plum:#4A1F63;--saffron:#FFB547;--gold:#F2C46D;--cream:#FFF4E0;--rose:#FF7E9D;--teal:#6FE7DD;
  min-height:100vh;position:relative;overflow-x:hidden;color:var(--cream);font-family:'Cormorant Garamond',serif}
.root *{box-sizing:border-box}
.sky{position:fixed;inset:0;z-index:0;background:radial-gradient(ellipse at 50% 110%,#5B2A6E 0%,transparent 55%),linear-gradient(180deg,var(--night1) 0%,var(--night2) 70%,var(--plum) 100%)}
.layer{position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden}
.star{position:absolute;border-radius:50%;background:#fff;animation:tw 3s ease-in-out infinite}
@keyframes tw{0%,100%{opacity:.15}50%{opacity:1}}
.lantern{position:absolute;bottom:-60px;width:20px;height:28px;border-radius:8px 8px 10px 10px;background:linear-gradient(180deg,#FFD27A,#FF8A3D);box-shadow:0 0 22px 6px rgba(255,170,70,.55);animation:rise linear infinite;opacity:.85}
.lantern::before{content:"";position:absolute;left:50%;top:-10px;width:1px;height:10px;background:rgba(255,255,255,.4)}
@keyframes rise{0%{margin-bottom:0;translate:0 0;opacity:0}8%{opacity:.85}50%{translate:16px 0}100%{margin-bottom:112vh;translate:-8px 0;opacity:0}}
.fw{position:fixed;inset:0;z-index:150;pointer-events:none}
.bar{position:fixed;top:0;left:0;right:0;height:3px;z-index:200;transform-origin:left;background:linear-gradient(90deg,var(--rose),var(--saffron),var(--teal))}
.music{position:fixed;right:16px;bottom:18px;z-index:200;width:46px;height:46px;border-radius:50%;border:1.5px solid var(--gold);background:rgba(18,10,42,.75);color:var(--gold);display:flex;align-items:center;justify-content:center;cursor:pointer;backdrop-filter:blur(6px)}

.script{font-family:'Great Vibes',cursive;font-weight:400}
.gold{color:var(--gold)}
.shine{background:linear-gradient(100deg,#F2C46D 20%,#FFF6D6 45%,#FFB547 60%,#F2C46D 80%);background-size:250% auto;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:shine 5s linear infinite}
@keyframes shine{to{background-position:-250% center}}
.mini{font-family:'Italiana',serif;font-size:15px;letter-spacing:.35em;text-transform:uppercase;color:var(--gold);opacity:.9}

/* hall svg */
.hall{width:100%;height:auto;display:block;overflow:visible}
.bulb{animation:bulb 2.4s ease-in-out infinite}
@keyframes bulb{0%,100%{opacity:.3}50%{opacity:1}}
.win{animation:flick 3.2s ease-in-out infinite}
@keyframes flick{0%,100%{opacity:.55}45%{opacity:1}60%{opacity:.8}}
.doorglow{animation:dglow 3s ease-in-out infinite}
@keyframes dglow{0%,100%{opacity:.75}50%{opacity:1}}
.moon{animation:dglow 5s ease-in-out infinite}
.dl,.dr{transform-box:fill-box;transition:transform 1.7s cubic-bezier(.65,0,.35,1)}
.dl{transform-origin:left center}
.dr{transform-origin:right center}
.hall.open .dl,.hall.open .dr{transform:scaleX(.06)}
.ping{transform-box:fill-box;transform-origin:center;animation:ping 2s ease-out infinite}
@keyframes ping{0%{transform:scale(.5);opacity:.9}100%{transform:scale(2.2);opacity:0}}

/* intro */
.intro{position:fixed;inset:0;z-index:100;display:flex;flex-direction:column;align-items:center;justify-content:space-between;overflow:hidden;cursor:pointer;background:transparent;padding:44px 0 26px}
.intro-top{display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;padding:0 16px}
.intro-top .script{font-size:clamp(46px,11vw,72px);line-height:1.1}
.scene{width:min(100%,560px)}
.hint{margin:6px 0 0;font-style:italic;font-size:20px;color:var(--cream);letter-spacing:.04em}

/* content */
.page{position:relative;z-index:10;max-width:560px;margin:0 auto;padding:24px 18px 120px;display:flex;flex-direction:column;align-items:center;text-align:center}
.hero-scene{width:100%;max-width:460px}
.bismillah{font-family:'Amiri',serif;font-weight:700;font-size:32px;margin:14px 0 4px;color:var(--cream)}
.dear{font-style:italic;font-size:21px;color:var(--teal);margin:0 0 4px}
.big{font-size:clamp(70px,19vw,104px);line-height:1.05;margin:0}
.par{font-style:italic;font-size:18px;color:rgba(255,244,224,.75);margin:2px 0 0}
.amp{margin:10px 0 4px}
.beat{animation:beat 1.6s ease-in-out infinite}
@keyframes beat{0%,100%{transform:scale(1)}50%{transform:scale(1.3)}}

.rv{width:100%}
.glass{width:100%;margin-top:40px;padding:28px 20px;border-radius:24px;background:rgba(255,244,224,.07);border:1px solid rgba(242,196,109,.3);backdrop-filter:blur(8px);box-shadow:0 20px 50px rgba(0,0,0,.25)}
.msg{text-align:center}
.msg p{font-size:21px;line-height:1.65;font-style:italic;margin:12px 0 0;color:var(--cream)}
.sec{width:100%;margin-top:46px;display:flex;flex-direction:column;align-items:center}
.title{font-family:'Italiana',serif;font-weight:400;font-size:32px;letter-spacing:.06em;margin:0 0 20px;color:var(--cream)}

.count{display:flex;gap:10px;width:100%;max-width:420px}
.cbox{flex:1;padding:16px 4px 12px;border-radius:16px;background:rgba(255,244,224,.08);border:1px solid rgba(242,196,109,.35)}
.cbox strong{display:flex;justify-content:center;font-family:'Italiana',serif;font-weight:400;font-size:38px;line-height:1;color:var(--saffron)}
.dg{position:relative;display:inline-block;min-width:.6em}
.cbox span{display:block;margin-top:6px;font-size:14px;letter-spacing:.12em;color:rgba(255,244,224,.7)}

.venue-card{position:relative;width:100%;border-radius:24px;overflow:hidden;padding:2px}
.venue-card::before{content:"";position:absolute;inset:-60%;background:conic-gradient(from 0deg,transparent 0 60%,var(--gold) 80%,var(--rose) 90%,transparent 100%);animation:spin 6s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.venue-in{position:relative;border-radius:22px;background:linear-gradient(160deg,#241042,#170A30);padding:26px 20px;display:flex;flex-direction:column;align-items:center;gap:10px}
.row{display:flex;align-items:center;gap:10px;font-size:20px}
.row.top{align-items:flex-start;text-align:left}
.row svg{color:var(--saffron);flex-shrink:0}
.row small{font-size:16px;color:rgba(255,244,224,.7)}
.line{width:70%;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent);margin:6px 0}
.btns{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:10px}
.btn{display:inline-flex;align-items:center;gap:8px;border:1.5px solid transparent;border-radius:999px;padding:11px 20px;font:700 15px 'Cormorant Garamond',serif;color:#2A1448;background:linear-gradient(135deg,#FFD27A,var(--saffron));text-decoration:none;cursor:pointer;box-shadow:0 8px 22px rgba(255,181,71,.3)}
.btn.ghost{background:transparent;color:var(--gold);border-color:var(--gold);box-shadow:none}
.big-btn{justify-content:center;padding:15px 20px;border-radius:14px;font-size:17px}

.tl{position:relative;width:100%;max-width:360px;text-align:left;padding-left:34px}
.tl-line{position:absolute;left:8px;top:6px;bottom:6px;width:2px;background:linear-gradient(180deg,var(--rose),var(--saffron),var(--teal));transform-origin:top}
.tl-row{position:relative;display:flex;flex-direction:column;padding-bottom:22px}
.tl-row:last-child{padding-bottom:0}
.tl-row em{position:absolute;left:-33px;top:6px;width:14px;height:14px;border-radius:50%;background:var(--saffron);box-shadow:0 0 14px 3px rgba(255,181,71,.6)}
.tl-row b{font-family:'Italiana',serif;font-weight:400;font-size:22px;color:var(--saffron)}
.tl-row span{font-size:19px}

.arabic{font-family:'Amiri',serif;font-weight:700;font-size:30px;line-height:2;margin:0 0 10px;color:var(--gold);direction:rtl}
.tarjuma{font-size:20px;font-style:italic;line-height:1.55;margin:0 0 18px}
.dua .title,.rsvp .title{margin-bottom:16px}

.rsvp form{display:flex;flex-direction:column;gap:12px;max-width:380px;margin:0 auto}
.rsvp input,.rsvp select,.rsvp textarea{width:100%;background:rgba(18,10,42,.6);color:var(--cream);border:1.5px solid rgba(242,196,109,.4);border-radius:12px;padding:13px 15px;font:600 17px 'Cormorant Garamond',serif;outline:none;resize:none}
.rsvp input::placeholder,.rsvp textarea::placeholder{color:rgba(255,244,224,.5)}
.rsvp input:focus,.rsvp select:focus,.rsvp textarea:focus{border-color:var(--saffron)}
.rsvp option{color:#222}
.seg{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.seg button{background:rgba(18,10,42,.6);color:var(--cream);border:1.5px solid rgba(242,196,109,.4);border-radius:12px;padding:11px 6px;font:600 15px 'Cormorant Garamond',serif;cursor:pointer}
.seg button.on{background:var(--saffron);color:#2A1448;border-color:var(--saffron)}
.thanks{display:flex;flex-direction:column;align-items:center;gap:6px}
.thanks h3{margin:4px 0;font-family:'Italiana',serif;font-weight:400;font-size:28px}
.thanks p{margin:0;font-style:italic;color:rgba(255,244,224,.75);font-size:18px}

.end{margin-top:54px;display:flex;flex-direction:column;align-items:center;gap:6px}
.seal{width:84px;height:84px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 35% 30%,#FFE9A8,var(--gold) 55%,#8A6414);color:#3D2A05;box-shadow:0 0 30px 6px rgba(242,196,109,.4);animation:dglow 3s ease-in-out infinite}
.seal .script{font-size:34px}
.fin{font-size:50px;line-height:1.2}

@media (max-width:480px){.bismillah{font-size:27px}.arabic{font-size:26px}.msg p{font-size:19px}.cbox strong{font-size:32px}}
@media (prefers-reduced-motion:reduce){.star,.lantern,.bulb,.win,.shine,.venue-card::before,.beat,.ping{animation:none}}
`;
