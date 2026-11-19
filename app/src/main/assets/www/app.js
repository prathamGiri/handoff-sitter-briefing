/* Handoff UI: screens, sheets, dialogs, navigation. Depends on core.js. */
'use strict';

const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

const IC = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/>',
  kids: '<circle cx="12" cy="12" r="8.5"/><path d="M8.8 14.2c.8 1.1 1.9 1.7 3.2 1.7s2.4-.6 3.2-1.7"/><circle cx="9.3" cy="10" r=".6" fill="currentColor"/><circle cx="14.7" cy="10" r=".6" fill="currentColor"/>',
  house: '<path d="M4 20V9l8-5 8 5v11"/><path d="M9 20v-6h6v6"/><path d="M15.5 4.5V3h2.5v3.2"/>',
  people: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3 19.5c.6-3.2 3-5 6-5s5.4 1.8 6 5"/><circle cx="17" cy="9.5" r="2.4"/><path d="M16.5 14.6c2.3.2 4 1.8 4.5 4.9"/>',
  history: '<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1"/><path d="M3 4v4h4"/><path d="M12 7.5V12l3 2"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chev: '<path d="M9 5l7 7-7 7"/>',
  warn: '<path d="M12 3.5 2.5 20h19L12 3.5z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.3" r=".7" fill="currentColor"/>',
  copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2.5"/><path d="M15.5 8.5V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7.5a2 2 0 0 0 2 2h2.5"/>',
  share: '<path d="M12 15V3.5"/><path d="M7.5 8 12 3.5 16.5 8"/><path d="M5 12.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-6.5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>',
  trash: '<path d="M4.5 7h15"/><path d="M9.5 7V4.5h5V7"/><path d="M6.5 7l1 13h9l1-13"/>',
  up: '<path d="M6 14l6-6 6 6"/>',
  down: '<path d="M6 10l6 6 6-6"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  repeat: '<path d="M17 2.5 20.5 6 17 9.5"/><path d="M3.5 11.5V10a4 4 0 0 1 4-4h13"/><path d="M7 21.5 3.5 18 7 14.5"/><path d="M20.5 12.5V14a4 4 0 0 1-4 4h-13"/>',
  note: '<path d="M5 4h14v11l-5 5H5z"/><path d="M14 20v-5h5"/><path d="M8.5 9h7M8.5 12.5h4"/>',
};
const icon = (n, cls) => `<svg class="ic${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;

/* ---------- navigation ---------- */
const nav = { tab: 'home', stack: [] };
const cur = () => nav.stack[nav.stack.length - 1] || { view: nav.tab };
function go(view, params) { nav.stack.push(Object.assign({ view }, params || {})); render(true); }
function goBack() { if (nav.stack.length) { nav.stack.pop(); render(true, 'back'); return true; } if (nav.tab !== 'home') { nav.tab = 'home'; render(true); return true; } return false; }
function setTab(t) { nav.tab = t; nav.stack = []; render(true); }

/* ---------- feedback ---------- */
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}
const buzz = (ms) => { try { window.Android && window.Android.vibrate && window.Android.vibrate(ms || 15); } catch (e) { /* noop */ } };
function copyText(text) {
  let ok = false;
  try {
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); ok = document.execCommand('copy'); ta.remove();
  } catch (e) { ok = false; }
  try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).catch(() => {}); ok = true; } catch (e) { /* noop */ }
  return ok;
}
function shareText(text) {
  if (window.Android && typeof window.Android.share === 'function') { try { window.Android.share(text); return 'shared'; } catch (e) { /* fall through */ } }
  copyText(text); return 'copied';
}

/* ---------- overlays: dialog + sheet ---------- */
const overlays = [];
function confirmDialog({ title, body, ok = 'OK', cancel = 'Cancel', danger = false }) {
  return new Promise((resolve) => {
    const el = document.createElement('div');
    el.className = 'scrim dialog-scrim';
    el.innerHTML = `<div class="dialog" role="alertdialog" aria-modal="true"><h3>${esc(title)}</h3>${body ? `<p>${esc(body)}</p>` : ''}
      <div class="dialog-actions"><button class="btn ghost" data-r="0">${esc(cancel)}</button><button class="btn ${danger ? 'danger' : 'primary'}" data-r="1" id="dlg-ok">${esc(ok)}</button></div></div>`;
    let done = false;
    const close = (v) => { if (done) return; done = true; el.classList.remove('open'); setTimeout(() => el.remove(), 180); overlays.splice(overlays.indexOf(entry), 1); resolve(v); };
    const entry = { close: () => close(false) };
    el.addEventListener('click', (e) => { const b = e.target.closest('[data-r]'); if (b) close(b.dataset.r === '1'); else if (e.target === el) close(false); });
    document.body.appendChild(el); overlays.push(entry);
    requestAnimationFrame(() => el.classList.add('open'));
  });
}
function openSheet({ title, body, onMount, primary, onPrimary, danger, onDanger, wide }) {
  const el = document.createElement('div');
  el.className = 'scrim sheet-scrim';
  el.innerHTML = `<div class="sheet${wide ? ' wide' : ''}" role="dialog" aria-modal="true"><div class="grab"></div>
    <div class="sheet-head"><h3>${esc(title)}</h3><button class="icon-btn" data-sheet-close aria-label="Close">✕</button></div>
    <form class="sheet-body" novalidate>${body}</form>
    <div class="sheet-foot">${danger ? `<button type="button" class="btn ghost danger-text" data-sheet-danger>${esc(danger)}</button>` : ''}${primary ? `<button type="button" class="btn primary grow" data-sheet-primary id="sheet-save">${esc(primary)}</button>` : ''}</div></div>`;
  const entry = { close: () => close() };
  let closing = false, busy = false;
  function close() { if (closing || !el.isConnected) return; closing = true; el.classList.remove('open'); setTimeout(() => el.remove(), 220); const i = overlays.indexOf(entry); if (i >= 0) overlays.splice(i, 1); }
  el.addEventListener('click', async (e) => {
    if (closing || busy) return; // ignore rapid repeat taps while saving/closing
    if (e.target === el || e.target.closest('[data-sheet-close]')) return close();
    const act = e.target.closest('[data-sheet-primary]') ? onPrimary : e.target.closest('[data-sheet-danger]') ? onDanger : undefined;
    if (act === undefined) return;
    busy = true;
    try { if (act && (await act(el)) === false) return; } finally { busy = false; }
    close();
  });
  el.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); const p = el.querySelector('[data-sheet-primary]'); if (p) p.click(); });
  document.body.appendChild(el); overlays.push(entry);
  if (onMount) onMount(el);
  requestAnimationFrame(() => el.classList.add('open'));
  return entry;
}
const fval = (el, name) => { const f = el.querySelector(`[name="${name}"]`); return f ? f.value.trim() : ''; };
function fieldErr(el, name, msg) {
  const f = el.querySelector(`[name="${name}"]`);
  if (f) { f.classList.add('invalid'); f.focus(); }
  const e = el.querySelector('.form-err'); if (e) { e.textContent = msg; e.hidden = false; }
  return false;
}
const field = (label, name, value, opts = {}) => `<label class="field"><span>${esc(label)}</span>${opts.multi
  ? `<textarea name="${name}" rows="${opts.rows || 3}" placeholder="${esc(opts.ph || '')}">${esc(value)}</textarea>`
  : `<input name="${name}" type="${opts.type || 'text'}" value="${esc(value)}" placeholder="${esc(opts.ph || '')}"${opts.mode ? ` inputmode="${opts.mode}"` : ''} autocomplete="off">`}${opts.hint ? `<small>${esc(opts.hint)}</small>` : ''}</label>`;
const seg = (name, options, value) => `<div class="seg" data-seg="${name}">${options.map(([v, l]) => `<button type="button" class="${v === value ? 'on' : ''}" data-v="${v}">${esc(l)}</button>`).join('')}<input type="hidden" name="${name}" value="${esc(value)}"></div>`;
function wireSeg(root) {
  $$('.seg', root).forEach((s) => s.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-v]'); if (!b) return;
    $$('button', s).forEach((x) => x.classList.toggle('on', x === b));
    s.querySelector('input').value = b.dataset.v;
    s.dispatchEvent(new CustomEvent('segchange', { detail: b.dataset.v, bubbles: true }));
  }));
}

/* ---------- forms ---------- */
function kidSheet(kid) {
  const k = kid || { name: '', age: '', birthday: '', bedtimeWeekday: '19:30', bedtimeWeekend: '', comfort: '', calming: '' };
  openSheet({
    title: kid ? 'Edit ' + kid.name : 'Add a kid', primary: kid ? 'Save' : 'Add kid', danger: kid ? 'Delete' : null,
    body: `<p class="form-err" hidden></p>${field('Name', 'name', k.name, { ph: 'Ava' })}
      <div class="row2">${field('Age', 'age', k.age, { ph: '4', hint: 'or set a birthday' })}${field('Birthday (optional)', 'birthday', k.birthday, { type: 'date' })}</div>
      <div class="row2">${field('School-night bedtime', 'bedtimeWeekday', k.bedtimeWeekday, { type: 'time' })}${field('Fri & Sat bedtime', 'bedtimeWeekend', k.bedtimeWeekend, { type: 'time', hint: 'blank = +30 min' })}</div>
      ${field('Comfort items', 'comfort', k.comfort, { ph: 'Bunny named Hops, yellow blanket' })}
      ${field('What calms them', 'calming', k.calming, { multi: true, rows: 2, ph: 'Back rub, rain sounds, a song…' })}`,
    onPrimary: (el) => {
      const name = fval(el, 'name');
      if (!name) return fieldErr(el, 'name', 'Every kid needs a name.');
      const wd = fval(el, 'bedtimeWeekday') || '19:30';
      const we = fval(el, 'bedtimeWeekend') || toHHMM(toMin(wd) + 30);
      const now = nowISO();
      const vals = { name, age: fval(el, 'age'), birthday: fval(el, 'birthday'), bedtimeWeekday: wd, bedtimeWeekend: we, comfort: fval(el, 'comfort'), calming: fval(el, 'calming') };
      if (kid) {
        ['bedtimeWeekday', 'bedtimeWeekend', 'comfort', 'calming'].forEach((f) => { if ((kid[f] || '') !== vals[f]) kid.fieldsAt[f] = now; });
        Object.assign(kid, vals, { updatedAt: now });
        toast('Saved');
      } else {
        const used = S.kids.map((x) => x.color);
        const color = [0, 4, 1, 2, 3, 5].find((c) => !used.includes(c)) ?? S.kids.length % 6;
        const nk = Object.assign({ id: uid(), allergies: [], meds: [], routine: [], fieldsAt: {}, color, createdAt: now, updatedAt: now }, vals);
        S.kids.push(nk);
        if (S.draft && !S.draft.savedId) S.draft.kidIds.push(nk.id);
        toast(name + ' added');
      }
      S.onboarded = true; save(); render();
    },
    onDanger: async () => {
      if (!(await confirmDialog({ title: `Delete ${kid.name}?`, body: 'Their allergies, meds and routine will be removed. Past handoffs stay in History.', ok: 'Delete', danger: true }))) return false;
      S.kids = S.kids.filter((x) => x !== kid);
      logRemoval(`${kid.name}'s profile was removed`);
      if (S.draft) S.draft.kidIds = S.draft.kidIds.filter((id) => id !== kid.id);
      save(); if (cur().view === 'kid') nav.stack.pop(); render(true);
    },
  });
}
function allergySheet(kid, a) {
  const it = a || { text: '', severity: 'severe' };
  openSheet({
    title: a ? 'Edit allergy' : `New allergy for ${kid.name}`, primary: 'Save', danger: a ? 'Remove' : null,
    body: `<p class="form-err" hidden></p>${field('Allergic to', 'text', it.text, { ph: 'Peanuts, cashews, penicillin, bee stings…' })}
      <div class="field"><span>Severity</span>${seg('severity', [['mild', 'Mild'], ['severe', 'Severe ⚠']], it.severity)}</div>
      <p class="muted small">Severe allergies always appear first in every briefing, in capitals.</p>`,
    onMount: wireSeg,
    onPrimary: (el) => {
      const text = fval(el, 'text'); if (!text) return fieldErr(el, 'text', 'What are they allergic to?');
      const sev = fval(el, 'severity'); const now = nowISO();
      if (a) { if (a.text !== text || a.severity !== sev) { a.text = text; a.severity = sev; a.updatedAt = now; } }
      else kid.allergies.push({ id: uid(), text, severity: sev, createdAt: now, updatedAt: now });
      save(); render(); toast('Allergy saved');
    },
    onDanger: () => { kid.allergies = kid.allergies.filter((x) => x !== a); logRemoval(`${kid.name}: no longer allergic to ${a.text.toLowerCase()}`); save(); render(); },
  });
}
function medSheet(kid, m) {
  const it = m || { name: '', doseNote: '', when: '' };
  openSheet({
    title: m ? 'Edit medication' : `New medication for ${kid.name}`, primary: 'Save', danger: m ? 'Remove' : null,
    body: `<p class="form-err" hidden></p>${field('Medication', 'name', it.name, { ph: 'Children’s Tylenol' })}
      ${field('Dose & notes', 'doseNote', it.doseNote, { multi: true, rows: 2, ph: '5 ml, max every 6 hours' })}
      ${field('When', 'when', it.when, { ph: 'Only if fever over 101°F' })}`,
    onPrimary: (el) => {
      const name = fval(el, 'name'); if (!name) return fieldErr(el, 'name', 'Name the medication.');
      const v = { name, doseNote: fval(el, 'doseNote'), when: fval(el, 'when') }; const now = nowISO();
      if (m) { if (m.name !== v.name || m.doseNote !== v.doseNote || m.when !== v.when) Object.assign(m, v, { updatedAt: now }); }
      else kid.meds.push(Object.assign({ id: uid(), createdAt: now, updatedAt: now }, v));
      save(); render(); toast('Medication saved');
    },
    onDanger: () => { kid.meds = kid.meds.filter((x) => x !== m); logRemoval(`${kid.name}: stopped ${m.name}`); save(); render(); },
  });
}
function stepSheet(kid, st) {
  const it = st || { label: '', offsetMin: -30 };
  openSheet({
    title: st ? 'Edit step' : 'New routine step', primary: 'Save', danger: st ? 'Remove step' : null,
    body: `<p class="form-err" hidden></p>${field('What happens', 'label', it.label, { ph: 'Bath, two books, lights out…' })}
      <div class="field"><span>When, relative to bedtime</span>
        <div class="stepper big"><button type="button" data-d="-5" aria-label="5 minutes earlier">−</button><output id="off-out">${fmtOffset(it.offsetMin)}</output><button type="button" data-d="5" aria-label="5 minutes later">+</button></div>
        <input type="hidden" name="offsetMin" value="${it.offsetMin}"><small id="off-hint">On a school night that’s ${fmtTime(toMin(kid.bedtimeWeekday) + it.offsetMin)}</small></div>`,
    onMount: (el) => el.querySelector('.stepper').addEventListener('click', (e) => {
      const b = e.target.closest('[data-d]'); if (!b) return;
      const inp = el.querySelector('[name=offsetMin]'); const v = Math.max(-300, Math.min(300, (+inp.value) + (+b.dataset.d)));
      inp.value = v; el.querySelector('#off-out').textContent = fmtOffset(v);
      el.querySelector('#off-hint').textContent = `On a school night that’s ${fmtTime(toMin(kid.bedtimeWeekday) + v)}`;
    }),
    onPrimary: (el) => {
      const label = fval(el, 'label'); if (!label) return fieldErr(el, 'label', 'Give the step a name.');
      const off = +fval(el, 'offsetMin');
      if (st) Object.assign(st, { label, offsetMin: off }); else kid.routine.push({ id: uid(), label, offsetMin: off });
      kid.routine.sort((a, b) => a.offsetMin - b.offsetMin);
      kid.fieldsAt.routine = nowISO(); save(); render();
    },
    onDanger: () => { kid.routine = kid.routine.filter((x) => x !== st); kid.fieldsAt.routine = nowISO(); save(); render(); },
  });
}
function contactSheet(c) {
  const it = c || { name: '', role: '', phone: '' };
  openSheet({
    title: c ? 'Edit contact' : 'New emergency contact', primary: 'Save', danger: c ? 'Delete' : null,
    body: `<p class="form-err" hidden></p>${field('Name', 'name', it.name, { ph: 'Grandma Rose' })}${field('Role', 'role', it.role, { ph: 'Mom, neighbor, pediatrician…' })}${field('Phone', 'phone', it.phone, { type: 'tel', ph: '(555) 201-3344' })}`,
    onPrimary: (el) => {
      const name = fval(el, 'name'); if (!name) return fieldErr(el, 'name', 'Who is this?');
      const v = { name, role: fval(el, 'role'), phone: fval(el, 'phone') }; const now = nowISO();
      if (c) { if (c.name !== v.name || c.role !== v.role || c.phone !== v.phone) Object.assign(c, v, { updatedAt: now }); }
      else S.contacts.push(Object.assign({ id: uid(), createdAt: now, updatedAt: now }, v));
      save(); render(); toast('Contact saved');
    },
    onDanger: () => { S.contacts = S.contacts.filter((x) => x !== c); logRemoval(`Contact removed: ${c.name}`); save(); render(); },
  });
}
function houseSheet(key) {
  const hf = HOUSE_FIELDS.find((f) => f.key === key); const cur = S.house.fields[key] || { value: '' };
  openSheet({
    title: hf.label, primary: 'Save',
    body: field(hf.label, 'value', cur.value, { multi: hf.multi, ph: hf.ph }) + (key === 'urgentCare' ? '<p class="muted small">Include hours and how to get there — new sitters may not know the area.</p>' : ''),
    onPrimary: (el) => {
      const v = fval(el, 'value');
      if (v !== (cur.value || '')) { S.house.fields[key] = { value: v, updatedAt: nowISO() }; save(); render(); toast('Saved'); }
    },
  });
}
function ruleSheet(r) {
  openSheet({
    title: r ? 'Edit rule' : 'New house rule', primary: 'Save', danger: r ? 'Delete' : null,
    body: `<p class="form-err" hidden></p>${field('Rule', 'text', r ? r.text : '', { multi: true, rows: 2, ph: 'Screen time: 30 min max…' })}
      <div class="chips">${['Screen time: ', 'Snacks: ', 'Off-limits: ', 'Bedtime: no screens after dinner'].map((s) => `<button type="button" class="chip" data-fill="${esc(s)}">${esc(s.trim())}</button>`).join('')}</div>`,
    onMount: (el) => el.querySelector('.chips').addEventListener('click', (e) => { const b = e.target.closest('[data-fill]'); if (!b) return; const t = el.querySelector('[name=text]'); t.value = b.dataset.fill; t.focus(); }),
    onPrimary: (el) => {
      const text = fval(el, 'text'); if (!text) return fieldErr(el, 'text', 'Write the rule.');
      const now = nowISO();
      if (r) { if (r.text !== text) Object.assign(r, { text, updatedAt: now }); } else S.rules.push({ id: uid(), text, createdAt: now, updatedAt: now });
      save(); render(); toast('Rule saved');
    },
    onDanger: () => { S.rules = S.rules.filter((x) => x !== r); logRemoval(`Rule dropped: ${r.text}`); save(); render(); },
  });
}
function caregiverSheet(c, onDone) {
  const it = c || { name: '', role: '', phone: '', level: 'new' };
  openSheet({
    title: c ? 'Edit caregiver' : 'New caregiver', primary: 'Save', danger: c ? 'Delete' : null,
    body: `<p class="form-err" hidden></p>${field('Name', 'name', it.name, { ph: 'Maya' })}
      <div class="row2">${field('Who they are', 'role', it.role, { ph: 'sitter, grandma…' })}${field('Phone', 'phone', it.phone, { type: 'tel', ph: 'optional' })}</div>
      <div class="field"><span>Briefing detail</span>${seg('level', Object.entries(LEVELS).map(([k, v]) => [k, v.label]), it.level)}<small id="lvl-desc">${esc(LEVELS[it.level].desc)}</small></div>`,
    onMount: (el) => { wireSeg(el); el.addEventListener('segchange', (e) => { el.querySelector('#lvl-desc').textContent = LEVELS[e.detail].desc; }); },
    onPrimary: (el) => {
      const name = fval(el, 'name'); if (!name) return fieldErr(el, 'name', 'What’s their name?');
      const v = { name, role: fval(el, 'role'), phone: fval(el, 'phone'), level: fval(el, 'level') };
      let target = c;
      if (c) Object.assign(c, v); else { target = Object.assign({ id: uid(), visits: 0, lastBriefedAt: null }, v); S.caregivers.push(target); }
      save(); if (onDone) onDone(target); render(); toast('Caregiver saved');
    },
    onDanger: async () => {
      if (!(await confirmDialog({ title: `Delete ${c.name}?`, body: 'Their past handoffs stay in History.', ok: 'Delete', danger: true }))) return false;
      S.caregivers = S.caregivers.filter((x) => x !== c);
      if (S.draft && S.draft.caregiverId === c.id) S.draft.caregiverId = null;
      save(); if (cur().view === 'caregiver') nav.stack.pop(); render(true);
    },
  });
}
function afterNoteSheet(h) {
  openSheet({
    title: 'How did it go?', primary: 'Save note',
    body: `${field('After-note', 'note', h.afterNote || '', { multi: true, rows: 3, ph: 'Went down easy, skipped bath…' })}
      <div class="chips">${['Went down easy', 'Skipped bath', 'Woke up once', 'Ate a great dinner', 'Took a while to settle', 'Would book again'].map((s) => `<button type="button" class="chip" data-add="${esc(s)}">${esc(s)}</button>`).join('')}</div>`,
    onMount: (el) => el.querySelector('.chips').addEventListener('click', (e) => {
      const b = e.target.closest('[data-add]'); if (!b) return; const t = el.querySelector('[name=note]');
      t.value = t.value.trim() ? t.value.trim().replace(/\.?$/, '. ') + b.dataset.add + '.' : b.dataset.add + '.';
    }),
    onPrimary: (el) => { h.afterNote = fval(el, 'note'); save(); render(); toast('Note saved'); },
  });
}
function extraSheet() {
  openSheet({
    title: 'Add a note for tonight', primary: 'Add',
    body: `<p class="form-err" hidden></p>${field('Note', 'text', '', { ph: 'Leo has a loose tooth — gentle brushing' })}
      <label class="check"><input type="checkbox" name="keep" checked><span>Save to my quick notes for next time</span></label>`,
    onPrimary: (el) => {
      const text = fval(el, 'text'); if (!text) return fieldErr(el, 'text', 'Type a note first.');
      if (el.querySelector('[name=keep]').checked && !S.extrasLib.includes(text)) S.extrasLib.push(text);
      if (!S.draft.extras.includes(text)) S.draft.extras.push(text);
      save(); render();
    },
  });
}

