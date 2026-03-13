/**
 * Deterministic ATS scoring based on keyword matching + resume structure heuristics.
 * This does NOT require an AI key and provides consistent scoring.
 */

const SECTION_PATTERNS = {
  summary: /\b(summary|profile|objective)\b/i,
  experience: /\b(experience|employment|work history|professional experience)\b/i,
  skills: /\b(skills|technical skills|core competencies)\b/i,
  education: /\b(education|certifications|certification|training)\b/i,
  projects: /\b(projects|portfolio)\b/i,
};

const COMMON_KEYWORDS = [
  // Impact / leadership
  'led', 'managed', 'owned', 'delivered', 'improved', 'optimized', 'increased', 'reduced',
  'scaled', 'launched', 'designed', 'implemented', 'architected', 'mentored',
  // Metrics
  '%', 'kpi', 'roi', 'sla', 'okrs', 'latency', 'throughput',
  // Modern tooling (broad)
  'react', 'node', 'express', 'postgres', 'sql', 'api', 'rest', 'graphql',
  'aws', 'docker', 'kubernetes', 'ci/cd', 'git', 'typescript', 'javascript',
  'python', 'java', 'microservices', 'testing', 'jest', 'cypress',
];

function clamp(n) {
  const v = Number.isFinite(n) ? n : 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9+/#.%\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function keywordScore(text) {
  const t = (text || '').toLowerCase();
  let hits = 0;
  for (const kw of COMMON_KEYWORDS) {
    if (kw === '%') {
      if (/%\s*\d|\d+\s*%/.test(t)) hits += 1;
      continue;
    }
    if (t.includes(kw)) hits += 1;
  }
  // Normalize: 0..COMMON_KEYWORDS.length -> 0..100 with diminishing returns
  const ratio = hits / Math.max(1, COMMON_KEYWORDS.length);
  const score = 100 * (1 - Math.exp(-4 * ratio));
  return clamp(score);
}

function structureScore(text) {
  const t = text || '';
  const sectionHits = Object.values(SECTION_PATTERNS).reduce((acc, re) => acc + (re.test(t) ? 1 : 0), 0);
  const sectionsPart = (sectionHits / Object.keys(SECTION_PATTERNS).length) * 60;

  // Contact cues
  const hasEmail = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(t);
  const hasPhone = /(\+\d{1,3}[\s-]?)?(\(?\d{3}\)?[\s-]?)\d{3}[\s-]?\d{4}/.test(t);
  const contactPart = (hasEmail ? 10 : 0) + (hasPhone ? 10 : 0);

  // Bullet density heuristic (ATS-friendly)
  const bullets = (t.match(/(^|\n)\s*[-•*]\s+/g) || []).length;
  const bulletPart = bullets >= 8 ? 20 : bullets >= 4 ? 12 : bullets >= 1 ? 6 : 0;

  return clamp(sectionsPart + contactPart + bulletPart);
}

function experienceScore(text) {
  const t = text || '';
  const hasDates = /\b(19|20)\d{2}\b/.test(t);
  const hasActionVerbs = /\b(led|built|designed|implemented|shipped|delivered|improved|reduced|increased|optimized)\b/i.test(t);
  const hasMetrics = /(\d+%|\$\d+|\b\d+\b\s*(ms|s|mins|hours|days|users|customers|requests|rps|qps|gb|tb))/.test(t);

  let score = 50;
  if (hasDates) score += 15;
  if (hasActionVerbs) score += 20;
  if (hasMetrics) score += 15;
  return clamp(score);
}

function skillsScore(text) {
  const tokens = tokenize(text);
  // Unique “skill-like” tokens count: crude proxy
  const unique = new Set(tokens.filter((w) => w.length >= 3 && w.length <= 20));
  const hasSkillsSection = SECTION_PATTERNS.skills.test(text || '');
  let score = Math.min(80, unique.size / 12 * 80);
  if (hasSkillsSection) score += 20;
  return clamp(score);
}

function educationScore(text) {
  const t = text || '';
  const hasEdu = SECTION_PATTERNS.education.test(t);
  const hasDegree = /\b(b\.?s\.?|m\.?s\.?|ph\.?d\.?|bachelor|master|doctorate|associate)\b/i.test(t);
  const hasSchool = /\b(university|college|institute|school)\b/i.test(t);
  if (!hasEdu && !hasDegree && !hasSchool) return 70; // don’t penalize missing education heavily
  return clamp((hasEdu ? 40 : 0) + (hasDegree ? 35 : 0) + (hasSchool ? 25 : 0));
}

function formatScore(text) {
  const t = text || '';
  const length = t.trim().length;
  const tooShort = length < 800;
  const tooLong = length > 16000;
  const hasWeirdSpacing = /\s{4,}/.test(t);
  const hasAllCapsLines = (t.match(/\n[A-Z\s]{15,}\n/g) || []).length > 5;

  let score = 80;
  if (tooShort) score -= 20;
  if (tooLong) score -= 15;
  if (hasWeirdSpacing) score -= 10;
  if (hasAllCapsLines) score -= 5;
  return clamp(score);
}

function overallATS({ keywordScore, formatScore, experienceScore, skillsScore, educationScore, structureScore }) {
  // Weighted blend aligned to ATS priorities
  const score =
    keywordScore * 0.28 +
    structureScore * 0.20 +
    formatScore * 0.16 +
    experienceScore * 0.20 +
    skillsScore * 0.10 +
    educationScore * 0.06;
  return clamp(score);
}

export function scoreResumeDeterministically(resumeText) {
  const k = keywordScore(resumeText);
  const s = structureScore(resumeText);
  const f = formatScore(resumeText);
  const e = experienceScore(resumeText);
  const sk = skillsScore(resumeText);
  const ed = educationScore(resumeText);
  const ats = overallATS({
    keywordScore: k,
    structureScore: s,
    formatScore: f,
    experienceScore: e,
    skillsScore: sk,
    educationScore: ed,
  });

  return {
    atsScore: ats,
    keywordScore: k,
    formatScore: f,
    experienceScore: e,
    skillsScore: sk,
    educationScore: ed,
    _meta: { provider: 'heuristic' },
  };
}

