import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  User, Trophy, ArrowLeftRight, BarChart3, Star, ChevronRight,
  RotateCcw, ShieldCheck, Plus, Minus, Goal, Activity, Calendar,
  TrendingUp, TrendingDown, X, Check, Globe2
} from "lucide-react";

/* ============================== DESIGN TOKENS ============================== */
const C = {
  bg: "#0E2A1E",
  bgDeep: "#0A2018",
  surface: "#163826",
  surfaceAlt: "#1C4631",
  surfaceLine: "#2A5740",
  gold: "#C9A227",
  goldSoft: "#E0C463",
  turf: "#4F9D6E",
  text: "#F2EFE6",
  textDim: "#9FB3A6",
  textFaint: "#6E8A7B",
  danger: "#C0392B",
  win: "#4F9D6E",
  draw: "#C9A227",
  loss: "#C0392B",
};

const FONT_DISPLAY = "'Oswald', sans-serif";
const FONT_BODY = "'Inter', sans-serif";
const FONT_MONO = "'Roboto Mono', monospace";

function useGoogleFonts() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@400;500;700&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);
}

/* ============================== HELPERS ============================== */
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}
function poissonRandom(lambda) {
  const L = Math.exp(-lambda);
  let k = 0, p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

/* ============================== PLAYER DATA ============================== */
const POSITIONS = ["Portiere", "Difensore", "Centrocampista", "Attaccante"];

const OUTFIELD_ATTRS = [
  { key: "vel", label: "Velocità" },
  { key: "tiro", label: "Tiro" },
  { key: "pas", label: "Passaggio" },
  { key: "dri", label: "Dribbling" },
  { key: "dif", label: "Difesa" },
  { key: "fis", label: "Fisico" },
];
const GK_ATTRS = [
  { key: "rifl", label: "Riflessi" },
  { key: "pres", label: "Presa" },
  { key: "rin", label: "Rinvio" },
  { key: "pos", label: "Posizionamento" },
  { key: "vel", label: "Velocità" },
  { key: "men", label: "Mentalità" },
];
function attrsForPosition(pos) {
  return pos === "Portiere" ? GK_ATTRS : OUTFIELD_ATTRS;
}
function computeOverall(pos, a) {
  if (pos === "Portiere") {
    return Math.round(a.rifl * 0.3 + a.pres * 0.25 + a.pos * 0.2 + a.rin * 0.15 + a.men * 0.1);
  }
  if (pos === "Attaccante") {
    return Math.round(a.tiro * 0.3 + a.dri * 0.25 + a.vel * 0.2 + a.pas * 0.15 + a.fis * 0.1);
  }
  if (pos === "Centrocampista") {
    return Math.round(a.pas * 0.3 + a.dri * 0.2 + a.vel * 0.15 + a.dif * 0.15 + a.fis * 0.1 + a.tiro * 0.1);
  }
  return Math.round(a.dif * 0.35 + a.fis * 0.25 + a.vel * 0.15 + a.pas * 0.15 + a.dri * 0.1);
}

/* ---- Appearance options ---- */
const GENDERS = ["Maschio", "Femmina", "Non binario"];
const SKIN_TONES = ["#FFE0BD", "#F1C27D", "#E0AC69", "#C68642", "#8D5524", "#5C3A21"];
const HAIR_COLORS = ["#1B1B1B", "#4A2E1E", "#8B5A2B", "#D4A017", "#B0B0B0", "#9C2B2B"];
const HAIR_STYLES = ["Rasati", "Corti", "Mossi", "Ricci", "Lunghi"];

/* ---- XP / Leveling ---- */
function xpForLevel(level) {
  return 90 + (level - 1) * 42;
}
function computeMatchXp(perf, result) {
  let xp = 18;
  xp += perf.goals * 16;
  xp += perf.assists * 9;
  if (perf.cleanSheet) xp += 8;
  xp += result === "win" ? 14 : result === "draw" ? 5 : 0;
  xp += Math.round((perf.rating - 6) * 5);
  if (perf.red) xp -= 8;
  return Math.max(6, xp);
}

/* ============================== NAZIONI E CAMPIONATI ============================== */
const NATIONS = [
  { id: "IT", name: "Italia", flag: "🇮🇹", tiers: ["Serie A", "Serie B", "Lega Pro"] },
  { id: "ES", name: "Spagna", flag: "🇪🇸", tiers: ["LaLiga", "LaLiga 2", "Primera RFEF"] },
  { id: "FR", name: "Francia", flag: "🇫🇷", tiers: ["Ligue 1", "Ligue 2", "National"] },
  { id: "DE", name: "Germania", flag: "🇩🇪", tiers: ["Bundesliga", "2. Bundesliga", "3. Liga"] },
  { id: "PT", name: "Portogallo", flag: "🇵🇹", tiers: ["Liga Portugal", "Liga Portugal 2", "Liga 3"] },
];
function nationById(id) {
  return NATIONS.find((n) => n.id === id);
}
function tierLabel(nationId, tierIndex) {
  const n = nationById(nationId);
  return n ? n.tiers[tierIndex] : "";
}

/* Squadre di vertice "ispirate" ai club reali ma con nomi alterati (no copyright) */
const TOP_TIER_CLUBS = {
  IT: ["Juventud Torino", "Milano Black Red", "Milano Black Blue", "Partenope FC", "Capitolina Giallorossa", "Aquila Laziale", "Fiorenza Viola", "Orobica FC", "Mole Granata", "Bologna Rossoblu"],
  ES: ["Real Madriz", "Ciudad Condal FC", "Atlético Capital", "Sevillana FC", "Turia Valencia", "Real Donosti", "Submarino Amarillo", "Athletic Vizcaya", "Betis Verdiblanco", "Celta Olívico"],
  FR: ["Paris Capitale FC", "Phocéen Olympique", "Lione Gerland", "Monaco Principato", "Lilla Dogues", "Nissa la Bella", "Rennes Rouge et Noir", "Artois Sang et Or", "Strasburgo Alsazia", "Nantes Canaris"],
  DE: ["Monaco Bavarese", "Borussia Vestfalia", "Lipsia Rossa", "Leverkusen Aspirina", "Union Berlino Est", "Francoforte Aquile", "Lupi di Wolfsburg", "Foresta Nera FC", "Stoccarda Cavallini", "Borussia Renania"],
  PT: ["Lisbona Aquilas", "Dragões do Douro", "Leões de Lisboa", "Arsenal do Minho", "Vitória Conquistadores", "Porto Salgado FC", "Algarve Sol FC", "Académica Coimbra Nova", "Sadina Setúbal", "Ria Aveiro FC"],
};

const CITY_POOLS = {
  IT: ["Bergamo", "Cremona", "Padova", "Modena", "Pisa", "Sassari", "Catania", "Salerno", "Pescara", "Bari", "Verona", "Brescia", "Ferrara", "Perugia", "Cosenza", "Lecce", "Foggia", "Taranto"],
  ES: ["Zaragoza", "Granada", "Vigo", "Cadice", "Gijón", "Oviedo", "Alicante", "Murcia", "Valladolid", "Almería", "Cordoba", "Huelva", "Burgos", "Albacete", "Leganés", "Mallorca"],
  FR: ["Brest", "Le Havre", "Reims", "Metz", "Toulouse", "Angers", "Caen", "Amiens", "Clermont", "Auxerre", "Sochaux", "Bastia", "Grenoble", "Dijon", "Niort", "Valenciennes"],
  DE: ["Hannover", "Nürnberg", "Bochum", "Kiel", "Karlsruhe", "Magdeburg", "Düsseldorf", "Rostock", "Bielefeld", "Regensburg", "Sandhausen", "Aue", "Ulm", "Ingolstadt", "Münster", "Cottbus"],
  PT: ["Faro", "Funchal", "Évora", "Viseu", "Leiria", "Covilhã", "Chaves", "Famalicão", "Felgueiras", "Tondela", "Penafiel", "Beja", "Portimão", "Marinha Grande", "Viana", "Estoril"],
};
const SUFFIXES = {
  IT: ["Calcio", "AC", "US", "Città di", "FC"],
  ES: ["CD", "Real", "Deportivo", "Club", "UD"],
  FR: ["FC", "AS", "Olympique", "Racing", "US"],
  DE: ["SV", "FC", "TSV", "VfL", "SC"],
  PT: ["SC", "GD", "Clube", "União", "CF"],
};
function generateTierNames(nationId, count) {
  const cities = shuffle(CITY_POOLS[nationId]).slice(0, count);
  const suffixes = SUFFIXES[nationId];
  return cities.map((city, i) => {
    const suf = suffixes[i % suffixes.length];
    return Math.random() < 0.5 ? `${suf} ${city}` : `${city} ${suf}`;
  });
}
function strengthForTier(tierIndex) {
  if (tierIndex === 0) return randInt(78, 95);
  if (tierIndex === 1) return randInt(55, 77);
  return randInt(34, 57);
}
/* Costruisce le 10 squadre del campionato attivo, club 0 = quello del giocatore */
function buildLeagueClubs(nationId, tierIndex, playerClubName, playerStrength) {
  const pool = tierIndex === 0 ? shuffle(TOP_TIER_CLUBS[nationId]) : generateTierNames(nationId, 12);
  const others = pool.filter((n) => n !== playerClubName).slice(0, 9);
  const names = [playerClubName, ...others];
  return names.map((name, i) => ({
    id: i, name,
    strength: i === 0 ? playerStrength : strengthForTier(tierIndex),
    played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0,
  }));
}

/* ---- Round robin (circle method), n pari ---- */
function generateFixtures(clubIds) {
  const n = clubIds.length;
  const rounds = [];
  const ids = [...clubIds];
  const fixed = ids[0];
  let rest = ids.slice(1);
  for (let r = 0; r < n - 1; r++) {
    const round = [];
    const left = [fixed, ...rest.slice(0, n / 2 - 1)];
    const right = rest.slice(n / 2 - 1).reverse();
    for (let i = 0; i < n / 2; i++) {
      round.push(r % 2 === 0 ? [left[i], right[i]] : [right[i], left[i]]);
    }
    rounds.push(round);
    rest = [rest[rest.length - 1], ...rest.slice(0, rest.length - 1)];
  }
  const secondLeg = rounds.map((round) => round.map(([h, a]) => [a, h]));
  const allRounds = [...rounds, ...secondLeg];
  const fixtures = [];
  allRounds.forEach((round, idx) => {
    round.forEach(([home, away]) => {
      fixtures.push({ matchday: idx + 1, home, away, played: false, scoreHome: null, scoreAway: null });
    });
  });
  return fixtures;
}

/* ============================== MERCATO ============================== */
function genStartOffers(nationId) {
  const names = generateTierNames(nationId, 3);
  return names.map((name) => {
    const strength = strengthForTier(2);
    return { name, strength, salary: Math.round(strength * 6) };
  });
}

function genMidSeasonOffers(clubs, currentClubId) {
  const candidates = clubs.filter((c) => c.id !== currentClubId);
  const picks = shuffle(candidates).slice(0, randInt(1, 3));
  return picks.map((c) => ({
    kind: "mid", clubId: c.id, clubName: c.name, strength: c.strength,
    salary: Math.round(c.strength * 8), tierLabel: null, nationName: null, moveType: "Mercato di riparazione",
  }));
}

function genEndSeasonOffers(nationId, tierIndex, avgRating, currentClubName, currentStrength) {
  const offers = [];

  // Stessa categoria, club rivale
  const sameTierNames = (tierIndex === 0 ? TOP_TIER_CLUBS[nationId] : generateTierNames(nationId, 6)).filter((n) => n !== currentClubName);
  offers.push({
    kind: "end", nationId, tierIndex,
    clubName: sameTierNames[randInt(0, sameTierNames.length - 1)],
    strength: clamp(currentStrength + randInt(-5, 8), 25, 96),
    moveType: "Stessa categoria",
  });

  // Promozione di categoria
  if (avgRating >= 6.8 && tierIndex > 0) {
    const upTier = tierIndex - 1;
    const upNames = upTier === 0 ? TOP_TIER_CLUBS[nationId] : generateTierNames(nationId, 6);
    offers.push({
      kind: "end", nationId, tierIndex: upTier,
      clubName: upNames[randInt(0, upNames.length - 1)],
      strength: strengthForTier(upTier),
      moveType: "Promozione di categoria",
    });
  }

  // Trasferimento all'estero
  if (avgRating >= 7.3) {
    const foreign = shuffle(NATIONS.filter((n) => n.id !== nationId))[0];
    const foreignTier = tierIndex > 0 && avgRating >= 8.0 ? tierIndex - 1 : tierIndex;
    const foreignNames = foreignTier === 0 ? TOP_TIER_CLUBS[foreign.id] : generateTierNames(foreign.id, 6);
    offers.push({
      kind: "end", nationId: foreign.id, tierIndex: foreignTier,
      clubName: foreignNames[randInt(0, foreignNames.length - 1)],
      strength: strengthForTier(foreignTier),
      moveType: "Trasferimento estero",
    });
  }

  return offers.map((o) => ({
    ...o,
    tierLabelText: tierLabel(o.nationId, o.tierIndex),
    nationName: nationById(o.nationId).name,
    nationFlag: nationById(o.nationId).flag,
    salary: Math.round(o.strength * 8.5),
  }));
}

/* ============================== MATCH SIMULATION ============================== */
function simulateClubMatch(home, away) {
  const expHome = clamp((home.strength / away.strength) * 1.35, 0.3, 3.5);
  const expAway = clamp((away.strength / home.strength) * 1.1, 0.2, 3.0);
  return [poissonRandom(expHome), poissonRandom(expAway)];
}

function simulatePlayerMatch(player, club, opponent, isHome) {
  const overall = computeOverall(player.position, player.attributes);
  const formBonus = player.form.length
    ? (player.form.reduce((a, b) => a + b, 0) / player.form.length - 6.5) * 0.5
    : 0;
  const moraleMod = (player.morale - 70) / 100;

  const effStrength = club.strength + overall * 0.15 + moraleMod * 3;
  const oppStrength = opponent.strength;

  const expFor = clamp(((isHome ? effStrength * 1.32 : effStrength * 1.05) / oppStrength), 0.3, 3.4);
  const expAgainst = clamp(((isHome ? oppStrength * 1.05 : oppStrength * 1.32) / effStrength), 0.2, 3.0);

  const teamGoals = poissonRandom(expFor);
  const concededGoals = poissonRandom(expAgainst);

  let goals = 0, assists = 0, cleanSheet = concededGoals === 0;

  if (player.position === "Attaccante") {
    const involvement = clamp(0.55 + (overall - 50) / 150, 0.2, 0.85);
    for (let g = 0; g < teamGoals; g++) {
      if (Math.random() < involvement * 0.55) goals++;
      else if (Math.random() < involvement * 0.4) assists++;
    }
  } else if (player.position === "Centrocampista") {
    const involvement = clamp(0.35 + (overall - 50) / 180, 0.12, 0.6);
    for (let g = 0; g < teamGoals; g++) {
      if (Math.random() < involvement * 0.3) goals++;
      else if (Math.random() < involvement * 0.5) assists++;
    }
  } else if (player.position === "Difensore") {
    const involvement = clamp(0.12 + (overall - 50) / 250, 0.03, 0.25);
    for (let g = 0; g < teamGoals; g++) {
      if (Math.random() < involvement * 0.2) goals++;
      else if (Math.random() < involvement * 0.3) assists++;
    }
  }

  const card = Math.random();
  const yellow = card > 0.85 && card <= 0.96;
  const red = card > 0.985;

  let rating = 6.0 + goals * 0.85 + assists * 0.5 + formBonus;
  if (player.position === "Portiere" || player.position === "Difensore") {
    rating += cleanSheet ? 0.8 : -concededGoals * 0.25;
  }
  rating += teamGoals > concededGoals ? 0.3 : teamGoals < concededGoals ? -0.3 : 0;
  rating += (Math.random() - 0.5) * 0.6;
  if (red) rating -= 1.2;
  rating = clamp(rating, 4.2, 9.8);

  return { teamGoals, concededGoals, goals, assists, cleanSheet, yellow, red, rating: Math.round(rating * 10) / 10 };
}

/* ============================== CAREER STATE ============================== */
function newCareerState(form) {
  const tierIndex = 2; // si parte sempre dall'ultima categoria
  const clubs = buildLeagueClubs(form.nationId, tierIndex, form.startClub.name, form.startClub.strength);
  const playerObj = {
    name: form.name,
    nationality: form.nationality,
    position: form.position,
    foot: form.foot,
    age: 17,
    squadNumber: randInt(2, 33),
    appearance: form.appearance,
    level: 1,
    xp: 0,
    skillPoints: 0,
    attributes: form.attributes,
    nationId: form.nationId,
    tierIndex,
    clubId: 0,
    contractYears: 2,
    salary: Math.round(form.startClub.strength * 6),
    morale: 75,
    form: [],
    stats: { apps: 0, goals: 0, assists: 0, cleanSheets: 0, yellow: 0, red: 0, avgRating: 0, ratings: [] },
    seasonHistory: [],
  };
  return {
    player: playerObj,
    season: 1,
    matchday: 0,
    clubs,
    fixtures: generateFixtures(clubs.map((c) => c.id)),
    transferOffers: null,
    transferWindowKind: null,
    midWindowUsed: false,
    log: [`Sei stato tesserato dal ${form.startClub.name} in ${tierLabel(form.nationId, tierIndex)}. Inizia la tua scalata!`],
    seasonOver: false,
  };
}

/* ============================== STORAGE ============================== */
function saveCareer(state) {
  try {
    localStorage.setItem("percorso_career", JSON.stringify(state));
  } catch (e) {
    console.error("Errore salvataggio", e);
  }
}
function loadCareer() {
  try {
    const raw = localStorage.getItem("percorso_career");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}
function clearCareer() {
  try {
    localStorage.removeItem("percorso_career");
  } catch (e) {}
}

/* ============================== AVATAR ============================== */
function Avatar({ appearance, size = 64 }) {
  const { skinTone, hairStyle, hairColor, gender } = appearance || {};
  const skin = skinTone || SKIN_TONES[1];
  const hColor = hairColor || HAIR_COLORS[0];
  const style = hairStyle || "Corti";
  const jawNarrow = gender === "Femmina";

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x="42" y="68" width="16" height="18" fill={skin} />
      <ellipse cx="50" cy="50" rx={jawNarrow ? 26 : 29} ry="30" fill={skin} />
      <ellipse cx="22" cy="52" rx="4" ry="6" fill={skin} />
      <ellipse cx="78" cy="52" rx="4" ry="6" fill={skin} />
      <circle cx="40" cy="48" r="2.6" fill="#26201A" />
      <circle cx="60" cy="48" r="2.6" fill="#26201A" />
      <path d="M 40 65 Q 50 70 60 65" stroke="#8A4B3B" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {style !== "Rasati" && (
        <path d="M 21 42 Q 22 14 50 14 Q 78 14 79 42 Q 70 30 50 30 Q 30 30 21 42 Z" fill={hColor} />
      )}
      {style === "Mossi" && (
        <>
          <path d="M 20 40 Q 14 58 20 70 Q 24 56 26 44 Z" fill={hColor} />
          <path d="M 80 40 Q 86 58 80 70 Q 76 56 74 44 Z" fill={hColor} />
        </>
      )}
      {style === "Ricci" && (
        <>
          <circle cx="26" cy="22" r="7" fill={hColor} />
          <circle cx="38" cy="14" r="8" fill={hColor} />
          <circle cx="50" cy="11" r="8" fill={hColor} />
          <circle cx="62" cy="14" r="8" fill={hColor} />
          <circle cx="74" cy="22" r="7" fill={hColor} />
        </>
      )}
      {style === "Lunghi" && (
        <>
          <path d="M 19 38 Q 12 70 18 92 L 28 92 Q 24 64 26 40 Z" fill={hColor} />
          <path d="M 81 38 Q 88 70 82 92 L 72 92 Q 76 64 74 40 Z" fill={hColor} />
        </>
      )}
      {style === "Rasati" && <ellipse cx="50" cy="36" rx="27" ry="14" fill={hColor} opacity="0.18" />}
    </svg>
  );
}

/* ============================== UI PRIMITIVES ============================== */
function Pill({ children, color = C.surfaceAlt, textColor = C.text }) {
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-medium tracking-wide" style={{ background: color, color: textColor, fontFamily: FONT_BODY }}>
      {children}
    </span>
  );
}
function StatBar({ label, value, max = 99 }) {
  return (
    <div className="mb-2">
      <div className="flex justify-between mb-1">
        <span className="text-xs" style={{ color: C.textDim, fontFamily: FONT_BODY }}>{label}</span>
        <span className="text-xs font-semibold" style={{ color: C.goldSoft, fontFamily: FONT_MONO }}>{value}</span>
      </div>
      <div className="h-1.5 rounded-full w-full overflow-hidden" style={{ background: C.bgDeep }}>
        <div className="h-full rounded-full" style={{ width: `${(value / max) * 100}%`, background: `linear-gradient(90deg, ${C.turf}, ${C.goldSoft})` }} />
      </div>
    </div>
  );
}
function OverallBadge({ value, size = 56 }) {
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size, background: `radial-gradient(circle at 35% 30%, ${C.surfaceAlt}, ${C.bgDeep})`, border: `2px solid ${C.gold}` }}
    >
      <span style={{ fontFamily: FONT_DISPLAY, fontSize: size * 0.4, color: C.goldSoft, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

/* ============================== CREATION SCREEN ============================== */
function CreationScreen({ onCreate }) {
  const [name, setName] = useState("");
  const [nationality, setNationality] = useState("Italia");
  const [position, setPosition] = useState("Attaccante");
  const [foot, setFoot] = useState("Destro");
  const [gender, setGender] = useState("Maschio");
  const [skinTone, setSkinTone] = useState(SKIN_TONES[1]);
  const [hairStyle, setHairStyle] = useState("Corti");
  const [hairColor, setHairColor] = useState(HAIR_COLORS[0]);

  const [nationId, setNationId] = useState("IT");
  const [startOffers, setStartOffers] = useState(() => genStartOffers("IT"));
  const [startClubChoice, setStartClubChoice] = useState(0);

  useEffect(() => {
    setStartOffers(genStartOffers(nationId));
    setStartClubChoice(0);
  }, [nationId]);

  const attrsList = attrsForPosition(position);
  const BASE = 30;
  const TOTAL_POINTS = 10;
  const [attrs, setAttrs] = useState(() => {
    const o = {};
    attrsList.forEach((a) => (o[a.key] = BASE));
    return o;
  });
  useEffect(() => {
    const o = {};
    attrsForPosition(position).forEach((a) => (o[a.key] = BASE));
    setAttrs(o);
  }, [position]);

  const used = Object.keys(attrs).reduce((sum, k) => sum + Math.max(0, attrs[k] - BASE), 0);
  const remaining = TOTAL_POINTS - used;

  function adjust(key, delta) {
    setAttrs((prev) => {
      const cur = prev[key];
      if (delta > 0 && remaining <= 0) return prev;
      const next = clamp(cur + delta, BASE - 8, BASE + TOTAL_POINTS);
      return { ...prev, [key]: next };
    });
  }

  const overall = computeOverall(position, attrs);
  const canCreate = name.trim().length > 1;
  const tier2Label = tierLabel(nationId, 2);

  return (
    <div className="min-h-screen w-full pb-10" style={{ background: C.bg, fontFamily: FONT_BODY }}>
      <div className="px-5 pt-10 pb-6 text-center" style={{ borderBottom: `1px solid ${C.surfaceLine}` }}>
        <p className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: C.textFaint }}>Nuova carriera</p>
        <h1 style={{ fontFamily: FONT_DISPLAY, color: C.text, fontSize: 30, fontWeight: 600, letterSpacing: 0.5 }}>IL TUO PERCORSO</h1>
      </div>

      <div className="px-5 mt-6 space-y-6">
        {/* Avatar + aspetto */}
        <div className="rounded-xl p-4" style={{ background: C.surface, border: `1px solid ${C.surfaceLine}` }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="rounded-full flex-shrink-0 overflow-hidden" style={{ width: 76, height: 76, background: C.bgDeep, border: `2px solid ${C.gold}` }}>
              <Avatar appearance={{ skinTone, hairStyle, hairColor, gender }} size={76} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: C.text }}>Aspetto del personaggio</p>
              <p className="text-xs" style={{ color: C.textFaint }}>Personalizza prima di scendere in campo</p>
            </div>
          </div>

          <label className="text-xs uppercase tracking-wider" style={{ color: C.textDim }}>Genere</label>
          <div className="grid grid-cols-3 gap-2 mt-1.5 mb-4">
            {GENDERS.map((g) => (
              <button key={g} onClick={() => setGender(g)} className="py-2 rounded-lg text-xs font-medium"
                style={{ background: gender === g ? C.gold : C.bgDeep, color: gender === g ? C.bgDeep : C.textDim, border: `1px solid ${gender === g ? C.gold : C.surfaceLine}` }}>
                {g}
              </button>
            ))}
          </div>

          <label className="text-xs uppercase tracking-wider" style={{ color: C.textDim }}>Colore della pelle</label>
          <div className="flex gap-2 mt-1.5 mb-4">
            {SKIN_TONES.map((tone) => (
              <button key={tone} onClick={() => setSkinTone(tone)} className="rounded-full"
                style={{ width: 30, height: 30, background: tone, border: skinTone === tone ? `3px solid ${C.gold}` : `1px solid ${C.surfaceLine}` }} />
            ))}
          </div>

          <label className="text-xs uppercase tracking-wider" style={{ color: C.textDim }}>Capelli</label>
          <div className="grid grid-cols-3 gap-2 mt-1.5 mb-4">
            {HAIR_STYLES.map((h) => (
              <button key={h} onClick={() => setHairStyle(h)} className="py-2 rounded-lg text-xs font-medium"
                style={{ background: hairStyle === h ? C.surfaceAlt : C.bgDeep, color: hairStyle === h ? C.text : C.textDim, border: `1px solid ${hairStyle === h ? C.turf : C.surfaceLine}` }}>
                {h}
              </button>
            ))}
          </div>

          <label className="text-xs uppercase tracking-wider" style={{ color: C.textDim }}>Colore capelli</label>
          <div className="flex gap-2 mt-1.5">
            {HAIR_COLORS.map((c) => (
              <button key={c} onClick={() => setHairColor(c)} disabled={hairStyle === "Rasati"} className="rounded-full"
                style={{ width: 30, height: 30, background: c, border: hairColor === c ? `3px solid ${C.gold}` : `1px solid ${C.surfaceLine}`, opacity: hairStyle === "Rasati" ? 0.4 : 1 }} />
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider" style={{ color: C.textDim }}>Nome giocatore</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Es. Marco Bianchi"
            className="w-full mt-1.5 px-3 py-2.5 rounded-lg outline-none text-base"
            style={{ background: C.surface, color: C.text, border: `1px solid ${C.surfaceLine}` }} />
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider" style={{ color: C.textDim }}>Nazionalità</label>
          <input value={nationality} onChange={(e) => setNationality(e.target.value)}
            className="w-full mt-1.5 px-3 py-2.5 rounded-lg outline-none text-base"
            style={{ background: C.surface, color: C.text, border: `1px solid ${C.surfaceLine}` }} />
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider" style={{ color: C.textDim }}>Ruolo</label>
          <div className="grid grid-cols-2 gap-2 mt-1.5">
            {POSITIONS.map((p) => (
              <button key={p} onClick={() => setPosition(p)} className="py-2.5 rounded-lg text-sm font-medium"
                style={{ background: position === p ? C.gold : C.surface, color: position === p ? C.bgDeep : C.textDim, border: `1px solid ${position === p ? C.gold : C.surfaceLine}` }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider" style={{ color: C.textDim }}>Piede preferito</label>
          <div className="grid grid-cols-2 gap-2 mt-1.5">
            {["Destro", "Sinistro"].map((f) => (
              <button key={f} onClick={() => setFoot(f)} className="py-2.5 rounded-lg text-sm font-medium"
                style={{ background: foot === f ? C.surfaceAlt : C.surface, color: foot === f ? C.text : C.textDim, border: `1px solid ${foot === f ? C.turf : C.surfaceLine}` }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Nazione del campionato */}
        <div>
          <label className="text-xs uppercase tracking-wider flex items-center gap-1.5" style={{ color: C.textDim }}>
            <Globe2 size={13} /> Nazione del campionato
          </label>
          <div className="grid grid-cols-5 gap-2 mt-1.5">
            {NATIONS.map((n) => (
              <button key={n.id} onClick={() => setNationId(n.id)} className="py-2.5 rounded-lg flex flex-col items-center gap-0.5"
                style={{ background: nationId === n.id ? C.gold : C.surface, border: `1px solid ${nationId === n.id ? C.gold : C.surfaceLine}` }}>
                <span style={{ fontSize: 18 }}>{n.flag}</span>
                <span style={{ fontSize: 9, color: nationId === n.id ? C.bgDeep : C.textFaint, fontWeight: 600 }}>{n.id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Offerte di partenza */}
        <div>
          <label className="text-xs uppercase tracking-wider" style={{ color: C.textDim }}>
            Offerte da club di {tier2Label} ({nationById(nationId).name})
          </label>
          <div className="space-y-2 mt-1.5">
            {startOffers.map((o, i) => (
              <button key={i} onClick={() => setStartClubChoice(i)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg"
                style={{ background: startClubChoice === i ? C.surfaceAlt : C.surface, border: `1px solid ${startClubChoice === i ? C.turf : C.surfaceLine}` }}>
                <div className="text-left">
                  <p style={{ color: C.text, fontSize: 14 }}>{o.name}</p>
                  <p style={{ color: C.textFaint, fontSize: 11, fontFamily: FONT_MONO }}>Forza {o.strength} · €{o.salary}/sett.</p>
                </div>
                {startClubChoice === i && <Check size={16} color={C.turf} />}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl p-4" style={{ background: C.surface, border: `1px solid ${C.surfaceLine}` }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold" style={{ color: C.text }}>Attributi <span style={{ color: C.textFaint, fontWeight: 400 }}>(modalità difficile)</span></span>
            <div className="flex items-center gap-3">
              <span className="text-xs" style={{ color: C.textDim }}>
                Punti: <span style={{ color: remaining === 0 ? C.turf : C.goldSoft, fontFamily: FONT_MONO }}>{remaining}</span>
              </span>
              <OverallBadge value={overall} size={44} />
            </div>
          </div>
          {attrsList.map((a) => (
            <div key={a.key} className="flex items-center justify-between py-1.5">
              <span className="text-sm" style={{ color: C.textDim, width: 120 }}>{a.label}</span>
              <div className="flex items-center gap-3 flex-1 ml-2">
                <div className="h-1.5 rounded-full flex-1 overflow-hidden" style={{ background: C.bgDeep }}>
                  <div className="h-full rounded-full" style={{ width: `${(attrs[a.key] / 50) * 100}%`, background: C.gold }} />
                </div>
                <button onClick={() => adjust(a.key, -1)} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: C.bgDeep }}>
                  <Minus size={12} color={C.textDim} />
                </button>
                <span className="text-xs w-6 text-center" style={{ color: C.text, fontFamily: FONT_MONO }}>{attrs[a.key]}</span>
                <button onClick={() => adjust(a.key, 1)} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: C.bgDeep }}>
                  <Plus size={12} color={C.textDim} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          disabled={!canCreate}
          onClick={() =>
            onCreate({
              name, nationality, position, foot, attributes: attrs,
              appearance: { gender, skinTone, hairStyle, hairColor },
              nationId, startClub: startOffers[startClubChoice],
            })
          }
          className="w-full py-3.5 rounded-xl font-semibold text-base tracking-wide flex items-center justify-center gap-2"
          style={{ background: canCreate ? C.gold : C.surfaceLine, color: canCreate ? C.bgDeep : C.textFaint, fontFamily: FONT_DISPLAY, opacity: canCreate ? 1 : 0.6 }}
        >
          INIZIA LA CARRIERA <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

/* ============================== HOME / DASHBOARD ============================== */
function HomeScreen({ state, onPlayMatch, simulating, onAllocateSkill }) {
  const { player, clubs, fixtures, matchday, season, log } = state;
  const club = clubs.find((c) => c.id === player.clubId);
  const overall = computeOverall(player.position, player.attributes);
  const nextFixture = fixtures.find((f) => f.matchday === matchday + 1 && (f.home === player.clubId || f.away === player.clubId));
  const opponent = nextFixture ? clubs.find((c) => c.id === (nextFixture.home === player.clubId ? nextFixture.away : nextFixture.home)) : null;
  const isHome = nextFixture ? nextFixture.home === player.clubId : true;
  const totalMatchdays = (clubs.length - 1) * 2;
  const xpNeeded = xpForLevel(player.level);
  const nation = nationById(player.nationId);

  return (
    <div className="px-5 pt-6 pb-4 space-y-5">
      <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${C.surface}, ${C.surfaceAlt})`, border: `1px solid ${C.surfaceLine}` }}>
        <div className="absolute -right-4 -top-4 opacity-10" style={{ fontFamily: FONT_DISPLAY, fontSize: 110, color: C.gold }}>{player.squadNumber}</div>
        <div className="flex items-start justify-between relative">
          <div className="flex items-center gap-3">
            <div className="rounded-full overflow-hidden flex-shrink-0" style={{ width: 56, height: 56, background: C.bgDeep, border: `2px solid ${C.gold}` }}>
              <Avatar appearance={player.appearance} size={56} />
            </div>
            <div>
              <p className="text-xs tracking-[0.25em] uppercase" style={{ color: C.textFaint }}>{club?.name}</p>
              <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: C.text, fontWeight: 600, lineHeight: 1.1 }}>{player.name}</h2>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <Pill color={C.bgDeep} textColor={C.goldSoft}>{player.position}</Pill>
                <Pill color={C.bgDeep} textColor={C.textDim}>{player.age} anni</Pill>
                <Pill color={C.bgDeep} textColor={C.textDim}>{nation.flag} {tierLabel(player.nationId, player.tierIndex)}</Pill>
              </div>
            </div>
          </div>
          <OverallBadge value={overall} />
        </div>

        <div className="mt-4 relative">
          <div className="flex justify-between mb-1">
            <span className="text-xs font-semibold" style={{ color: C.goldSoft, fontFamily: FONT_DISPLAY, letterSpacing: 0.5 }}>LIVELLO {player.level}</span>
            <span className="text-xs" style={{ color: C.textFaint, fontFamily: FONT_MONO }}>{player.xp} / {xpNeeded} XP</span>
          </div>
          <div className="h-2 rounded-full w-full overflow-hidden" style={{ background: C.bgDeep }}>
            <div className="h-full rounded-full" style={{ width: `${clamp((player.xp / xpNeeded) * 100, 0, 100)}%`, background: `linear-gradient(90deg, ${C.gold}, ${C.goldSoft})` }} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 relative">
          <div>
            <p className="text-xs" style={{ color: C.textFaint }}>Morale</p>
            <p style={{ fontFamily: FONT_MONO, color: C.goldSoft, fontSize: 16 }}>{player.morale}/100</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: C.textFaint }}>Stagione</p>
            <p style={{ fontFamily: FONT_MONO, color: C.text, fontSize: 16 }}>{season}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: C.textFaint }}>Contratto</p>
            <p style={{ fontFamily: FONT_MONO, color: C.text, fontSize: 16 }}>{player.contractYears} anni</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-4" style={{ background: C.surface, border: `1px solid ${C.surfaceLine}` }}>
        <p className="text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: C.textDim }}>
          <Calendar size={13} /> Giornata {matchday + 1} di {totalMatchdays}
        </p>
        {opponent ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <span style={{ color: C.text, fontSize: 15 }}>{isHome ? club?.name : opponent.name}</span>
              <span style={{ color: C.textFaint, fontFamily: FONT_DISPLAY, fontSize: 13 }}>VS</span>
              <span style={{ color: C.text, fontSize: 15 }}>{isHome ? opponent.name : club?.name}</span>
            </div>
            <button onClick={onPlayMatch} disabled={simulating} className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
              style={{ background: C.gold, color: C.bgDeep, fontFamily: FONT_DISPLAY, letterSpacing: 0.5, opacity: simulating ? 0.6 : 1 }}>
              {simulating ? "SIMULAZIONE…" : "GIOCA LA PARTITA"}
            </button>
          </>
        ) : (
          <p style={{ color: C.textDim, fontSize: 14 }}>Fine stagione raggiunta.</p>
        )}
      </div>

      {player.skillPoints > 0 && (
        <div className="rounded-2xl p-4" style={{ background: C.surface, border: `1px solid ${C.gold}` }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-wider flex items-center gap-1.5" style={{ color: C.goldSoft }}>
              <TrendingUp size={13} /> Punti abilità da spendere
            </p>
            <span style={{ fontFamily: FONT_MONO, color: C.gold, fontWeight: 700 }}>{player.skillPoints}</span>
          </div>
          {attrsForPosition(player.position).map((a) => (
            <div key={a.key} className="flex items-center justify-between py-1.5">
              <span className="text-sm" style={{ color: C.textDim, width: 120 }}>{a.label}</span>
              <div className="flex items-center gap-3 flex-1 ml-2">
                <div className="h-1.5 rounded-full flex-1 overflow-hidden" style={{ background: C.bgDeep }}>
                  <div className="h-full rounded-full" style={{ width: `${(player.attributes[a.key] / 99) * 100}%`, background: C.turf }} />
                </div>
                <span className="text-xs w-6 text-center" style={{ color: C.text, fontFamily: FONT_MONO }}>{player.attributes[a.key]}</span>
                <button onClick={() => onAllocateSkill(a.key)} disabled={player.attributes[a.key] >= 99}
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: player.attributes[a.key] >= 99 ? C.bgDeep : C.gold, opacity: player.attributes[a.key] >= 99 ? 0.4 : 1 }}>
                  <Plus size={12} color={player.attributes[a.key] >= 99 ? C.textDim : C.bgDeep} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl p-4" style={{ background: C.surface, border: `1px solid ${C.surfaceLine}` }}>
        <p className="text-xs uppercase tracking-wider mb-3" style={{ color: C.textDim }}>Attributi</p>
        {attrsForPosition(player.position).map((a) => (
          <StatBar key={a.key} label={a.label} value={player.attributes[a.key]} max={99} />
        ))}
      </div>

      <div className="rounded-2xl p-4" style={{ background: C.surface, border: `1px solid ${C.surfaceLine}` }}>
        <p className="text-xs uppercase tracking-wider mb-2" style={{ color: C.textDim }}>Ultime notizie</p>
        <div className="space-y-1.5">
          {log.slice(-4).reverse().map((l, i) => (
            <p key={i} style={{ color: C.textDim, fontSize: 13, lineHeight: 1.5 }}>• {l}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================== MATCH RESULT MODAL ============================== */
function MatchResultModal({ result, onClose }) {
  if (!result) return null;
  const { clubName, oppName, isHome, scoreHome, scoreAway, perf } = result;
  const won = (isHome && scoreHome > scoreAway) || (!isHome && scoreAway > scoreHome);
  const draw = scoreHome === scoreAway;
  const resColor = won ? C.win : draw ? C.draw : C.loss;
  const resLabel = won ? "VITTORIA" : draw ? "PAREGGIO" : "SCONFITTA";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-6" style={{ background: C.surface, border: `1px solid ${C.surfaceLine}` }}>
        <div className="text-center mb-4">
          <p className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: resColor }}>{resLabel}</p>
          <div className="flex items-center justify-center gap-4">
            <span style={{ color: C.text, fontSize: 15, width: 90, textAlign: "right" }}>{isHome ? clubName : oppName}</span>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 34, color: C.goldSoft }}>{scoreHome} - {scoreAway}</span>
            <span style={{ color: C.text, fontSize: 15, width: 90, textAlign: "left" }}>{isHome ? oppName : clubName}</span>
          </div>
        </div>

        <div className="rounded-xl p-3 space-y-2" style={{ background: C.bgDeep }}>
          <div className="flex justify-between">
            <span style={{ color: C.textDim, fontSize: 13 }}>Voto in pagella</span>
            <span style={{ color: C.goldSoft, fontFamily: FONT_MONO, fontWeight: 700 }}>{perf.rating.toFixed(1)}</span>
          </div>
          {perf.goals > 0 && (
            <div className="flex justify-between">
              <span style={{ color: C.textDim, fontSize: 13 }}>Gol segnati</span>
              <span style={{ color: C.text, fontFamily: FONT_MONO }}>{perf.goals}</span>
            </div>
          )}
          {perf.assists > 0 && (
            <div className="flex justify-between">
              <span style={{ color: C.textDim, fontSize: 13 }}>Assist</span>
              <span style={{ color: C.text, fontFamily: FONT_MONO }}>{perf.assists}</span>
            </div>
          )}
          {perf.cleanSheet && (
            <div className="flex justify-between">
              <span style={{ color: C.textDim, fontSize: 13 }}>Porta inviolata</span>
              <ShieldCheck size={16} color={C.turf} />
            </div>
          )}
          {perf.yellow && (
            <div className="flex justify-between">
              <span style={{ color: C.textDim, fontSize: 13 }}>Cartellino</span>
              <span style={{ color: "#E0B400" }}>Giallo</span>
            </div>
          )}
          {perf.red && (
            <div className="flex justify-between">
              <span style={{ color: C.textDim, fontSize: 13 }}>Cartellino</span>
              <span style={{ color: C.danger }}>Rosso</span>
            </div>
          )}
        </div>

        {result.xpGain != null && (
          <div className="rounded-xl p-3 mt-3" style={{ background: C.bgDeep, border: `1px solid ${C.gold}` }}>
            <div className="flex justify-between items-center">
              <span style={{ color: C.goldSoft, fontSize: 13, fontWeight: 600 }}>Esperienza guadagnata</span>
              <span style={{ color: C.gold, fontFamily: FONT_MONO, fontWeight: 700 }}>+{result.xpGain} XP</span>
            </div>
            {result.leveledUp && (
              <p className="mt-2 text-sm font-semibold" style={{ color: C.goldSoft, fontFamily: FONT_DISPLAY, letterSpacing: 0.3 }}>
                ⭐ LIVELLO {result.newLevel} RAGGIUNTO! +{result.pointsGained} punti abilità
              </p>
            )}
          </div>
        )}

        <button onClick={onClose} className="w-full mt-4 py-3 rounded-xl font-semibold" style={{ background: C.gold, color: C.bgDeep, fontFamily: FONT_DISPLAY }}>
          CONTINUA
        </button>
      </div>
    </div>
  );
}

/* ============================== TRANSFER MODAL ============================== */
function TransferModal({ offers, windowKind, currentClubName, onChoose }) {
  if (!offers) return null;
  const title = windowKind === "mid" ? "MERCATO DI RIPARAZIONE" : "MERCATO ESTIVO";
  const subtitle = windowKind === "mid" ? "Offerte a metà stagione" : "Offerte di fine stagione";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.65)" }}>
      <div className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-6 max-h-[85vh] overflow-y-auto" style={{ background: C.surface, border: `1px solid ${C.surfaceLine}` }}>
        <p className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: C.gold }}>{subtitle}</p>
        <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, color: C.text, marginBottom: 16 }}>{title}</h3>
        <div className="space-y-3">
          {offers.map((o, i) => (
            <button key={i} onClick={() => onChoose(o)} className="w-full text-left rounded-xl p-3.5" style={{ background: C.bgDeep, border: `1px solid ${C.surfaceLine}` }}>
              <div className="flex justify-between items-center mb-1">
                <span style={{ color: C.text, fontWeight: 600 }}>{o.clubName}</span>
                <span style={{ color: C.goldSoft, fontFamily: FONT_MONO, fontSize: 13 }}>Forza {o.strength}</span>
              </div>
              {o.tierLabelText && (
                <div className="flex items-center gap-1.5 mb-1">
                  <Pill color={C.surfaceAlt} textColor={C.goldSoft}>{o.nationFlag} {o.tierLabelText}</Pill>
                  <Pill color={C.surfaceAlt} textColor={o.moveType === "Promozione di categoria" ? C.turf : C.textDim}>{o.moveType}</Pill>
                </div>
              )}
              <div className="flex justify-between">
                <span style={{ color: C.textDim, fontSize: 12 }}>Stipendio offerto</span>
                <span style={{ color: C.turf, fontFamily: FONT_MONO, fontSize: 12 }}>€{o.salary}/sett.</span>
              </div>
            </button>
          ))}
          <button onClick={() => onChoose(null)} className="w-full text-left rounded-xl p-3.5" style={{ background: "transparent", border: `1px dashed ${C.surfaceLine}` }}>
            <span style={{ color: C.textDim }}>Resta al {currentClubName}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================== MATCHES SCREEN ============================== */
function MatchesScreen({ state }) {
  const { clubs, fixtures, matchday, player } = state;
  const sorted = [...clubs].sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga));
  const upcoming = fixtures.filter((f) => f.matchday > matchday && f.matchday <= matchday + 4);
  const nation = nationById(player.nationId);

  return (
    <div className="px-5 pt-6 pb-4 space-y-5">
      <div className="flex items-center gap-2">
        <span style={{ fontSize: 20 }}>{nation.flag}</span>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: C.text }}>{tierLabel(player.nationId, player.tierIndex)}</h2>
        <span style={{ color: C.textFaint, fontSize: 13 }}>· {nation.name}</span>
      </div>

      <div className="rounded-2xl p-4" style={{ background: C.surface, border: `1px solid ${C.surfaceLine}` }}>
        <p className="text-xs uppercase tracking-wider mb-3" style={{ color: C.textDim }}>Classifica</p>
        <div className="space-y-1">
          {sorted.map((c, i) => (
            <div key={c.id} className="flex items-center justify-between py-1.5" style={{ borderBottom: i < sorted.length - 1 ? `1px solid ${C.bgDeep}` : "none" }}>
              <div className="flex items-center gap-2 flex-1">
                <span style={{ color: C.textFaint, fontFamily: FONT_MONO, fontSize: 12, width: 16 }}>{i + 1}</span>
                <span style={{ color: c.id === player.clubId ? C.goldSoft : C.text, fontSize: 13, fontWeight: c.id === player.clubId ? 600 : 400 }}>{c.name}</span>
              </div>
              <span style={{ color: C.textDim, fontFamily: FONT_MONO, fontSize: 12, width: 30, textAlign: "right" }}>{c.played}</span>
              <span style={{ color: C.goldSoft, fontFamily: FONT_MONO, fontSize: 13, width: 34, textAlign: "right" }}>{c.pts} pt</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl p-4" style={{ background: C.surface, border: `1px solid ${C.surfaceLine}` }}>
        <p className="text-xs uppercase tracking-wider mb-3" style={{ color: C.textDim }}>Prossime giornate</p>
        <div className="space-y-2">
          {upcoming.map((f, i) => {
            const home = clubs.find((c) => c.id === f.home);
            const away = clubs.find((c) => c.id === f.away);
            const involved = f.home === player.clubId || f.away === player.clubId;
            return (
              <div key={i} className="flex items-center justify-between py-1">
                <span style={{ color: C.textFaint, fontFamily: FONT_MONO, fontSize: 11, width: 18 }}>G{f.matchday}</span>
                <span style={{ color: involved ? C.goldSoft : C.textDim, fontSize: 12.5, flex: 1, textAlign: "right" }}>{home?.name}</span>
                <span style={{ color: C.textFaint, fontSize: 11, margin: "0 6px" }}>vs</span>
                <span style={{ color: involved ? C.goldSoft : C.textDim, fontSize: 12.5, flex: 1 }}>{away?.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================== STATS SCREEN ============================== */
function StatsScreen({ state }) {
  const { player } = state;
  const { stats, seasonHistory } = player;
  const avgRating = stats.ratings.length ? (stats.ratings.reduce((a, b) => a + b, 0) / stats.ratings.length).toFixed(2) : "-";

  return (
    <div className="px-5 pt-6 pb-4 space-y-5">
      <div className="rounded-2xl p-4" style={{ background: C.surface, border: `1px solid ${C.surfaceLine}` }}>
        <p className="text-xs uppercase tracking-wider mb-3" style={{ color: C.textDim }}>Carriera — totali</p>
        <div className="grid grid-cols-2 gap-3">
          {[["Presenze", stats.apps], ["Gol", stats.goals], ["Assist", stats.assists], ["Clean sheet", stats.cleanSheets], ["Gialli", stats.yellow], ["Rossi", stats.red]].map(([label, val]) => (
            <div key={label} className="rounded-xl p-3" style={{ background: C.bgDeep }}>
              <p style={{ color: C.textFaint, fontSize: 11, textTransform: "uppercase" }}>{label}</p>
              <p style={{ color: C.goldSoft, fontFamily: FONT_DISPLAY, fontSize: 22 }}>{val}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between items-center rounded-xl p-3" style={{ background: C.bgDeep }}>
          <span style={{ color: C.textDim, fontSize: 13 }}>Media voto carriera</span>
          <span style={{ color: C.turf, fontFamily: FONT_MONO, fontSize: 16, fontWeight: 700 }}>{avgRating}</span>
        </div>
      </div>

      <div className="rounded-2xl p-4" style={{ background: C.surface, border: `1px solid ${C.surfaceLine}` }}>
        <p className="text-xs uppercase tracking-wider mb-3" style={{ color: C.textDim }}>Storico stagioni</p>
        {seasonHistory.length === 0 ? (
          <p style={{ color: C.textFaint, fontSize: 13 }}>Nessuna stagione completata ancora.</p>
        ) : (
          <div className="space-y-2">
            {[...seasonHistory].reverse().map((s, i) => (
              <div key={i} className="rounded-xl p-3" style={{ background: C.bgDeep, border: `1px solid ${C.surfaceLine}` }}>
                <div className="flex justify-between mb-1">
                  <span style={{ color: C.goldSoft, fontWeight: 600, fontSize: 13 }}>Stagione {s.season} — {s.club}</span>
                  <span style={{ color: C.textDim, fontFamily: FONT_MONO, fontSize: 12 }}>OVR {s.overall}</span>
                </div>
                <p style={{ color: C.textFaint, fontSize: 11, marginBottom: 4 }}>{s.nationFlag} {s.tierLabelText} · {s.nationName}</p>
                <div className="flex gap-3 text-xs" style={{ color: C.textDim }}>
                  <span>{s.apps} pres.</span>
                  <span>{s.goals} gol</span>
                  <span>{s.assists} assist</span>
                  <span>{s.avgRating} media</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================== BOTTOM NAV ============================== */
function BottomNav({ tab, setTab }) {
  const items = [
    { id: "home", label: "Carriera", icon: User },
    { id: "matches", label: "Partite", icon: Trophy },
    { id: "stats", label: "Statistiche", icon: BarChart3 },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-around py-2.5" style={{ background: C.surface, borderTop: `1px solid ${C.surfaceLine}` }}>
      {items.map(({ id, label, icon: Icon }) => (
        <button key={id} onClick={() => setTab(id)} className="flex flex-col items-center gap-1 px-4">
          <Icon size={20} color={tab === id ? C.goldSoft : C.textFaint} />
          <span style={{ fontSize: 10, color: tab === id ? C.goldSoft : C.textFaint, fontFamily: FONT_BODY }}>{label}</span>
        </button>
      ))}
    </div>
  );
}

/* ============================== MAIN APP ============================== */
export default function App() {
  useGoogleFonts();
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("home");
  const [simulating, setSimulating] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  useEffect(() => {
    const saved = loadCareer();
    if (saved) setState(saved);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (state) saveCareer(state);
  }, [state]);

  function handleCreate(form) {
    setState(newCareerState(form));
  }

  function handleResetCareer() {
    clearCareer();
    setState(null);
    setTab("home");
  }

  const handlePlayMatch = useCallback(() => {
    if (!state || simulating) return;
    setSimulating(true);
    setTimeout(() => {
      setState((prev) => {
        const next = JSON.parse(JSON.stringify(prev));
        const nextMatchday = next.matchday + 1;
        const dayFixtures = next.fixtures.filter((f) => f.matchday === nextMatchday);
        let playerPerf = null;
        let playerFixtureInfo = null;

        dayFixtures.forEach((f) => {
          const home = next.clubs.find((c) => c.id === f.home);
          const away = next.clubs.find((c) => c.id === f.away);
          const playerInvolved = f.home === next.player.clubId || f.away === next.player.clubId;

          if (playerInvolved) {
            const isHome = f.home === next.player.clubId;
            const opponent = isHome ? away : home;
            const myClub = isHome ? home : away;
            const perf = simulatePlayerMatch(next.player, myClub, opponent, isHome);
            const scoreHome = isHome ? perf.teamGoals : perf.concededGoals;
            const scoreAway = isHome ? perf.concededGoals : perf.teamGoals;
            f.scoreHome = scoreHome;
            f.scoreAway = scoreAway;

            next.player.stats.apps += 1;
            next.player.stats.goals += perf.goals;
            next.player.stats.assists += perf.assists;
            if (perf.cleanSheet && (next.player.position === "Portiere" || next.player.position === "Difensore")) {
              next.player.stats.cleanSheets += 1;
            }
            if (perf.yellow) next.player.stats.yellow += 1;
            if (perf.red) next.player.stats.red += 1;
            next.player.stats.ratings.push(perf.rating);
            next.player.form.push(perf.rating);
            if (next.player.form.length > 5) next.player.form.shift();
            next.player.morale = clamp(next.player.morale + (perf.rating >= 7 ? 4 : perf.rating < 6 ? -4 : 0), 30, 100);

            const result = scoreHome === scoreAway ? "draw" : (isHome ? scoreHome > scoreAway : scoreAway > scoreHome) ? "win" : "loss";
            const xpGain = computeMatchXp(perf, result);
            next.player.xp += xpGain;
            let leveledUp = false, pointsGained = 0;
            while (next.player.xp >= xpForLevel(next.player.level)) {
              next.player.xp -= xpForLevel(next.player.level);
              next.player.level += 1;
              next.player.skillPoints += 2;
              pointsGained += 2;
              leveledUp = true;
            }

            playerPerf = perf;
            playerFixtureInfo = {
              clubName: myClub.name, oppName: opponent.name, isHome, scoreHome, scoreAway,
              xpGain, leveledUp, newLevel: next.player.level, pointsGained,
            };
          } else {
            const [sh, sa] = simulateClubMatch(home, away);
            f.scoreHome = sh;
            f.scoreAway = sa;
          }
          f.played = true;

          home.played += 1; away.played += 1;
          home.gf += f.scoreHome; home.ga += f.scoreAway;
          away.gf += f.scoreAway; away.ga += f.scoreHome;
          if (f.scoreHome > f.scoreAway) { home.won++; home.pts += 3; away.lost++; }
          else if (f.scoreHome < f.scoreAway) { away.won++; away.pts += 3; home.lost++; }
          else { home.drawn++; away.drawn++; home.pts += 1; away.pts += 1; }
        });

        next.matchday = nextMatchday;
        const totalMatchdays = (next.clubs.length - 1) * 2;

        if (playerPerf) {
          setMatchResult({ ...playerFixtureInfo, perf: playerPerf });
        }

        if (nextMatchday >= totalMatchdays) {
          /* ===== FINE STAGIONE ===== */
          const overall = computeOverall(next.player.position, next.player.attributes);
          const club = next.clubs.find((c) => c.id === next.player.clubId);
          const avgRating = next.player.stats.ratings.length
            ? Math.round((next.player.stats.ratings.reduce((a, b) => a + b, 0) / next.player.stats.ratings.length) * 100) / 100
            : 6.0;

          next.player.seasonHistory.push({
            season: next.season, club: club.name, overall,
            apps: next.player.stats.apps, goals: next.player.stats.goals, assists: next.player.stats.assists, avgRating,
            tierLabelText: tierLabel(next.player.nationId, next.player.tierIndex),
            nationName: nationById(next.player.nationId).name,
            nationFlag: nationById(next.player.nationId).flag,
          });

          if (next.player.age >= 31) {
            const declinePool = randInt(2, 5);
            const attrKeys = Object.keys(next.player.attributes);
            for (let i = 0; i < declinePool; i++) {
              const k = attrKeys[randInt(0, attrKeys.length - 1)];
              next.player.attributes[k] = clamp(next.player.attributes[k] - 1, 25, 99);
            }
            next.log.push(`L'età inizia a farsi sentire: qualche attributo è leggermente calato.`);
          }

          next.player.age += 1;
          next.player.contractYears = Math.max(0, next.player.contractYears - 1);

          next.transferOffers = genEndSeasonOffers(next.player.nationId, next.player.tierIndex, avgRating, club.name, club.strength);
          next.transferWindowKind = "end";

          next.log.push(`Stagione ${next.season} conclusa: ${next.player.stats.apps} presenze, ${next.player.stats.goals} gol, media voto ${avgRating}.`);

          next.player.stats = { apps: 0, goals: 0, assists: 0, cleanSheets: 0, yellow: 0, red: 0, avgRating: 0, ratings: [] };
          next.season += 1;
          next.matchday = 0;
          next.midWindowUsed = false;
          next.seasonOver = true;
          /* clubs/fixtures vengono ricostruiti quando il giocatore sceglie l'offerta */
        } else {
          /* ===== Possibile mercato di riparazione a metà stagione ===== */
          const halfPoint = Math.ceil(totalMatchdays / 2);
          if (!next.midWindowUsed && nextMatchday === halfPoint) {
            const offers = genMidSeasonOffers(next.clubs, next.player.clubId);
            if (offers.length) {
              next.transferOffers = offers;
              next.transferWindowKind = "mid";
            }
            next.midWindowUsed = true;
          }

          next.log.push(
            playerFixtureInfo
              ? `G${nextMatchday}: ${playerFixtureInfo.isHome ? playerFixtureInfo.clubName : playerFixtureInfo.oppName} ${playerFixtureInfo.scoreHome}-${playerFixtureInfo.scoreAway} ${playerFixtureInfo.isHome ? playerFixtureInfo.oppName : playerFixtureInfo.clubName} — voto ${playerPerf.rating.toFixed(1)}`
              : `Giornata ${nextMatchday} disputata.`
          );
        }

        return next;
      });
      setSimulating(false);
    }, 600);
  }, [state, simulating]);

  function handleAllocateSkill(attrKey) {
    setState((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      if (next.player.skillPoints > 0 && next.player.attributes[attrKey] < 99) {
        next.player.attributes[attrKey] += 1;
        next.player.skillPoints -= 1;
      }
      return next;
    });
  }

  function handleChooseOffer(offer) {
    setState((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const kind = next.transferWindowKind;

      if (!offer) {
        if (kind === "end") {
          const club = next.clubs.find((c) => c.id === next.player.clubId);
          const newClubs = buildLeagueClubs(next.player.nationId, next.player.tierIndex, club.name, clamp(club.strength + randInt(-3, 3), 25, 96));
          next.clubs = newClubs;
          next.fixtures = generateFixtures(newClubs.map((c) => c.id));
          next.player.clubId = 0;
          next.player.contractYears = Math.max(next.player.contractYears, 2);
          next.log.push(`Rinnovo confermato. Resti al ${club.name}.`);
        } else {
          next.log.push(`Hai rifiutato le offerte di mercato. Resti dove sei.`);
        }
      } else if (offer.kind === "mid") {
        const newClub = next.clubs.find((c) => c.id === offer.clubId);
        next.player.clubId = offer.clubId;
        next.player.salary = offer.salary;
        next.log.push(`Trasferimento di riparazione: vesti la maglia del ${newClub.name}.`);
      } else if (offer.kind === "end") {
        next.player.nationId = offer.nationId;
        next.player.tierIndex = offer.tierIndex;
        next.player.salary = offer.salary;
        next.player.contractYears = 3;
        const newClubs = buildLeagueClubs(offer.nationId, offer.tierIndex, offer.clubName, offer.strength);
        next.clubs = newClubs;
        next.fixtures = generateFixtures(newClubs.map((c) => c.id));
        next.player.clubId = 0;
        next.log.push(`Trasferimento concluso: ${offer.clubName} (${tierLabel(offer.nationId, offer.tierIndex)}, ${nationById(offer.nationId).name}).`);
      }

      next.transferOffers = null;
      next.transferWindowKind = null;
      return next;
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <p style={{ color: C.textDim, fontFamily: FONT_BODY }}>Caricamento…</p>
      </div>
    );
  }

  if (!state) {
    return <CreationScreen onCreate={handleCreate} />;
  }

  const club = state.clubs.find((c) => c.id === state.player.clubId);
  const nation = nationById(state.player.nationId);

  return (
    <div className="min-h-screen w-full" style={{ background: C.bg, fontFamily: FONT_BODY }}>
      <div className="px-5 pt-5 pb-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.surfaceLine}` }}>
        <div>
          <p className="text-xs tracking-[0.3em] uppercase" style={{ color: C.textFaint }}>{nation.flag} {tierLabel(state.player.nationId, state.player.tierIndex)}</p>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 20, color: C.text, fontWeight: 600 }}>{club?.name}</h1>
        </div>
        <button onClick={handleResetCareer} className="p-2 rounded-lg" style={{ background: C.surface }}>
          <RotateCcw size={16} color={C.textFaint} />
        </button>
      </div>

      <div className="pb-20">
        {tab === "home" && <HomeScreen state={state} onPlayMatch={handlePlayMatch} simulating={simulating} onAllocateSkill={handleAllocateSkill} />}
        {tab === "matches" && <MatchesScreen state={state} />}
        {tab === "stats" && <StatsScreen state={state} />}
      </div>

      <BottomNav tab={tab} setTab={setTab} />

      <MatchResultModal result={matchResult} onClose={() => setMatchResult(null)} />
      <TransferModal offers={state.transferOffers} windowKind={state.transferWindowKind} currentClubName={club?.name} onChoose={handleChooseOffer} />
    </div>
  );
}