/* ---------- screen pieces ---------- */
function header(title, opts = {}) {
  return `<header class="top${opts.big ? ' big' : ''}">${opts.back ? `<button class="icon-btn" data-act="back" aria-label="Back">${icon('back')}</button>` : ''}
    <div class="top-title">${opts.kicker ? `<div class="kicker">${esc(opts.kicker)}</div>` : ''}<h1>${esc(title)}</h1></div>
    ${opts.right || ''}</header>`;
}
function reviewChip(path, ts) {
  const t = lastReviewed(path, ts); const stale = isStale(t);
  return `<span class="chip-rv${stale ? ' stale' : ''}">${stale ? icon('warn') : icon('check')}${t ? 'Reviewed ' + agoText(t) : 'Not reviewed'}</span>`;
}
const empty = (emoji, title, text, btn) => `<div class="empty"><div class="empty-art">${emoji}</div><h3>${esc(title)}</h3><p>${esc(text)}</p>${btn || ''}</div>`;
function handoffCard(h, opts = {}) {
  const cg = cgById(h.caregiverId); const kids = h.kidIds.map(kidById).filter(Boolean);
  return `<article class="card handoff">
    <div class="ho-top"><div class="ho-date"><b>${esc(fmtDayShort(h.date))}</b><span>${esc(fmtHHMM(h.leaveAt))} – ${esc(fmtHHMM(h.backBy))}</span></div>
      <div class="avs">${kids.map((k) => avatar(k, 'sm')).join('')}</div></div>
    <div class="ho-who">${esc(cg ? cg.name : 'Former caregiver')}${cg && cg.role ? ` <span class="muted">· ${esc(cg.role)}</span>` : ''} · ${esc(joinNames(kids.map((k) => k.name)) || 'no kids')}</div>
    ${h.extras.length || h.notes ? `<div class="ho-extras">${esc([...h.extras, h.notes].filter(Boolean).join(' · '))}</div>` : ''}
    ${h.afterNote ? `<div class="after">${icon('note')}<span>${esc(h.afterNote)}</span></div>` : ''}
    <div class="ho-actions${opts.noMore ? '' : ' three'}">
      <button class="btn soft sm" data-act="reuse" data-id="${h.id}">${icon('repeat')}${opts.reuseLabel || 'Reuse this night'}</button>
      <button class="btn ghost sm" data-act="afternote" data-id="${h.id}">${h.afterNote ? 'Edit note' : 'Add note'}</button>
      ${opts.noMore ? '' : `<button class="btn ghost sm" data-act="viewbrief" data-id="${h.id}" aria-label="View briefing">Briefing</button>`}
    </div></article>`;
}

