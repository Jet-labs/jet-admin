/**
 * Deterministic utilities for marketplace template generation.
 *
 * Everything here is pure and seeded: the same template spec always produces
 * byte-identical JSON, SQL and seed data (dates are emitted relative to now()).
 */
const crypto = require("crypto");

const NAMESPACE = "jet-marketplace-v1";

function deterministicUUID(key) {
  const bytes = crypto.createHash("sha256").update(`${NAMESPACE}:${key}`).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const h = bytes.toString("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function hashSeed(value) {
  const digest = crypto.createHash("sha256").update(String(value)).digest();
  return digest.readUInt32LE(0) || 1;
}

function createRandom(seed) {
  let state = hashSeed(seed);
  const next = () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int(min, max) {
      if (max < min) [min, max] = [max, min];
      return Math.floor(next() * (max - min + 1)) + min;
    },
    chance(p) {
      return next() < p;
    },
    pick(list) {
      if (!Array.isArray(list) || list.length === 0) return undefined;
      return list[Math.floor(next() * list.length)];
    },
    shuffle(list) {
      const copy = [...list];
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(next() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    },
    uuid(key) {
      return deterministicUUID(key);
    },
  };
}

const FIRST_NAMES = [
  "Aarav", "Mira", "Jonas", "Priya", "Diego", "Hana", "Noah", "Zara", "Eli", "Sofia",
  "Kai", "Amara", "Luca", "Noor", "Theo", "Ishaan", "Freya", "Mateo", "Leila", "Owen",
  "Anika", "Tomás", "Yuki", "Samir", "Clara", "Ravi", "Iris", "Malik", "Elena", "Hugo",
];
const LAST_NAMES = [
  "Sharma", "Okafor", "Lindqvist", "Chen", "Alvarez", "Sato", "Meyer", "Khan", "Rossi", "Silva",
  "Andersen", "Nielsen", "Petrov", "Dubois", "Garcia", "Kim", "Hassan", "Novak", "Costa", "Wright",
  "Patel", "Tanaka", "Müller", "Osei", "Fischer", "Dubey", "Larsen", "Moreau", "Ivanova", "Bennett",
];
const COMPANY_PREFIXES = [
  "Northstar", "Aster", "Harbor", "Atlas", "Kinetic", "Lumen", "Cedar", "Orbit", "Vela", "Pioneer",
  "Summit", "Bluebird", "Copper", "Meridian", "Nimbus", "Solace", "Vantage", "Willow", "Zephyr", "Terra",
];
const COMPANY_SUFFIXES = [
  "Labs", "Works", "Studio", "Group", "Partners", "Systems", "Collective", "Industries", "Supply", "Digital",
];
const DEPARTMENTS = ["Sales", "Support", "Operations", "Finance", "People", "Engineering", "Procurement", "Security", "Fleet", "Success"];
const CITIES = ["Singapore", "Berlin", "Austin", "London", "Toronto", "Tokyo", "Lisbon", "Nairobi", "São Paulo", "Mumbai", "Sydney", "Amsterdam"];
const WORDS = [
  "renewal", "onboarding", "priority", "follow-up", "quarterly", "regional", "compliance", "handoff",
  "exception", "review", "forecast", "capacity", "escalation", "inventory", "settlement", "documentation",
  "maintenance", "inspection", "approval", "routing", "diagnostic", "retention", "availability", "variance",
];

function personName(rng) {
  return `${rng.pick(FIRST_NAMES)} ${rng.pick(LAST_NAMES)}`;
}

function companyName(rng) {
  return `${rng.pick(COMPANY_PREFIXES)} ${rng.pick(COMPANY_SUFFIXES)}`;
}

function emailFor(name, rng) {
  const domain = rng.pick(["example.com", "example.org", "demo.invalid", "sample.invalid"]);
  return `${name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "")}@${domain}`;
}

function phone(rng) {
  return `+1-555-${String(rng.int(100, 999))}-${String(rng.int(1000, 9999))}`;
}

function sentence(rng, words = 8) {
  const picks = Array.from({ length: words }, () => rng.pick(WORDS));
  picks[0] = picks[0].charAt(0).toUpperCase() + picks[0].slice(1);
  return `${picks.join(" ")}.`;
}

function titleCase(value) {
  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sqlString(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlInterval(days, hours = 0) {
  return `now() - interval '${days} days ${hours} hours'`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toCsv(rows, columns) {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [columns.map(esc).join(","), ...rows.map((r) => columns.map((c) => esc(r[c])).join(","))].join("\n") + "\n";
}

module.exports = {
  NAMESPACE,
  deterministicUUID,
  createRandom,
  personName,
  companyName,
  emailFor,
  phone,
  sentence,
  titleCase,
  slugify,
  sqlString,
  sqlInterval,
  escapeHtml,
  toCsv,
  FIRST_NAMES,
  LAST_NAMES,
  DEPARTMENTS,
  CITIES,
  COMPANY_PREFIXES,
  COMPANY_SUFFIXES,
};
