/* Handoff core: state, persistence, time math, briefing builder, change tracking, staleness. */
'use strict';

const KEY = 'handoff.v1';
const DAY = 86400000;
const MONTH = 30.44 * DAY;

const uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
const nowISO = () => new Date().toISOString();
const isoDaysAgo = (d) => new Date(Date.now() - d * DAY).toISOString();
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const AVATAR_COLORS = ['#F6C9B8', '#CFE3D4', '#D7D2F0', '#F7E2A8', '#BFDDEB', '#F2C6D8'];
const AVATAR_INK = ['#8A3B22', '#2F5B3C', '#4B3F8A', '#7A5A0C', '#245468', '#86304F'];

const HOUSE_FIELDS = [
  { key: 'address', label: 'Address', ph: '42 Linden Street, Apt 3B', changed: 'Address updated' },
  { key: 'wifiName', label: 'Wi-Fi network', ph: 'Linden-Home', changed: 'New Wi-Fi network name' },
  { key: 'wifiPass', label: 'Wi-Fi password', ph: 'sunflower-42', changed: 'New Wi-Fi password' },
  { key: 'doorCode', label: 'Door / alarm code', ph: '4821 then #', changed: 'New door code' },
  { key: 'urgentCare', label: 'Nearest urgent care', ph: 'Name, address, hours, how to get there', changed: 'Urgent care info updated', multi: true },
  { key: 'pets', label: 'Pets', ph: 'Names, feeding, anything to watch for', changed: 'Pet notes updated', multi: true },
];

const DEFAULT_EXTRAS = [
  'Pizza money is in the blue bowl by the door',
  'Dessert is OK tonight (one cookie each)',
  'Bath is optional tonight',
  'Text us a photo at bedtime if you can',
];

function emptyState() {
  return {
    kids: [], contacts: [], rules: [], caregivers: [], handoffs: [],
    house: { fields: {}, updatedAt: null },
    extrasLib: DEFAULT_EXTRAS.slice(),
    settings: { staleMonths: 6, clock24: false },
    reviewedAt: {}, log: [], draft: null, onboarded: false,
  };
}

function normalize(d) {
  const s = Object.assign(emptyState(), d || {});
  ['kids', 'contacts', 'rules', 'caregivers', 'handoffs', 'log', 'extrasLib'].forEach((k) => { if (!Array.isArray(s[k])) s[k] = []; });
  s.house = s.house && typeof s.house === 'object' ? s.house : { fields: {} };
  s.house.fields = s.house.fields || {};
  // accept flat legacy house props
  HOUSE_FIELDS.forEach((f) => {
    if (!s.house.fields[f.key] && typeof s.house[f.key] === 'string' && s.house[f.key]) {
      s.house.fields[f.key] = { value: s.house[f.key], updatedAt: s.house.updatedAt || nowISO() };
    }
  });
  s.settings = Object.assign({ staleMonths: 6, clock24: false }, s.settings || {});
  s.reviewedAt = s.reviewedAt || {};
  s.kids.forEach((k, i) => {
    k.id = k.id || uid();
    k.allergies = (k.allergies || []).map((a) => Object.assign({ id: uid(), severity: 'mild', createdAt: a.updatedAt || nowISO(), updatedAt: nowISO() }, a));
    k.meds = (k.meds || []).map((m) => Object.assign({ id: uid(), doseNote: '', when: '', createdAt: m.updatedAt || nowISO(), updatedAt: nowISO() }, m));
    k.routine = (k.routine || []).map((r) => Object.assign({ id: uid(), offsetMin: 0 }, r));
    k.bedtimeWeekday = k.bedtimeWeekday || '19:30';
    k.bedtimeWeekend = k.bedtimeWeekend || k.bedtimeWeekday;
    k.fieldsAt = k.fieldsAt || {};
    k.createdAt = k.createdAt || k.updatedAt || nowISO();
    if (k.color == null) k.color = i % AVATAR_COLORS.length;
  });
  s.contacts.forEach((c) => { c.id = c.id || uid(); c.createdAt = c.createdAt || c.updatedAt || nowISO(); c.updatedAt = c.updatedAt || c.createdAt; });
  s.rules.forEach((r) => { r.id = r.id || uid(); r.createdAt = r.createdAt || r.updatedAt || nowISO(); r.updatedAt = r.updatedAt || r.createdAt; });
  s.caregivers.forEach((c) => { c.id = c.id || uid(); c.level = c.level || 'new'; c.visits = c.visits || 0; });
  s.handoffs.forEach((h) => { h.id = h.id || uid(); h.kidIds = h.kidIds || []; h.extras = h.extras || []; h.bedtimeOverrides = h.bedtimeOverrides || {}; });
  return s;
}