/* ---------- screens ---------- */
const screens = {};

screens.home = () => {
  const hr = new Date().getHours();
  const greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
  const gear = `<button class="icon-btn" data-act="settings" aria-label="Settings">${icon('gear')}</button>`;
  if (!S.kids.length) {
    return header('Handoff', { big: true, kicker: greet, right: gear }) + `<main class="pad">
      <section class="card welcome">
        <div class="welcome-art">${icon('moon', 'ic-xl')}</div>
        <h2>Write it once.<br>Hand off in 30 seconds.</h2>
        <p>Save your kids’ routines, allergies and house info one time. Every date night, Handoff turns it into a timed plan for whoever’s watching them — sent as plain text, no app needed on their side.</p>
        <button class="btn primary block lg" data-act="addkid" id="add-first-kid">${icon('plus')}Add your first kid</button>
        <button class="btn ghost block" data-act="sample">Explore with a sample family</button>
      </section>
      <ol class="how">
        <li><b>1</b><span>Add kids, their bedtime routine and allergies</span></li>
        <li><b>2</b><span>Add house info, contacts and rules</span></li>
        <li><b>3</b><span>Tap “Plan tonight” and share the briefing</span></li>
      </ol></main>`;
  }
  const d = S.draft; const draftOpen = d && !d.savedId;
  const month = todayStr().slice(0, 7); // local date, matches h.date
  const thisMonth = S.handoffs.filter((h) => (h.date || '').slice(0, 7) === month).length;
  const regulars = S.caregivers.filter((c) => c.visits >= 2).length;
  const stale = staleItems();
  const last = S.handoffs[0];
  const setupTodo = [];
  if (!S.contacts.length) setupTodo.push(['contacts', 'Add emergency contacts', 'house']);
  if (!Object.values(S.house.fields).some((f) => f.value)) setupTodo.push(['house', 'Add address & Wi-Fi', 'house']);
  if (!S.kids.some((k) => k.routine.length)) setupTodo.push(['routine', 'Build a bedtime routine', 'kids']);
  return header('Handoff', { big: true, kicker: greet, right: gear }) + `<main class="pad">
    <button class="plan" data-act="plan" id="plan-tonight">
      <span class="plan-moon">${icon('moon', 'ic-lg')}</span>
      <span class="plan-txt"><b>${draftOpen ? 'Continue tonight’s plan' : 'Plan tonight'}</b><small>${draftOpen ? esc((cgById(d.caregiverId) || {}).name || 'Pick a caregiver') + ' · out ' + esc(fmtHHMM(d.leaveAt)) : 'Timed briefing for your sitter in 30 seconds'}</small></span>
      <span class="plan-go">${icon('chev')}</span></button>
    <div class="stats">
      <div class="stat"><b>${thisMonth}</b><span>handoff${thisMonth === 1 ? '' : 's'} this month</span></div>
      <div class="stat"><b>${regulars}</b><span>regular caregiver${regulars === 1 ? '' : 's'}</span></div>
      <div class="stat"><b>${S.kids.length}</b><span>kid${S.kids.length === 1 ? '' : 's'}</span></div>
    </div>
    ${setupTodo.length ? `<section class="card setup"><h3 class="sec-title">Finish setting up</h3>${setupTodo.map(([, t, tab]) => `<button class="row-btn" data-act="tab" data-tab="${tab}"><span class="dot"></span>${esc(t)}${icon('chev')}</button>`).join('')}</section>` : ''}
    <h3 class="sec-title">Worth a quick check</h3>
    ${stale.length ? `<section class="stale-list">${stale.slice(0, 4).map((s) => `<div class="card stale" data-path="${esc(s.path)}">
        <div class="stale-ic">${icon('warn')}</div>
        <div class="stale-body"><p><b>${esc(s.label)}</b> last reviewed ${esc(agoText(s.ts))}. Still right?</p>
        <div class="stale-actions"><button class="btn sage sm" data-act="reviewed" data-path="${esc(s.path)}">${icon('check')}Still accurate</button><button class="btn ghost sm" data-act="editstale" data-path="${esc(s.path)}">Edit</button></div></div></div>`).join('')}
        ${stale.length > 4 ? `<p class="muted small center">+${stale.length - 4} more to review</p>` : ''}</section>`
    : `<div class="card allgood">${icon('check')}<div><b>Everything’s up to date</b><span>Nothing older than ${S.settings.staleMonths} months.</span></div></div>`}
    <h3 class="sec-title">Last handoff</h3>
    ${last ? handoffCard(last, { reuseLabel: 'Same as last time', noMore: true }) : `<div class="card quiet"><p>No handoffs yet. Your first briefing will show up here with a quick “how did it go?” note.</p></div>`}
  </main>`;
};

screens.kids = () => header('Kids', { right: `<button class="icon-btn accent" data-act="addkid" aria-label="Add kid">${icon('plus')}</button>` }) + `<main class="pad">
  ${S.kids.length ? S.kids.map((k) => {
    const age = kidAge(k); const severe = k.allergies.filter((a) => a.severity === 'severe');
    return `<button class="card kid-card" data-act="kid" data-id="${k.id}">${avatar(k, 'lg')}
      <span class="kid-main"><b>${esc(k.name)}${age ? `<span class="muted"> · ${esc(age)}</span>` : ''}</b>
      <small>Bed ${esc(fmtHHMM(k.bedtimeWeekday))} · weekends ${esc(fmtHHMM(k.bedtimeWeekend))} · ${k.routine.length} step${k.routine.length === 1 ? '' : 's'}</small>
      <span class="badges">${severe.map((a) => `<span class="badge severe">${icon('warn')}${esc(a.text)}</span>`).join('')}${k.allergies.filter((a) => a.severity !== 'severe').map((a) => `<span class="badge mild">${esc(a.text)}</span>`).join('')}${k.meds.map((m) => `<span class="badge med">💊 ${esc(m.name)}</span>`).join('')}</span></span>${icon('chev', 'chev')}</button>`;
  }).join('') : empty('🧸', 'No kids yet', 'Add each kid once — their bedtime, routine, allergies and what calms them.', `<button class="btn primary" data-act="addkid">${icon('plus')}Add a kid</button>`)}
  </main>`;