let S = emptyState();
function load() {
  try { const raw = localStorage.getItem(KEY); S = normalize(raw ? JSON.parse(raw) : null); }
  catch (e) { S = emptyState(); }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage full or blocked */ }
}
function logRemoval(text) {
  S.log.unshift({ at: nowISO(), text });
  if (S.log.length > 100) S.log.length = 100;
}

/* ---------- time ---------- */
const toMin = (hhmm) => { const m = /^(\d{1,2}):(\d{2})/.exec(hhmm || ''); return m ? (+m[1]) * 60 + (+m[2]) : 0; };
const toHHMM = (min) => { const m = ((min % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
function fmtTime(min) {
  const m = ((min % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60), mm = String(m % 60).padStart(2, '0');
  if (S.settings.clock24) return String(h).padStart(2, '0') + ':' + mm;
  return ((h % 12) || 12) + ':' + mm + ' ' + (h < 12 ? 'AM' : 'PM');
}
const fmtHHMM = (s) => fmtTime(toMin(s));
const fmtOffset = (o) => (o === 0 ? 'at bedtime' : (o < 0 ? '−' : '+') + Math.abs(o) + ' min');
function todayStr() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function parseDay(s) { const [y, m, d] = (s || todayStr()).split('-').map(Number); return new Date(y, m - 1, d); }
const isWeekendNight = (dateStr) => { const g = parseDay(dateStr).getDay(); return g === 5 || g === 6; };
const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDayLong = (s) => { const d = parseDay(s); return DOW[d.getDay()] + ', ' + MON[d.getMonth()] + ' ' + d.getDate(); };
const fmtDayShort = (s) => { const d = parseDay(s); return DOW[d.getDay()].slice(0, 3) + ' ' + MON[d.getMonth()] + ' ' + d.getDate(); };
function agoText(iso) {
  if (!iso) return 'never';
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < DAY) return 'today';
  if (diff < 2 * DAY) return 'yesterday';
  const mo = Math.floor(diff / MONTH);
  if (mo < 1) return Math.floor(diff / DAY) + ' days ago';
  if (mo < 12) return mo + (mo === 1 ? ' month ago' : ' months ago');
  const y = Math.floor(mo / 12); return y + (y === 1 ? ' year ago' : ' years ago');
}

/* ---------- kids ---------- */
const kidById = (id) => S.kids.find((k) => k.id === id);
const cgById = (id) => S.caregivers.find((c) => c.id === id);
const initials = (name) => (name || '?').trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
function kidAge(k) {
  if (k.birthday) {
    const b = new Date(k.birthday), n = new Date();
    let months = (n.getFullYear() - b.getFullYear()) * 12 + (n.getMonth() - b.getMonth());
    if (n.getDate() < b.getDate()) months--;
    if (!isNaN(months)) return months < 24 ? Math.max(0, months) + ' mo' : String(Math.floor(months / 12));
  }
  return k.age ? String(k.age) : '';
}
function avatar(k, size) {
  const c = (k && k.color) || 0;
  return `<span class="av${size ? ' av-' + size : ''}" style="background:${AVATAR_COLORS[c % 6]};color:${AVATAR_INK[c % 6]}">${esc(initials(k ? k.name : '?'))}</span>`;
}
function joinNames(arr) {
  if (arr.length <= 1) return arr.join('');
  return arr.slice(0, -1).join(', ') + ' & ' + arr[arr.length - 1];
}

/* ---------- tonight timeline ---------- */
function newDraft() {
  const last = S.handoffs[0];
  return {
    caregiverId: last && cgById(last.caregiverId) ? last.caregiverId : (S.caregivers[0] ? S.caregivers[0].id : null),
    kidIds: S.kids.map((k) => k.id), date: todayStr(), leaveAt: '18:00', backBy: '22:30', overnight: false,
    bedtimeOverrides: {}, extras: [], notes: '', savedId: null, baseBriefedAt: null, hidden: {},
  };
}
function defaultBedtime(k, dateStr) { return isWeekendNight(dateStr) ? k.bedtimeWeekend : k.bedtimeWeekday; }
function kidBedtime(k, d) { return (d.bedtimeOverrides && d.bedtimeOverrides[k.id]) || defaultBedtime(k, d.date); }

function buildTimeline(d) {
  const kids = S.kids.filter((k) => d.kidIds.includes(k.id));
  const leave = toMin(d.leaveAt);
  let back = toMin(d.backBy);
  if (d.overnight) back += 1440;
  const map = new Map();
  kids.forEach((k) => {
    const bt = toMin(kidBedtime(k, d));
    const steps = k.routine.slice();
    if (!steps.some((s) => s.offsetMin === 0)) steps.push({ id: 'bt', label: 'Bedtime', offsetMin: 0 });
    steps.forEach((s) => {
      let t = bt + s.offsetMin;
      if (t < leave - 360) t += 1440; // early-morning bedtimes (after midnight) sort after evening
      const key = t + '|' + s.label.trim().toLowerCase();
      if (map.has(key)) map.get(key).kids.push(k);
      else map.set(key, { t, label: s.label.trim() || 'Step', kids: [k], kind: 'step' });
    });
  });
  const items = Array.from(map.values());
  items.forEach((it) => { it.before = it.t < leave; it.after = it.t > back; });
  items.push({ t: leave, label: 'You head out', kind: 'leave', kids: [] });
  items.push({ t: back, label: "You're back", kind: 'back', kids: [] });
  const order = { leave: 0, step: 1, back: 2 };
  items.sort((a, b) => a.t - b.t || order[a.kind] - order[b.kind]);
  return items;
}
function timesValid(d) { return d.overnight || toMin(d.backBy) > toMin(d.leaveAt); }

/* ---------- changes since ---------- */
function changesSince(ts) {
  if (!ts) return [];
  const out = [];
  const after = (x) => !!x && x > ts;
  S.kids.forEach((k) => {
    if (after(k.createdAt)) { out.push(`New profile: ${k.name}`); return; }
    k.allergies.forEach((a) => {
      if (after(a.createdAt)) out.push(`${k.name}: now allergic to ${a.text.toLowerCase()}${a.severity === 'severe' ? ' (SEVERE)' : ''}`);
      else if (after(a.updatedAt)) out.push(`${k.name}: ${a.text} allergy updated (${a.severity})`);
    });
    k.meds.forEach((m) => {
      if (after(m.createdAt)) out.push(`${k.name}: new medication — ${m.name}${m.doseNote ? ', ' + m.doseNote : ''}`);
      else if (after(m.updatedAt)) out.push(`${k.name}: ${m.name} dose/notes changed — ${m.doseNote || 'see below'}`);
    });
    const f = k.fieldsAt || {};
    if (after(f.bedtimeWeekday)) out.push(`${k.name}: school-night bedtime is now ${fmtHHMM(k.bedtimeWeekday)}`);
    if (after(f.bedtimeWeekend)) out.push(`${k.name}: weekend bedtime is now ${fmtHHMM(k.bedtimeWeekend)}`);
    if (after(f.routine)) out.push(`${k.name}: bedtime routine changed`);
    if (after(f.comfort)) out.push(`${k.name}: comfort items updated`);
    if (after(f.calming)) out.push(`${k.name}: new tips for calming down`);
  });
  HOUSE_FIELDS.forEach((hf) => { const v = S.house.fields[hf.key]; if (v && after(v.updatedAt)) out.push(hf.changed); });
  S.contacts.forEach((c) => {
    if (after(c.createdAt)) out.push(`New contact: ${c.name}${c.role ? ' (' + c.role + ')' : ''}`);
    else if (after(c.updatedAt)) out.push(`Contact updated: ${c.name}`);
  });
  S.rules.forEach((r) => {
    if (after(r.createdAt)) out.push(`New rule: ${r.text}`);
    else if (after(r.updatedAt)) out.push(`Rule updated: ${r.text}`);
  });
  S.log.forEach((l) => { if (after(l.at)) out.push(l.text); });
  return out;
}

/* ---------- staleness ---------- */
function reviewItems() {
  const items = [];
  const rv = (path, ts) => { const r = S.reviewedAt[path]; return r && (!ts || r > ts) ? r : ts; };
  S.kids.forEach((k) => {
    k.allergies.forEach((a) => items.push({ path: 'allergy:' + a.id, ts: rv('allergy:' + a.id, a.updatedAt), label: `${k.name}'s ${a.text.toLowerCase()} allergy`, edit: { kind: 'allergy', kid: k.id, id: a.id } }));
    k.meds.forEach((m) => items.push({ path: 'med:' + m.id, ts: rv('med:' + m.id, m.updatedAt), label: `${k.name}'s ${m.name} dose`, edit: { kind: 'med', kid: k.id, id: m.id } }));
    if (k.routine.length) items.push({ path: 'routine:' + k.id, ts: rv('routine:' + k.id, k.fieldsAt.routine || k.createdAt), label: `${k.name}'s bedtime routine`, edit: { kind: 'kid', kid: k.id } });
  });
  HOUSE_FIELDS.forEach((hf) => {
    const v = S.house.fields[hf.key];
    if (v && v.value) items.push({ path: 'house:' + hf.key, ts: rv('house:' + hf.key, v.updatedAt), label: hf.label, edit: { kind: 'house', id: hf.key } });
  });
  S.contacts.forEach((c) => items.push({ path: 'contact:' + c.id, ts: rv('contact:' + c.id, c.updatedAt), label: `${c.name}'s phone number`, edit: { kind: 'contact', id: c.id } }));
  S.rules.forEach((r) => items.push({ path: 'rule:' + r.id, ts: rv('rule:' + r.id, r.updatedAt), label: `Rule: “${r.text.length > 40 ? r.text.slice(0, 38) + '…' : r.text}”`, edit: { kind: 'rule', id: r.id } }));
  return items;
}
function isStale(ts) { return !ts || (Date.now() - new Date(ts).getTime()) > S.settings.staleMonths * MONTH; }
function staleItems() { return reviewItems().filter((i) => isStale(i.ts)).sort((a, b) => (a.ts || '').localeCompare(b.ts || '')); }
function lastReviewed(path, ts) { const r = S.reviewedAt[path]; return r && (!ts || r > ts) ? r : ts; }

/* ---------- briefing ---------- */
const SECTIONS = [
  { key: 'changes', label: 'New since last time' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'notes', label: 'Tonight’s notes' },
  { key: 'care', label: 'Comfort & calming' },
  { key: 'contacts', label: 'Contacts' },
  { key: 'house', label: 'House info' },
  { key: 'rules', label: 'House rules' },
];
const LEVELS = {
  new: { label: 'New sitter', desc: 'Everything — address, Wi-Fi, urgent care, all contacts and rules.', sections: ['changes', 'timeline', 'notes', 'care', 'contacts', 'house', 'rules'] },
  regular: { label: 'Regular', desc: 'Tonight’s timeline, rules, contacts and what changed since their last visit.', sections: ['changes', 'timeline', 'notes', 'contacts', 'rules'] },
  family: { label: 'Family', desc: 'Just the timeline and tonight’s notes. They know the house.', sections: ['changes', 'timeline', 'notes'] },
};
function sectionOn(d, cg, key) {
  if (d.hidden && d.hidden[key] != null) return !d.hidden[key];
  return LEVELS[(cg && cg.level) || 'new'].sections.includes(key);
}
function briefingBase(d, cg) { return d.savedId ? d.baseBriefedAt : (cg && cg.lastBriefedAt); }

function buildBriefing(d) {
  const cg = cgById(d.caregiverId);
  const kids = S.kids.filter((k) => d.kidIds.includes(k.id));
  const L = [];
  const on = (k) => sectionOn(d, cg, k);
  L.push(`🏠 HANDOFF · ${fmtDayLong(d.date)}`);
  L.push(`For ${cg ? cg.name : 'our sitter'}${kids.length ? ' · ' + joinNames(kids.map((k) => k.name)) : ''}`);
  L.push(`Out ${fmtHHMM(d.leaveAt)} → back by ${fmtHHMM(d.backBy)}${d.overnight ? ' (after midnight)' : ''}`);

  // safety first, always
  L.push('', '⚠️ ALLERGIES & MEDS');
  const safety = [];
  kids.forEach((k) => {
    k.allergies.slice().sort((a, b) => (a.severity === 'severe' ? -1 : 1) - (b.severity === 'severe' ? -1 : 1)).forEach((a) => {
      safety.push(a.severity === 'severe' ? `• ${k.name}: ${a.text.toUpperCase()} — SEVERE ⚠️` : `• ${k.name}: ${a.text} (mild)`);
    });
  });
  kids.forEach((k) => k.meds.forEach((m) => safety.push(`• ${k.name}: 💊 ${m.name}${m.doseNote ? ' — ' + m.doseNote : ''}${m.when ? ' (' + m.when + ')' : ''}`)));
  if (safety.length) L.push(...safety); else L.push('• No allergies or medications.');

  const base = briefingBase(d, cg);
  const changes = changesSince(base);
  if (on('changes') && changes.length) {
    L.push('', '🆕 NEW SINCE LAST TIME');
    changes.forEach((c) => L.push('• ' + c));
  }
  if (on('timeline')) {
    L.push('', '🕒 TONIGHT');
    const many = kids.length > 1;
    buildTimeline(d).filter((it) => it.kind !== 'step' || !it.before).forEach((it) => {
      let who = '';
      if (it.kind === 'step' && many) who = it.kids.length === kids.length ? ' (both)'.replace('both', kids.length > 2 ? 'everyone' : 'both') : ' — ' + joinNames(it.kids.map((k) => k.name));
      L.push(`${fmtTime(it.t).padStart(S.settings.clock24 ? 5 : 8)}  ${it.label}${who}`);
    });
  }
  if (on('notes') && (d.extras.length || (d.notes || '').trim())) {
    L.push('', '📝 NOTES FOR TONIGHT');
    d.extras.forEach((e) => L.push('• ' + e));
    if ((d.notes || '').trim()) L.push(d.notes.trim());
  }
  if (on('care')) {
    const care = kids.filter((k) => k.comfort || k.calming);
    if (care.length) {
      L.push('', '💛 COMFORT & CALMING');
      care.forEach((k) => {
        const age = kidAge(k);
        L.push(`${k.name}${age ? ' (' + age + ')' : ''}`);
        if (k.comfort) L.push('  Comfort: ' + k.comfort);
        if (k.calming) L.push('  Calms down with: ' + k.calming);
      });
    }
  }
  if (on('contacts') && S.contacts.length) {
    L.push('', '📞 CONTACTS (in this order)');
    S.contacts.forEach((c) => L.push(`• ${c.name}${c.role ? ' (' + c.role + ')' : ''}: ${c.phone || '—'}`));
    L.push('Emergency: call 911 first, then us.');
  }
  if (on('house')) {
    const f = S.house.fields, val = (k) => (f[k] && f[k].value) || '';
    const rows = [];
    if (val('address')) rows.push('Address: ' + val('address'));
    if (val('wifiName') || val('wifiPass')) rows.push(`Wi-Fi: ${val('wifiName') || '—'} / ${val('wifiPass') || '—'}`);
    if (val('doorCode')) rows.push('Door code: ' + val('doorCode'));
    if (val('urgentCare')) rows.push('Urgent care: ' + val('urgentCare'));
    if (val('pets')) rows.push('Pets: ' + val('pets'));
    if (rows.length) { L.push('', '🏡 HOUSE'); L.push(...rows); }
  }
  if (on('rules') && S.rules.length) {
    L.push('', '📋 HOUSE RULES');
    S.rules.forEach((r) => L.push('• ' + r.text));
  }
  L.push('', 'Thank you! 💛');
  return { text: L.join('\n'), changes: on('changes') ? changes : [], hasBase: !!base };
}

/* ---------- sample family ---------- */
function sampleData() {
  const s = emptyState();
  const t = (d) => isoDaysAgo(d);
  const ava = {
    id: uid(), name: 'Ava', age: '4', birthday: '', color: 0, bedtimeWeekday: '19:30', bedtimeWeekend: '20:00',
    comfort: 'Bunny named Hops and the yellow blanket', calming: 'Back rub, the rain-sound night light, and singing “You Are My Sunshine”',
    allergies: [{ id: uid(), text: 'Peanuts', severity: 'severe', createdAt: t(300), updatedAt: t(60) }],
    meds: [{ id: uid(), name: 'EpiPen Jr', doseNote: 'in the red pouch on the fridge — use for any swelling or trouble breathing, then call 911', when: 'emergency only', createdAt: t(300), updatedAt: t(40) }],
    routine: [
      { id: uid(), label: 'Dinner', offsetMin: -90 }, { id: uid(), label: 'Bath', offsetMin: -45 },
      { id: uid(), label: 'PJs & teeth', offsetMin: -30 }, { id: uid(), label: 'Two books', offsetMin: -15 },
      { id: uid(), label: 'Lights out', offsetMin: 0 }, { id: uid(), label: 'Peek in on Ava', offsetMin: 30 },
    ],
    fieldsAt: { routine: t(50) }, createdAt: t(320), updatedAt: t(40),
  };
  const leo = {
    id: uid(), name: 'Leo', age: '7', birthday: '', color: 4, bedtimeWeekday: '20:15', bedtimeWeekend: '20:45',
    comfort: 'Glow-in-the-dark dinosaur', calming: 'Give him 5 minutes alone with his Lego, then talk it through',
    allergies: [{ id: uid(), text: 'Dust mites', severity: 'mild', createdAt: t(330), updatedAt: t(150) }],
    meds: [{ id: uid(), name: 'Children’s Zyrtec', doseNote: '5 ml', when: 'only if itchy or sneezy', createdAt: t(330), updatedAt: t(215) }],
    routine: [
      { id: uid(), label: 'Dinner', offsetMin: -135 }, { id: uid(), label: 'Shower', offsetMin: -60 },
      { id: uid(), label: 'Reading time', offsetMin: -30 }, { id: uid(), label: 'Lights out', offsetMin: 0 },
    ],
    fieldsAt: { routine: t(90) }, createdAt: t(320), updatedAt: t(90),
  };
  s.kids = [ava, leo];
  s.contacts = [
    { id: uid(), name: 'Sam', role: 'Mom', phone: '(555) 201-3344', createdAt: t(320), updatedAt: t(30) },
    { id: uid(), name: 'Jordan', role: 'Dad', phone: '(555) 201-7781', createdAt: t(320), updatedAt: t(30) },
    { id: uid(), name: 'Grandma Rose', role: 'lives 10 min away', phone: '(555) 388-1902', createdAt: t(320), updatedAt: t(100) },
    { id: uid(), name: 'Dr. Patel', role: 'pediatrician', phone: '(555) 640-2200', createdAt: t(320), updatedAt: t(120) },
    { id: uid(), name: 'Poison Control', role: 'US', phone: '1-800-222-1222', createdAt: t(320), updatedAt: t(120) },
  ];
  const hf = (v, d) => ({ value: v, updatedAt: t(d) });
  s.house.fields = {
    address: hf('42 Linden Street, Apt 3B (blue door, buzzer 3B)', 120),
    wifiName: hf('Linden-Home', 90), wifiPass: hf('sunflower-42', 90), doorCode: hf('4821 then #', 60),
    urgentCare: hf('CityMed Urgent Care, 210 Oak Ave — 1.2 mi, open till 10 PM. After 10: Mercy Children’s ER, 5 Park Rd.', 140),
    pets: hf('Biscuit the dog — dinner at 6 (1 scoop), never let him out the front door', 70),
  };
  s.rules = [
    { id: uid(), text: 'Screen time: 30 min max, PBS Kids or Bluey only', createdAt: t(200), updatedAt: t(100) },
    { id: uid(), text: 'Snacks after dinner: fruit or crackers, no candy', createdAt: t(200), updatedAt: t(100) },
    { id: uid(), text: 'The office upstairs is off-limits', createdAt: t(200), updatedAt: t(100) },
    { id: uid(), text: 'No visitors without checking with us first', createdAt: t(200), updatedAt: t(100) },
  ];
  const maya = { id: uid(), name: 'Maya', role: 'sitter', phone: '(555) 410-2290', level: 'regular', visits: 3, lastBriefedAt: t(12) };
  const rose = { id: uid(), name: 'Grandma Rose', role: 'grandma', phone: '(555) 388-1902', level: 'family', visits: 2, lastBriefedAt: t(26) };
  s.caregivers = [maya, rose];
  const dayStr = (d) => { const x = new Date(Date.now() - d * DAY); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
  s.handoffs = [
    { id: uid(), date: dayStr(12), createdAt: t(12), caregiverId: maya.id, kidIds: [ava.id, leo.id], leaveAt: '18:30', backBy: '23:00', overnight: false, bedtimeOverrides: {}, extras: ['Pizza money is in the blue bowl by the door'], notes: '', afterNote: 'Went down easy. Leo read for an extra 10 min.' },
    { id: uid(), date: dayStr(26), createdAt: t(26), caregiverId: rose.id, kidIds: [ava.id, leo.id], leaveAt: '17:30', backBy: '22:00', overnight: false, bedtimeOverrides: {}, extras: ['Dessert is OK tonight (one cookie each)'], notes: 'Ava has a small scrape on her knee — bandage is fine.', afterNote: 'Skipped bath, all good.' },
    { id: uid(), date: dayStr(33), createdAt: t(33), caregiverId: maya.id, kidIds: [leo.id], leaveAt: '19:00', backBy: '22:30', overnight: false, bedtimeOverrides: { [leo.id]: '20:45' }, extras: [], notes: 'Ava is at a sleepover.', afterNote: '' },
  ];
  s.onboarded = true;
  return s;
}