screens.kid = ({ id }) => {
  const k = kidById(id); if (!k) { nav.stack.pop(); return screens[cur().view](cur()); }
  const bt = toMin(k.bedtimeWeekday);
  const presets = [['Dinner', -90], ['Bath', -45], ['PJs & teeth', -30], ['Two books', -15], ['Lights out', 0], ['Check on them', 30]].filter(([l]) => !k.routine.some((r) => r.label.toLowerCase() === l.toLowerCase()));
  return header(k.name, { back: true, kicker: kidAge(k) ? 'Age ' + kidAge(k) : 'Kid profile', right: `<button class="icon-btn" data-act="editkid" data-id="${k.id}" aria-label="Edit">${icon('edit')}</button>` }) + `<main class="pad">
    <section class="card kid-hero">${avatar(k, 'xl')}<div><div class="bt-row"><span>School nights</span><b>${esc(fmtHHMM(k.bedtimeWeekday))}</b></div><div class="bt-row"><span>Fri & Sat</span><b>${esc(fmtHHMM(k.bedtimeWeekend))}</b></div></div></section>

    <div class="sec-head"><h3 class="sec-title">Allergies</h3><button class="link" data-act="addallergy" data-id="${k.id}">${icon('plus')}Add</button></div>
    <section class="card list">${k.allergies.length ? k.allergies.map((a) => `<button class="li" data-act="editallergy" data-id="${k.id}" data-sub="${a.id}">
      <span class="badge ${a.severity}">${a.severity === 'severe' ? icon('warn') + 'Severe' : 'Mild'}</span><span class="li-main">${esc(a.text)}</span>${reviewChip('allergy:' + a.id, a.updatedAt)}</button>`).join('') : '<p class="li-empty">No known allergies.</p>'}</section>

    <div class="sec-head"><h3 class="sec-title">Medications</h3><button class="link" data-act="addmed" data-id="${k.id}">${icon('plus')}Add</button></div>
    <section class="card list">${k.meds.length ? k.meds.map((m) => `<button class="li col" data-act="editmed" data-id="${k.id}" data-sub="${m.id}">
      <span class="li-main"><b>💊 ${esc(m.name)}</b>${m.doseNote ? `<small>${esc(m.doseNote)}</small>` : ''}${m.when ? `<small class="muted">${esc(m.when)}</small>` : ''}</span>${reviewChip('med:' + m.id, m.updatedAt)}</button>`).join('') : '<p class="li-empty">No medications.</p>'}</section>

    <div class="sec-head"><h3 class="sec-title">Bedtime routine</h3><button class="link" data-act="addstep" data-id="${k.id}">${icon('plus')}Add step</button></div>
    <p class="muted small">Steps are relative to bedtime, so a later bedtime shifts everything automatically. Times shown for a school night.</p>
    <section class="card list routine">${k.routine.length ? k.routine.map((s, i) => `<div class="step-row" data-step="${s.id}">
        <div class="reorder"><button class="mini" data-act="stepup" data-id="${k.id}" data-sub="${s.id}" ${i === 0 ? 'disabled' : ''} aria-label="Move up">${icon('up')}</button><button class="mini" data-act="stepdown" data-id="${k.id}" data-sub="${s.id}" ${i === k.routine.length - 1 ? 'disabled' : ''} aria-label="Move down">${icon('down')}</button></div>
        <button class="step-label" data-act="editstep" data-id="${k.id}" data-sub="${s.id}"><b>${esc(s.label)}</b><small>${esc(fmtTime(bt + s.offsetMin))}</small></button>
        <div class="stepper"><button data-act="stepoff" data-d="-5" data-id="${k.id}" data-sub="${s.id}" aria-label="5 min earlier">−</button><output>${esc(fmtOffset(s.offsetMin).replace('at bedtime', '0'))}</output><button data-act="stepoff" data-d="5" data-id="${k.id}" data-sub="${s.id}" aria-label="5 min later">+</button></div>
      </div>`).join('') : '<p class="li-empty">No steps yet — tonight’s plan will just show “Bedtime”. Tap a suggestion:</p>'}</section>
    ${presets.length ? `<div class="chips">${presets.map(([l, o]) => `<button class="chip" data-act="preset" data-id="${k.id}" data-label="${esc(l)}" data-off="${o}">${icon('plus')}${esc(l)} <span class="muted">${esc(fmtOffset(o).replace('at bedtime', '0'))}</span></button>`).join('')}</div>` : ''}

    <h3 class="sec-title">Comfort & calming</h3>
    <section class="card list"><button class="li col" data-act="editkid" data-id="${k.id}"><span class="li-main"><small class="muted">Comfort items</small><b>${esc(k.comfort || 'Add a favorite toy or blanket')}</b></span></button>
      <button class="li col" data-act="editkid" data-id="${k.id}"><span class="li-main"><small class="muted">What calms them</small><b>${esc(k.calming || 'Add what works when they’re upset')}</b></span></button></section>
  </main>`;
};

screens.house = () => {
  const f = S.house.fields;
  return header('House & contacts') + `<main class="pad">
    <div class="sec-head"><h3 class="sec-title">Emergency contacts</h3><button class="link" data-act="addcontact" id="add-contact">${icon('plus')}Add</button></div>
    <p class="muted small">Sitters see them in this order. Tap a number to copy it.</p>
    <section class="card list">${S.contacts.length ? S.contacts.map((c, i) => `<div class="li contact">
      <div class="reorder"><button class="mini" data-act="cup" data-id="${c.id}" ${i === 0 ? 'disabled' : ''} aria-label="Move up">${icon('up')}</button><button class="mini" data-act="cdown" data-id="${c.id}" ${i === S.contacts.length - 1 ? 'disabled' : ''} aria-label="Move down">${icon('down')}</button></div>
      <button class="li-main plain" data-act="editcontact" data-id="${c.id}"><b>${esc(c.name)}</b><small class="muted">${esc(c.role || 'contact')}</small>${reviewChip('contact:' + c.id, c.updatedAt)}</button>
      ${c.phone ? `<button class="phone" data-act="copyphone" data-v="${esc(c.phone)}">${icon('copy')}${esc(c.phone)}</button>` : ''}</div>`).join('') : '<p class="li-empty">Add parents, a nearby relative, and your pediatrician.</p>'}</section>

    <h3 class="sec-title">House info</h3>
    <section class="card list">${HOUSE_FIELDS.map((hf) => { const v = f[hf.key]; return `<button class="li col" data-act="edithouse" data-id="${hf.key}">
      <span class="li-main"><small class="muted">${esc(hf.label)}</small><b class="${v && v.value ? '' : 'placeholder'}">${esc(v && v.value ? v.value : 'Tap to add')}</b></span>${v && v.value ? reviewChip('house:' + hf.key, v.updatedAt) : ''}</button>`; }).join('')}</section>

    <div class="sec-head"><h3 class="sec-title">House rules</h3><button class="link" data-act="addrule">${icon('plus')}Add</button></div>
    <section class="card list">${S.rules.length ? S.rules.map((r) => `<button class="li col" data-act="editrule" data-id="${r.id}"><span class="li-main"><b>${esc(r.text)}</b></span>${reviewChip('rule:' + r.id, r.updatedAt)}</button>`).join('') : '<p class="li-empty">Screen time, snacks, off-limits rooms…</p>'}</section>
  </main>`;
};

screens.people = () => header('Caregivers', { right: `<button class="icon-btn accent" data-act="addcg" aria-label="Add caregiver">${icon('plus')}</button>` }) + `<main class="pad">
  ${S.caregivers.length ? S.caregivers.map((c) => `<button class="card cg-card" data-act="caregiver" data-id="${c.id}">
    <span class="av av-lg cg">${esc(initials(c.name))}</span>
    <span class="kid-main"><b>${esc(c.name)}${c.role ? `<span class="muted"> · ${esc(c.role)}</span>` : ''}</b>
    <small>${c.visits} visit${c.visits === 1 ? '' : 's'} · last ${c.lastBriefedAt ? esc(agoText(c.lastBriefedAt)) : 'never'}</small>
    <span class="badges"><span class="badge lvl-${c.level}">${esc(LEVELS[c.level].label)}</span></span></span>${icon('chev', 'chev')}</button>`).join('')
    : empty('🤝', 'Who watches your kids?', 'Save sitters, grandparents and friends once. Each gets the right amount of detail.', `<button class="btn primary" data-act="addcg">${icon('plus')}Add a caregiver</button>`)}
  <section class="card quiet levels"><h3 class="sec-title">Briefing detail levels</h3>${Object.values(LEVELS).map((l) => `<p><b>${esc(l.label)}</b> — ${esc(l.desc)}</p>`).join('')}</section>
  </main>`;

screens.caregiver = ({ id }) => {
  const c = cgById(id); if (!c) { nav.stack.pop(); return screens[cur().view](cur()); }
  const hs = S.handoffs.filter((h) => h.caregiverId === id);
  return header(c.name, { back: true, kicker: c.role || 'Caregiver', right: `<button class="icon-btn" data-act="editcg" data-id="${c.id}" aria-label="Edit">${icon('edit')}</button>` }) + `<main class="pad">
    <div class="stats"><div class="stat"><b>${c.visits}</b><span>visits</span></div><div class="stat"><b class="sm">${c.lastBriefedAt ? esc(agoText(c.lastBriefedAt)) : '—'}</b><span>last briefing</span></div><div class="stat"><b class="sm">${esc(LEVELS[c.level].label)}</b><span>detail level</span></div></div>
    ${c.phone ? `<button class="card row-btn" data-act="copyphone" data-v="${esc(c.phone)}">${icon('phone')}${esc(c.phone)}<span class="muted small">tap to copy</span></button>` : ''}
    <button class="btn primary block lg" data-act="planwith" data-id="${c.id}">${icon('moon')}Plan a night with ${esc(c.name)}</button>
    <h3 class="sec-title">Handoff history</h3>
    ${hs.length ? hs.map((h) => handoffCard(h)).join('') : '<div class="card quiet"><p>No handoffs with ' + esc(c.name) + ' yet.</p></div>'}
  </main>`;
};

screens.history = () => header('History') + `<main class="pad">
  ${S.handoffs.length ? S.handoffs.map((h) => handoffCard(h)).join('') : empty('🌙', 'No nights logged yet', 'Every briefing you send is saved here, so you can reuse a night (“same as last Friday”) and jot down how it went.', `<button class="btn primary" data-act="plan">Plan tonight</button>`)}
  </main>`;

screens.builder = () => {
  if (!S.draft) S.draft = newDraft();
  const d = S.draft; const cg = cgById(d.caregiverId);
  const weekend = isWeekendNight(d.date);
  const tl = buildTimeline(d); const valid = timesValid(d);
  const kidsOn = S.kids.filter((k) => d.kidIds.includes(k.id));
  const libs = Array.from(new Set([...S.extrasLib, ...d.extras]));
  return header(d.date === todayStr() ? 'Tonight' : fmtDayShort(d.date), { back: true, kicker: 'Plan the handoff', right: `<button class="link" data-act="resetdraft">Start over</button>` }) + `<main class="pad builder">
    <section class="card step"><div class="step-n">1</div><div class="step-body"><h3>Who’s watching them?</h3>
      <div class="chips">${S.caregivers.map((c) => `<button class="chip lg${c.id === d.caregiverId ? ' on' : ''}" data-act="pickcg" data-id="${c.id}">${esc(c.name)}${c.role ? `<span class="muted"> · ${esc(c.role)}</span>` : ''}</button>`).join('')}<button class="chip lg dashed" data-act="addcg" data-pick="1" id="new-cg">${icon('plus')}New</button></div>
      ${cg ? `<div class="lvl-pick"><small class="muted">Detail for ${esc(cg.name)}</small>${seg('lvl', Object.entries(LEVELS).map(([k, v]) => [k, v.label]), cg.level)}</div>` : '<p class="muted small">Pick someone or add a new caregiver.</p>'}
    </div></section>

    <section class="card step"><div class="step-n">2</div><div class="step-body"><h3>Who’s home?</h3>
      <div class="kid-toggles">${S.kids.map((k) => `<button class="kid-tog${d.kidIds.includes(k.id) ? ' on' : ''}" data-act="togkid" data-id="${k.id}" aria-pressed="${d.kidIds.includes(k.id)}">${avatar(k)}<span>${esc(k.name)}</span><i>${icon('check')}</i></button>`).join('')}</div>
    </div></section>

    <section class="card step"><div class="step-n">3</div><div class="step-body"><h3>Times</h3>
      <div class="row2"><label class="field"><span>Date</span><input type="date" data-bind="date" value="${esc(d.date)}"></label><div class="night-tag ${weekend ? 'wkend' : ''}">${weekend ? 'Weekend bedtimes' : 'School-night bedtimes'}</div></div>
      <div class="row2"><label class="field"><span>You leave</span><input type="time" data-bind="leaveAt" id="leave-at" value="${esc(d.leaveAt)}"></label><label class="field"><span>Back by</span><input type="time" data-bind="backBy" id="back-by" value="${esc(d.backBy)}"></label></div>
      ${!valid ? `<p class="warn-msg" id="time-error">${icon('warn')}Back-by (${esc(fmtHHMM(d.backBy))}) is earlier than when you leave (${esc(fmtHHMM(d.leaveAt))}).</p>` : ''}
      ${toMin(d.backBy) <= toMin(d.leaveAt) || d.overnight ? `<label class="check"><input type="checkbox" data-bind="overnight" ${d.overnight ? 'checked' : ''}><span>We’re back after midnight</span></label>` : ''}
      ${kidsOn.length ? `<div class="bt-list"><small class="muted">Bedtimes tonight</small>${kidsOn.map((k) => { const def = defaultBedtime(k, d.date); const ov = d.bedtimeOverrides[k.id]; const b = kidBedtime(k, d); const diff = toMin(b) - toMin(def); return `<div class="bt-edit">${avatar(k, 'sm')}<span class="bt-name">${esc(k.name)}${ov && diff ? `<small class="shift">${diff > 0 ? '+' : '−'}${Math.abs(diff)} min</small>` : ''}</span>
        <button class="mini round" data-act="bt" data-id="${k.id}" data-d="-15" aria-label="15 min earlier">−</button><input type="time" class="bt-input" data-bt="${k.id}" value="${esc(b)}" aria-label="${esc(k.name)} bedtime"><button class="mini round" data-act="bt" data-id="${k.id}" data-d="15" aria-label="15 min later">+</button>
        ${ov ? `<button class="mini" data-act="btreset" data-id="${k.id}" aria-label="Reset bedtime" title="Reset">↺</button>` : '<span class="mini-sp"></span>'}</div>`; }).join('')}</div>` : ''}
    </div></section>

    <section class="card step"><div class="step-n">4</div><div class="step-body"><h3>Extras for tonight</h3>
      <div class="extras">${libs.map((e) => `<button class="xtra${d.extras.includes(e) ? ' on' : ''}" data-act="togextra" data-v="${esc(e)}"><i>${icon('check')}</i><span>${esc(e)}</span></button>`).join('')}<button class="xtra dashed" data-act="addextra"><i>${icon('plus')}</i><span>Add a note</span></button></div>
      <label class="field"><span>Anything else?</span><textarea data-bind="notes" id="notes" rows="2" placeholder="Ava has a small scrape on her knee — a bandage is fine.">${esc(d.notes)}</textarea></label>
    </div></section>

    <h3 class="sec-title">Tonight’s timeline</h3>
    <section class="card timeline" id="timeline">${renderTimeline(tl, kidsOn.length)}</section>
    <div class="spacer"></div>
  </main>
  <div class="actionbar"><button class="btn primary block lg" data-act="preview" id="preview-btn">Preview briefing${icon('chev')}</button></div>`;
};
function renderTimeline(tl, nKids) {
  if (!nKids) return '<p class="li-empty">Tick at least one kid to see the plan.</p>';
  return `<ol class="tl">${tl.map((it) => `<li class="tl-i ${it.kind}${it.before ? ' before' : ''}">
    <span class="pill">${esc(fmtTime(it.t))}</span><span class="tl-dot"></span>
    <span class="tl-label">${esc(it.label)}${it.kind === 'step' && nKids > 1 && it.kids.length === nKids ? ' <span class="muted">(both)</span>'.replace('both', nKids > 2 ? 'everyone' : 'both') : ''}${it.before ? '<small>before you leave</small>' : ''}</span>
    <span class="avs">${it.kids.map((k) => avatar(k, 'sm')).join('')}</span></li>`).join('')}</ol>`;
}

screens.preview = () => {
  const d = S.draft; if (!d) { nav.stack.pop(); return screens[cur().view](cur()); }
  const cg = cgById(d.caregiverId);
  const b = buildBriefing(d);
  return header('Briefing', { back: true, kicker: cg ? 'For ' + cg.name : 'Preview' }) + `<main class="pad">
    ${cg ? `<div class="lvl-pick">${seg('lvl', Object.entries(LEVELS).map(([k, v]) => [k, v.label]), cg.level)}</div>` : `<p class="warn-msg">${icon('warn')}No caregiver picked — the briefing says “our sitter”.</p>`}
    ${b.changes.length ? `<div class="banner new" id="changes-banner">${icon('sparkle')}<div><b>New since last time</b><span>${b.changes.length === 1 ? '1 change' : b.changes.length + ' changes'} since ${esc(cg.name)}’s last visit, listed right after allergies.</span></div></div>` : ''}
    ${d.savedId ? `<div class="banner ok">${icon('check')}<div><b>Sent & saved to History</b><span>Edits here update the same handoff.</span></div></div>` : ''}
    <div class="chips toggles"><span class="chip locked">${icon('warn')}Allergies & meds</span>${SECTIONS.filter((s) => s.key !== 'changes' || b.hasBase).map((s) => `<button class="chip${sectionOn(d, cg, s.key) ? ' on' : ''}" data-act="togsec" data-v="${s.key}">${esc(s.label)}</button>`).join('')}</div>
    <pre class="brief" id="brief-text">${esc(b.text)}</pre>
    <div class="spacer"></div></main>
  <div class="actionbar two"><button class="btn soft lg" data-act="copybrief" id="copy-btn">${icon('copy')}Copy</button><button class="btn primary lg grow" data-act="sharebrief" id="share-btn">${icon('share')}${d.savedId ? 'Share again' : 'Share briefing'}</button>${d.savedId ? `<button class="btn sage lg" data-act="done">Done</button>` : ''}</div>`;
};

screens.settings = () => {
  let json = '';
  try { const c = Object.assign({}, S); delete c.draft; json = JSON.stringify(c, null, 1); } catch (e) { json = ''; }
  return header('Settings', { back: true }) + `<main class="pad">
    <h3 class="sec-title">Preferences</h3>
    <section class="card form-card">
      <div class="field"><span>Flag info as stale after</span>${seg('stale', [['3', '3 months'], ['6', '6 months'], ['12', '12 months']], String(S.settings.staleMonths))}</div>
      <div class="field"><span>Clock</span>${seg('clock', [['12', '12-hour'], ['24', '24-hour']], S.settings.clock24 ? '24' : '12')}</div>
    </section>
    <h3 class="sec-title">Back up your data</h3>
    <section class="card form-card">
      <p class="muted small">Everything stays on this phone. Copy this JSON somewhere safe, or share it to yourself.</p>
      <textarea class="mono" id="export-json" rows="5" readonly>${esc(json)}</textarea>
      <div class="btn-row"><button class="btn soft" data-act="copyexport">${icon('copy')}Copy</button><button class="btn soft" data-act="shareexport">${icon('share')}Share</button></div>
    </section>
    <h3 class="sec-title">Restore</h3>
    <section class="card form-card">
      <p class="muted small">Paste a backup. This replaces everything currently in the app.</p>
      <textarea class="mono" id="import-json" rows="4" placeholder='{"kids": [ … ] }'></textarea>
      <p class="warn-msg" id="import-err" hidden></p>
      <button class="btn primary block" data-act="import" id="import-btn">Import backup</button>
    </section>
    <h3 class="sec-title">Danger zone</h3>
    <section class="card form-card">
      <button class="btn soft block" data-act="sample">Load the sample family</button>
      <button class="btn danger block" data-act="reset" id="reset-btn">Reset all data</button>
    </section>
    <p class="muted small center foot">Handoff · works fully offline · no accounts</p>
  </main>`;
};

/* ---------- render ---------- */
const TABS = [['home', 'Home', 'home'], ['kids', 'Kids', 'kids'], ['house', 'House', 'house'], ['people', 'People', 'people'], ['history', 'History', 'history']];
let lastView = '';
function render(navChange, dir) {
  const c = cur();
  const app = $('#app');
  const y = window.scrollY;
  app.innerHTML = screens[c.view](c);
  const sub = nav.stack.length > 0;
  $('#tabs').hidden = sub;
  document.body.classList.toggle('has-tabs', !sub);
  document.body.classList.toggle('has-action', !!$('.actionbar', app));
  $$('#tabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === nav.tab));
  wireSeg(app);
  const key = c.view + (c.id || '');
  if (navChange && key !== lastView) {
    window.scrollTo(0, 0);
    app.classList.remove('enter', 'enter-back'); void app.offsetWidth; app.classList.add(dir === 'back' ? 'enter-back' : 'enter');
  } else window.scrollTo(0, y);
  lastView = key;
}

/* ---------- actions ---------- */
function startPlan(prefill) {
  if (!S.kids.length) { toast('Add a kid first'); kidSheet(); return; }
  if (prefill) S.draft = prefill;
  else if (!S.draft || S.draft.savedId) S.draft = newDraft();
  save(); go('builder');
}
function moveIn(arr, id, d) { const i = arr.findIndex((x) => x.id === id); const j = i + d; if (i < 0 || j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; }
function logHandoff(text) {
  const d = S.draft; const cg = cgById(d.caregiverId);
  if (!d.savedId) {
    d.baseBriefedAt = cg ? cg.lastBriefedAt || null : null;
    const h = { id: uid(), date: d.date, createdAt: nowISO(), caregiverId: d.caregiverId, kidIds: d.kidIds.slice(), leaveAt: d.leaveAt, backBy: d.backBy, overnight: d.overnight, bedtimeOverrides: Object.assign({}, d.bedtimeOverrides), extras: d.extras.slice(), notes: d.notes, briefingText: text, afterNote: '' };
    S.handoffs.unshift(h); d.savedId = h.id;
    if (cg) { cg.visits = (cg.visits || 0) + 1; cg.lastBriefedAt = nowISO(); }
  } else {
    const h = S.handoffs.find((x) => x.id === d.savedId);
    if (h) Object.assign(h, { date: d.date, caregiverId: d.caregiverId, kidIds: d.kidIds.slice(), leaveAt: d.leaveAt, backBy: d.backBy, overnight: d.overnight, bedtimeOverrides: Object.assign({}, d.bedtimeOverrides), extras: d.extras.slice(), notes: d.notes, briefingText: text });
  }
  save();
}
function editByPath(path) {
  const it = reviewItems().find((i) => i.path === path); if (!it) return;
  const e = it.edit; const k = e.kid && kidById(e.kid);
  if (e.kind === 'allergy') allergySheet(k, k.allergies.find((a) => a.id === e.id));
  else if (e.kind === 'med') medSheet(k, k.meds.find((m) => m.id === e.id));
  else if (e.kind === 'kid') { nav.tab = 'kids'; nav.stack = [{ view: 'kid', id: k.id }]; render(true); }
  else if (e.kind === 'house') houseSheet(e.id);
  else if (e.kind === 'contact') contactSheet(S.contacts.find((c) => c.id === e.id));
  else if (e.kind === 'rule') ruleSheet(S.rules.find((r) => r.id === e.id));
}
function loadSample() {
  S = normalize(sampleData());
  S.handoffs.forEach((h) => { h.briefingText = buildBriefing(Object.assign({ hidden: {}, savedId: 'x', baseBriefedAt: null }, h)).text; });
  save(); nav.tab = 'home'; nav.stack = []; render(true); toast('Sample family loaded');
}

const A = {
  back: () => goBack(),
  tab: (ds) => setTab(ds.tab),
  settings: () => go('settings'),
  plan: () => startPlan(),
  sample: async () => {
    if (S.kids.length && !(await confirmDialog({ title: 'Replace with sample family?', body: 'This replaces all your current data with the sample family.', ok: 'Replace', danger: true }))) return;
    loadSample();
  },
  addkid: () => kidSheet(),
  kid: (ds) => go('kid', { id: ds.id }),
  editkid: (ds) => kidSheet(kidById(ds.id)),
  addallergy: (ds) => allergySheet(kidById(ds.id)),
  editallergy: (ds) => { const k = kidById(ds.id); allergySheet(k, k.allergies.find((a) => a.id === ds.sub)); },
  addmed: (ds) => medSheet(kidById(ds.id)),
  editmed: (ds) => { const k = kidById(ds.id); medSheet(k, k.meds.find((m) => m.id === ds.sub)); },
  addstep: (ds) => stepSheet(kidById(ds.id)),
  editstep: (ds) => { const k = kidById(ds.id); stepSheet(k, k.routine.find((s) => s.id === ds.sub)); },
  preset: (ds) => { const k = kidById(ds.id); k.routine.push({ id: uid(), label: ds.label, offsetMin: +ds.off }); k.routine.sort((a, b) => a.offsetMin - b.offsetMin); k.fieldsAt.routine = nowISO(); save(); render(); buzz(); },
  stepoff: (ds) => { const k = kidById(ds.id); const s = k.routine.find((x) => x.id === ds.sub); s.offsetMin = Math.max(-300, Math.min(300, s.offsetMin + (+ds.d))); k.fieldsAt.routine = nowISO(); save(); render(); },
  stepup: (ds) => { const k = kidById(ds.id); moveIn(k.routine, ds.sub, -1); k.fieldsAt.routine = nowISO(); save(); render(); },
  stepdown: (ds) => { const k = kidById(ds.id); moveIn(k.routine, ds.sub, 1); k.fieldsAt.routine = nowISO(); save(); render(); },
  addcontact: () => contactSheet(),
  editcontact: (ds) => contactSheet(S.contacts.find((c) => c.id === ds.id)),
  cup: (ds) => { moveIn(S.contacts, ds.id, -1); save(); render(); },
  cdown: (ds) => { moveIn(S.contacts, ds.id, 1); save(); render(); },
  copyphone: (ds) => { copyText(ds.v); buzz(); toast('Copied ' + ds.v); },
  edithouse: (ds) => houseSheet(ds.id),
  addrule: () => ruleSheet(),
  editrule: (ds) => ruleSheet(S.rules.find((r) => r.id === ds.id)),
  addcg: (ds) => caregiverSheet(null, ds.pick ? (c) => { S.draft.caregiverId = c.id; save(); } : null),
  editcg: (ds) => caregiverSheet(cgById(ds.id)),
  caregiver: (ds) => go('caregiver', { id: ds.id }),
  planwith: (ds) => { const d = (S.draft && !S.draft.savedId) ? S.draft : newDraft(); d.caregiverId = ds.id; startPlan(d); },
  reviewed: (ds, el) => {
    S.reviewedAt[ds.path] = nowISO(); save(); buzz();
    const card = el.closest('.stale');
    if (card) { card.classList.add('leaving'); setTimeout(render, 260); } else render();
    toast('Marked as still accurate');
  },
  editstale: (ds) => editByPath(ds.path),
  reuse: (ds) => {
    const h = S.handoffs.find((x) => x.id === ds.id); if (!h) return;
    const d = newDraft();
    Object.assign(d, { caregiverId: cgById(h.caregiverId) ? h.caregiverId : d.caregiverId, kidIds: h.kidIds.filter((id) => kidById(id)), leaveAt: h.leaveAt, backBy: h.backBy, overnight: !!h.overnight, bedtimeOverrides: Object.assign({}, h.bedtimeOverrides), extras: h.extras.slice(), notes: h.notes || '', date: todayStr() });
    nav.stack = []; startPlan(d); toast('Prefilled from ' + fmtDayShort(h.date));
  },
  afternote: (ds) => afterNoteSheet(S.handoffs.find((x) => x.id === ds.id)),
  viewbrief: (ds) => {
    const h = S.handoffs.find((x) => x.id === ds.id); if (!h) return;
    openSheet({ title: 'Briefing · ' + fmtDayShort(h.date), wide: true, body: `<pre class="brief">${esc(h.briefingText || 'No text saved for this night.')}</pre>`, primary: 'Copy text', onPrimary: () => { copyText(h.briefingText || ''); toast('Copied'); },
      danger: 'Delete night', onDanger: async () => { if (!(await confirmDialog({ title: 'Delete this night?', body: 'It will be removed from History.', ok: 'Delete', danger: true }))) return false; S.handoffs = S.handoffs.filter((x) => x !== h); save(); render(); } });
  },
  // builder
  resetdraft: async () => { if (await confirmDialog({ title: 'Start over?', body: 'Clears tonight’s choices. Your saved info isn’t touched.', ok: 'Start over' })) { S.draft = newDraft(); save(); render(); } },
  pickcg: (ds) => { S.draft.caregiverId = ds.id; save(); render(); },
  togkid: (ds) => { const d = S.draft; d.kidIds = d.kidIds.includes(ds.id) ? d.kidIds.filter((x) => x !== ds.id) : S.kids.filter((k) => k.id === ds.id || d.kidIds.includes(k.id)).map((k) => k.id); save(); render(); buzz(8); },
  bt: (ds) => { const d = S.draft; const k = kidById(ds.id); const nv = toHHMM(toMin(kidBedtime(k, d)) + (+ds.d)); if (nv === defaultBedtime(k, d.date)) delete d.bedtimeOverrides[k.id]; else d.bedtimeOverrides[k.id] = nv; save(); render(); },
  btreset: (ds) => { delete S.draft.bedtimeOverrides[ds.id]; save(); render(); },
  togextra: (ds) => { const d = S.draft; d.extras = d.extras.includes(ds.v) ? d.extras.filter((x) => x !== ds.v) : [...d.extras, ds.v]; save(); render(); },
  addextra: () => extraSheet(),
  preview: () => {
    const d = S.draft;
    if (!d.kidIds.length) { toast('Tick at least one kid'); return; }
    if (!timesValid(d)) { toast('Check your back-by time'); const e = $('#time-error'); if (e) e.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
    go('preview');
  },
  togsec: (ds) => { const d = S.draft; const cg = cgById(d.caregiverId); d.hidden = d.hidden || {}; d.hidden[ds.v] = sectionOn(d, cg, ds.v); save(); render(); },
  copybrief: () => { const t = buildBriefing(S.draft).text; copyText(t); logHandoff(t); buzz(); toast('Copied — paste it into any chat. Saved to History.'); render(); },
  sharebrief: () => { const t = buildBriefing(S.draft).text; const r = shareText(t); logHandoff(t); buzz(25); toast(r === 'shared' ? 'Saved to History' : 'Copied to clipboard · saved to History'); render(); },
  done: () => { S.draft = null; save(); nav.tab = 'history'; nav.stack = []; render(true); },
  // settings
  copyexport: () => { copyText($('#export-json').value); toast('Backup copied'); },
  shareexport: () => { const r = shareText($('#export-json').value); toast(r === 'shared' ? 'Choose where to save it' : 'Backup copied'); },
  import: async () => {
    const raw = $('#import-json').value.trim(); const err = $('#import-err');
    let data;
    try { data = JSON.parse(raw); if (!data || typeof data !== 'object' || !Array.isArray(data.kids)) throw new Error('missing kids'); }
    catch (e) { err.hidden = false; err.innerHTML = icon('warn') + 'That doesn’t look like a Handoff backup. Paste the whole JSON text.'; return; }
    if (!(await confirmDialog({ title: 'Replace everything?', body: `Import ${data.kids.length} kid(s), ${(data.caregivers || []).length} caregiver(s) and ${(data.handoffs || []).length} past night(s). Current data will be replaced.`, ok: 'Import' }))) return;
    S = normalize(data); S.onboarded = true; save(); nav.tab = 'home'; nav.stack = []; render(true); toast('Backup restored');
  },
  reset: async () => {
    if (!(await confirmDialog({ title: 'Reset all data?', body: 'Kids, routines, contacts, caregivers and history will be deleted from this phone. Export a backup first if you might want it.', ok: 'Delete everything', danger: true }))) return;
    S = emptyState(); save(); nav.tab = 'home'; nav.stack = []; render(true); toast('All data cleared');
  },
};

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-act]');
  if (t && !t.disabled && $('#app').contains(t) || (t && t.closest('#tabs'))) { e.preventDefault(); A[t.dataset.act] && A[t.dataset.act](t.dataset, t); }
});
document.addEventListener('segchange', (e) => {
  if (!$('#app').contains(e.target)) return;
  const name = e.target.dataset.seg, v = e.detail;
  if (name === 'lvl') { const cg = cgById(S.draft.caregiverId); if (cg) { cg.level = v; S.draft.hidden = {}; save(); render(); } }
  else if (name === 'stale') { S.settings.staleMonths = +v; save(); toast(`Flagging info older than ${v} months`); }
  else if (name === 'clock') { S.settings.clock24 = v === '24'; save(); render(); }
});
document.addEventListener('change', (e) => {
  const el = e.target; if (!$('#app').contains(el) || !S.draft) return;
  if (el.dataset.bind) {
    const k = el.dataset.bind;
    if (k === 'overnight') S.draft.overnight = el.checked;
    else if (k === 'notes') S.draft.notes = el.value;
    else if (el.value) S.draft[k] = el.value;
    if (k === 'date') S.draft.bedtimeOverrides = S.draft.bedtimeOverrides || {};
    if ((k === 'leaveAt' || k === 'backBy') && toMin(S.draft.backBy) > toMin(S.draft.leaveAt) && S.draft.backBy >= '05:00') S.draft.overnight = false;
    save(); if (k !== 'notes') render();
  } else if (el.dataset.bt) {
    const k = kidById(el.dataset.bt); if (!k || !el.value) return;
    if (el.value === defaultBedtime(k, S.draft.date)) delete S.draft.bedtimeOverrides[k.id]; else S.draft.bedtimeOverrides[k.id] = el.value;
    save(); render();
  }
});
document.addEventListener('input', (e) => {
  const el = e.target;
  if (el.classList.contains('invalid')) el.classList.remove('invalid');
  if (el.dataset && el.dataset.bind === 'notes' && S.draft) { S.draft.notes = el.value; save(); }
});

window.onAndroidBack = () => {
  if (overlays.length) { overlays[overlays.length - 1].close(); return true; }
  return goBack();
};

/* ---------- boot ---------- */
load();
$('#tabs').innerHTML = TABS.map(([id, label, ic]) => `<button data-act="tab" data-tab="${id}" aria-label="${label}">${icon(ic)}<span>${label}</span></button>`).join('');
render(true);
