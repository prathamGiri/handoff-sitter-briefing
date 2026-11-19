// QA scenario for Handoff. Throws on any failed expectation.
module.exports = async (page, shot) => {
  const wait = (ms) => page.waitForTimeout(ms || 300);
  const fail = (m) => { throw new Error(m); };
  const expect = (cond, m) => { if (!cond) fail(m); };
  const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('handoff.v1') || 'null'));
  const noOverflow = async (where) => {
    const o = await page.evaluate(() => {
      const w = document.documentElement.clientWidth;
      const bad = Array.from(document.querySelectorAll('#app *')).filter((e) => {
        const r = e.getBoundingClientRect(); return r.width && (r.right > w + 1 || r.left < -1);
      }).map((e) => e.tagName + '.' + e.className).slice(0, 3);
      return { sw: document.documentElement.scrollWidth, w, bad };
    });
    expect(o.sw <= o.w + 1 && !o.bad.length, `horizontal overflow on ${where}: ${JSON.stringify(o)}`);
  };
  const tl = () => page.$$eval('#timeline .tl-i', (els) => els.map((e) => ({
    time: e.querySelector('.pill').textContent.trim(),
    label: e.querySelector('.tl-label').childNodes[0].textContent.trim(),
    kind: e.className,
    avs: Array.from(e.querySelectorAll('.avs .av')).map((a) => a.textContent.trim()),
  })));
  const briefText = () => page.textContent('#brief-text');
  const sectionLines = (text, header) => {
    const lines = text.split('\n'); const i = lines.findIndex((l) => l.includes(header));
    if (i < 0) return null; const out = [];
    for (let j = i + 1; j < lines.length && lines[j].trim(); j++) out.push(lines[j]);
    return out;
  };
  const back = () => page.evaluate(() => window.onAndroidBack && window.onAndroidBack());
  const toastText = () => page.textContent('#toast');

  // ---------- 1. First run ----------
  expect(await page.locator('#add-first-kid').count(), 'empty state has no "add first kid" button');
  await back(); // back on root home should not crash
  await page.click('#add-first-kid'); await wait();
  // empty name must not save
  await page.click('#sheet-save'); await wait();
  expect(await page.locator('.sheet .form-err:not([hidden])').count(), 'empty kid name: no validation message');
  expect(!(await state()) || (await state()).kids.length === 0, 'empty kid name was saved');
  await page.fill('.sheet [name=name]', 'Ava');
  await page.fill('.sheet [name=age]', '4');
  await page.fill('.sheet [name=bedtimeWeekday]', '19:30');
  await shot('add-kid-sheet');
  // rapid double tap on save must add exactly one kid
  await page.click('#sheet-save', { clickCount: 1 });
  await page.click('#sheet-save', { force: true, timeout: 500 }).catch(() => {});
  await wait(500);
  let s = await state();
  expect(s.kids.length === 1, `rapid taps on Add kid created ${s.kids.length} kids`);
  expect(!(await page.locator('.sheet-scrim').count()), 'sheet did not close after save');

  await page.click('[data-act=tab][data-tab=kids]'); await wait();
  await page.click('header [data-act=addkid]'); await wait();
  await page.fill('.sheet [name=name]', 'Leo');
  await page.fill('.sheet [name=age]', '7');
  await page.fill('.sheet [name=bedtimeWeekday]', '20:15');
  await page.click('#sheet-save'); await wait(500);

  // Ava's severe peanut allergy
  await page.click('.kid-card >> nth=0'); await wait();
  await page.click('[data-act=addallergy]'); await wait();
  await page.fill('.sheet [name=text]', 'Peanuts');
  await page.click('.sheet [data-seg=severity] [data-v=severe]');
  await page.click('#sheet-save'); await wait(400);

  // ---------- 2. Routine: Bath -45 (preset), Books -15 (custom step), Lights out 0 (preset) ----------
  await page.click('[data-act=preset][data-label="Bath"]'); await wait(200);
  await page.click('[data-act=addstep]'); await wait();
  await page.fill('.sheet [name=label]', 'Books');
  for (let i = 0; i < 3; i++) await page.click('.sheet .stepper [data-d="5"]');
  expect((await page.textContent('#off-out')).includes('15'), 'step offset stepper not at -15');
  await page.click('#sheet-save'); await wait(300);
  await page.click('[data-act=preset][data-label="Lights out"]'); await wait(200);
  await shot('kid-detail');
  await noOverflow('kid detail');

  await page.reload(); await wait(600);
  s = await state();
  expect(s.kids.map((k) => k.name).join() === 'Ava,Leo', 'kids did not persist after reload');
  const ava = s.kids[0], leo = s.kids[1];
  expect(ava.bedtimeWeekday === '19:30' && leo.bedtimeWeekday === '20:15', 'bedtimes not saved');
  expect(ava.allergies[0] && ava.allergies[0].severity === 'severe', 'peanut allergy not severe');
  expect(ava.routine.map((r) => r.label + r.offsetMin).join() === 'Bath-45,Books-15,Lights out0', 'routine wrong: ' + JSON.stringify(ava.routine));
  expect(leo.bedtimeWeekend === '20:45', 'default weekend bedtime should be +30');

  // House info + contacts (needed for New-sitter briefing)
  await page.click('[data-act=tab][data-tab=house]'); await wait();
  const setHouse = async (key, v) => { await page.click(`[data-act=edithouse][data-id=${key}]`); await wait(); await page.fill('.sheet [name=value]', v); await page.click('#sheet-save'); await wait(300); };
  await setHouse('address', '42 Linden Street');
  await setHouse('wifiName', 'Linden-Home');
  await setHouse('wifiPass', 'sunflower-42');
  await setHouse('urgentCare', 'CityMed, 210 Oak Ave');
  const addContact = async (n, r, p) => { await page.click('#add-contact'); await wait(); await page.fill('.sheet [name=name]', n); await page.fill('.sheet [name=role]', r); await page.fill('.sheet [name=phone]', p); await page.click('#sheet-save'); await wait(300); };
  await addContact('Sam', 'Mom', '555-0101');
  await addContact('Dr. Patel', 'pediatrician', '555-0202');
  await page.click('[data-act=copyphone] >> nth=0'); await wait(200);
  expect((await toastText()).includes('Copied'), 'tap-to-copy phone gave no toast');
  await shot('house');

  // ---------- Builder ----------
  await page.click('[data-act=tab][data-tab=home]'); await wait();
  await page.click('#plan-tonight'); await wait(400);
  await page.fill('[data-bind=date]', '2026-11-23'); await page.dispatchEvent('[data-bind=date]', 'change'); await wait(); // a Monday
  let t = await tl();
  const at = (label, kidIni) => t.find((x) => x.label === label && (!kidIni || x.avs.includes(kidIni)));
  expect(at('Bath') && at('Bath').time === '6:45 PM', 'Bath not 6:45 PM: ' + JSON.stringify(t));
  expect(at('Books') && at('Books').time === '7:15 PM', 'Books not 7:15 PM');
  expect(at('Lights out') && at('Lights out').time === '7:30 PM', 'Lights out not 7:30 PM');
  // 3. merged + sorted + avatars; Leo with no routine shows only Bedtime
  expect(at('Bedtime', 'L') && at('Bedtime', 'L').time === '8:15 PM', "Leo's Bedtime missing at 8:15 PM");
  const mins = (x) => { const m = /(\d+):(\d+) (AM|PM)/.exec(x.time); return ((+m[1]) % 12 + (m[3] === 'PM' ? 12 : 0)) * 60 + (+m[2]); };
  for (let i = 1; i < t.length; i++) expect(mins(t[i]) >= mins(t[i - 1]), 'timeline not sorted');
  expect(t.filter((x) => x.kind.includes('step')).every((x) => x.avs.length >= 1), 'timeline step without kid avatar');
  await shot('builder-merged');

  // override Ava's bedtime to 20:00
  await page.fill(`.bt-input[data-bt="${ava.id}"]`, '20:00'); await page.dispatchEvent(`.bt-input[data-bt="${ava.id}"]`, 'change'); await wait();
  t = await tl();
  expect(at('Bath').time === '7:15 PM' && at('Books').time === '7:45 PM' && at('Lights out').time === '8:00 PM', 'override did not shift by 30: ' + JSON.stringify(t));
  // untick Leo
  await page.click(`[data-act=togkid][data-id="${leo.id}"]`); await wait();
  t = await tl();
  expect(!t.some((x) => x.avs.includes('L')), "Leo's steps still visible after untick");
  await page.click(`[data-act=togkid][data-id="${leo.id}"]`); await wait();
  // rapid taps on a kid toggle (even count) leave it on
  for (let i = 0; i < 4; i++) await page.click(`[data-act=togkid][data-id="${leo.id}"]`);
  await wait();
  expect((await state()).draft.kidIds.length === 2, 'rapid kid toggles left wrong state');

  // validation: back-by earlier than leave
  await page.fill('#back-by', '17:00'); await page.dispatchEvent('#back-by', 'change'); await wait();
  expect(await page.locator('#time-error').count(), 'no validation for back-by < leave');
  await page.click('#preview-btn'); await wait();
  expect(await page.locator('#time-error').count() && !(await page.locator('#brief-text').count()), 'preview opened with invalid times');
  await shot('builder-validation');
  await page.fill('#back-by', '22:30'); await page.dispatchEvent('#back-by', 'change'); await wait();
  expect(!(await page.locator('#time-error').count()), 'validation message stuck');

  // extras + long notes
  await page.click('[data-act=togextra] >> nth=0'); await wait();
  const longNote = 'Leo has a wobbly tooth so please be gentle when brushing, and if Ava wakes up after a bad dream she likes the hallway light on and the door open a crack. '.repeat(3) + 'https://example.com/a-very-long-link-without-any-spaces-at-all-to-test-wrapping-in-the-preview-card';
  await page.fill('#notes', longNote); await page.dispatchEvent('#notes', 'change'); await wait();

  // caregiver Maya (New)
  await page.click('#new-cg'); await wait();
  await page.fill('.sheet [name=name]', 'Maya');
  await page.fill('.sheet [name=role]', 'sitter');
  await page.click('#sheet-save'); await wait(400);
  s = await state();
  const maya = s.caregivers.find((c) => c.name === 'Maya');
  expect(maya && maya.level === 'new' && s.draft.caregiverId === maya.id, 'Maya not created/picked as New');

  // draft survives reload
  await page.reload(); await wait(600);
  await page.click('#plan-tonight'); await wait(400);
  expect((await page.inputValue('#notes')).startsWith('Leo has a wobbly'), 'draft notes lost on reload');
  expect((await page.inputValue('#back-by')) === '22:30', 'draft back-by lost on reload');

  // ---------- 4. Briefing levels ----------
  await page.click('#preview-btn'); await wait(400);
  let b = await briefText();
  const iA = b.indexOf('ALLERGIES'), iP = b.indexOf('PEANUTS — SEVERE'), iT = b.indexOf('TONIGHT');
  expect(iA > 0 && iP > iA && iP < iT, 'severe peanut allergy not at top');
  expect(iA < b.indexOf('HOUSE') && iA < b.indexOf('CONTACTS'), 'allergies not first section');
  for (const needle of ['Address: 42 Linden Street', 'Linden-Home / sunflower-42', 'Urgent care: CityMed', 'Sam (Mom): 555-0101', 'Dr. Patel (pediatrician): 555-0202']) expect(b.includes(needle), 'New briefing missing: ' + needle);
  expect(!b.includes('NEW SINCE'), 'first briefing should have no changes section');
  expect(b.includes('7:15 PM  Bath — Ava'), 'override not reflected in briefing: ' + b);
  await shot('briefing-new');
  await page.click('.lvl-pick [data-v=family]'); await wait();
  b = await briefText();
  expect(!b.includes('Address:') && !b.includes('Wi-Fi') && !b.includes('Urgent care'), 'Family briefing still has house info');
  expect(b.indexOf('PEANUTS') > 0 && b.indexOf('PEANUTS') < b.indexOf('TONIGHT'), 'Family briefing lost allergy at top');
  // section toggle
  await page.click('[data-act=togsec][data-v=house]'); await wait();
  expect((await briefText()).includes('Address:'), 'house section toggle does nothing');
  await page.click('[data-act=togsec][data-v=house]'); await wait();

  // long notes at 360px
  await page.setViewportSize({ width: 360, height: 780 }); await wait();
  await noOverflow('briefing preview 360px');
  await page.evaluate(() => document.querySelector('#brief-text').scrollIntoView({ block: 'end' })); await wait();
  await shot('briefing-longnotes-360');
  await page.setViewportSize({ width: 390, height: 844 }); await wait();

  // ---------- 5. Share fallback (plain browser) ----------
  const fullText = await briefText();
  await page.click('#share-btn'); await wait(300);
  expect((await toastText()).toLowerCase().includes('copied'), 'share fallback gave no clipboard toast');
  s = await state();
  expect(s.handoffs.length === 1 && s.caregivers.find((c) => c.id === maya.id).visits === 1, 'handoff not saved / visits not incremented');
  // rapid repeat share must not duplicate
  await page.click('#share-btn'); await page.click('#share-btn'); await wait(300);
  s = await state();
  expect(s.handoffs.length === 1 && s.caregivers.find((c) => c.id === maya.id).visits === 1, 'Share again duplicated handoff');
  // native bridge
  await page.evaluate(() => { window.Android = { share: (t) => { window.__shared = t; } }; });
  await page.click('#share-btn'); await wait(300);
  const shared = await page.evaluate(() => window.__shared);
  expect(shared === fullText, 'native share bridge did not receive full text');
  await page.evaluate(() => { delete window.Android; });
  await shot('briefing-sent');
  await page.click('[data-act=done]'); await wait();
  expect(await page.locator('.card.handoff').count() === 1, 'History does not show the handoff');

  // ---------- 6. What changed ----------
  await wait(30);
  await page.click('[data-act=tab][data-tab=house]'); await wait();
  await setHouse('wifiPass', 'moonbeam-77');
  await page.click('[data-act=tab][data-tab=kids]'); await wait();
  await page.click(`.kid-card[data-id="${ava.id}"]`); await wait();
  await page.click('[data-act=addallergy]'); await wait();
  await page.fill('.sheet [name=text]', 'Cashews');
  await page.click('.sheet [data-seg=severity] [data-v=mild]');
  await page.click('#sheet-save'); await wait(300);
  await page.click('[data-act=back]'); await wait();
  await page.click('[data-act=tab][data-tab=home]'); await wait();
  await page.click('#plan-tonight'); await wait(400);
  expect((await state()).draft.caregiverId === maya.id, 'new plan did not default to last caregiver');
  await page.click('#preview-btn'); await wait(400);
  b = await briefText();
  const ch = sectionLines(b, 'NEW SINCE LAST TIME');
  expect(ch && ch.length === 2, 'expected exactly 2 changes, got: ' + JSON.stringify(ch));
  expect(ch.some((l) => l.includes('New Wi-Fi password')) && ch.some((l) => l.includes('Ava: now allergic to cashews')), 'wrong changes: ' + JSON.stringify(ch));
  expect(await page.locator('#changes-banner').count(), 'no New-since banner');
  await shot('briefing-changes');
  // brand-new caregiver has no changes section
  await back(); await wait();
  await page.click('#new-cg'); await wait();
  await page.fill('.sheet [name=name]', 'Grandpa Joe');
  await page.click('.sheet [data-seg=level] [data-v=family]');
  await page.click('#sheet-save'); await wait(300);
  await page.click('#preview-btn'); await wait(400);
  expect(!(await briefText()).includes('NEW SINCE'), 'brand-new caregiver got a changes section');
  // back handler: preview -> builder -> home
  expect(await back(), 'back from preview returned false'); await wait();
  expect(await page.locator('#preview-btn').count(), 'back from preview did not land in builder');
  // back closes a sheet first
  await page.click('#new-cg'); await wait();
  await back(); await wait(300);
  expect(!(await page.locator('.sheet-scrim').count()) && (await page.locator('#preview-btn').count()), 'back did not close sheet only');
  await back(); await wait();
  expect(await page.locator('#plan-tonight').count(), 'back from builder did not go home');

  // ---------- 7. Staleness ----------
  await page.click('[data-act=settings]'); await wait();
  await page.click('[data-seg=stale] [data-v="3"]'); await wait();
  await page.evaluate(() => {
    const d = JSON.parse(localStorage.getItem('handoff.v1'));
    d.contacts[1].updatedAt = new Date(Date.now() - 120 * 86400000).toISOString();
    localStorage.setItem('handoff.v1', JSON.stringify(d));
  });
  await page.reload(); await wait(600);
  expect((await state()).settings.staleMonths === 3, 'stale threshold not persisted');
  const staleCard = page.locator('.card.stale', { hasText: 'Dr. Patel' });
  expect(await staleCard.count() === 1, 'no staleness alert for backdated contact');
  expect(await page.locator('.card.stale').count() === 1, 'unexpected extra stale alerts');
  await shot('home-stale');
  await staleCard.locator('[data-act=reviewed]').click(); await wait(500);
  expect(!(await page.locator('.card.stale').count()), 'Still accurate did not clear alert');
  await page.reload(); await wait(600);
  expect(!(await page.locator('.card.stale').count()), 'Still accurate not persisted');

  // ---------- 8. Reuse night ----------
  await page.click('[data-act=tab][data-tab=history]'); await wait();
  await shot('history');
  await page.click('[data-act=reuse] >> nth=0'); await wait(400);
  s = await state();
  const h = s.handoffs[0];
  const today = await page.evaluate(() => todayStr());
  expect(s.draft.caregiverId === maya.id && s.draft.kidIds.length === 2, 'reuse: caregiver/kids not prefilled');
  expect(JSON.stringify(s.draft.extras) === JSON.stringify(h.extras) && h.extras.length === 1, 'reuse: extras not prefilled');
  expect(s.draft.bedtimeOverrides[ava.id] === '20:00', 'reuse: bedtime override lost');
  expect(s.draft.leaveAt === h.leaveAt && s.draft.backBy === '22:30' && s.draft.date === today, 'reuse: times/date wrong');
  expect((await page.inputValue('[data-bind=date]')) === today, 'reuse: builder date not today');
  await shot('reuse-builder');
  await back(); await wait();

  // ---------- 9. Export / reset / import ----------
  await page.click('[data-act=tab][data-tab=home]'); await wait();
  await page.click('[data-act=settings]'); await wait();
  const json = await page.inputValue('#export-json');
  expect(JSON.parse(json).kids.length === 2, 'export JSON missing kids');
  // bad import shows error
  await page.fill('#import-json', 'not json'); await page.click('#import-btn'); await wait();
  expect(await page.locator('#import-err:not([hidden])').count(), 'bad import shows no error');
  await page.click('#reset-btn'); await wait();
  await page.click('.dialog [data-r="0"]'); await wait(300); // cancel
  expect((await state()).kids.length === 2, 'cancel on reset still deleted data');
  await page.click('#reset-btn'); await wait();
  await page.click('#dlg-ok'); await wait(400);
  expect((await state()).kids.length === 0 && (await page.locator('#add-first-kid').count()), 'reset did not clear data');
  await page.click('[data-act=settings]'); await wait();
  await page.fill('#import-json', json); await page.click('#import-btn'); await wait();
  await page.click('#dlg-ok'); await wait(400);
  await page.reload(); await wait(600);
  s = await state();
  expect(s.kids.length === 2 && s.kids[0].routine.length === 3 && s.kids[0].allergies.length === 2, 'import: kids/routines not restored');
  expect(s.caregivers.length === 2 && s.handoffs.length === 1 && s.contacts.length === 2, 'import: caregivers/history not restored');
  expect(s.house.fields.wifiPass.value === 'moonbeam-77', 'import: house not restored');

  // ---------- Edge: very long names, layout ----------
  await page.click('[data-act=tab][data-tab=kids]'); await wait();
  await page.click('header [data-act=addkid]'); await wait();
  await page.fill('.sheet [name=name]', 'Maximiliana-Alexandrina Featherstonehaugh-Worthington');
  await page.fill('.sheet [name=comfort]', 'Supercalifragilisticexpialidocious-blanket-with-the-very-long-name');
  await page.click('#sheet-save'); await wait(400);
  await noOverflow('kids list with long name');
  await shot('kids-longname');
  await page.click('.kid-card >> nth=2'); await wait();
  await noOverflow('kid detail with long name');
  await back(); await wait();
  await page.click('[data-act=tab][data-tab=home]'); await wait();
  await page.click('#plan-tonight'); await wait(400);
  await noOverflow('builder with long name');
  await back(); await wait();
  await page.click('[data-act=tab][data-tab=people]'); await wait();
  await noOverflow('caregivers');
  await shot('caregivers');

  // dialog double-tap safety: delete kid flow
  await page.click('[data-act=tab][data-tab=kids]'); await wait();
  await page.click('.kid-card >> nth=2'); await wait();
  await page.click('[data-act=editkid] >> nth=0'); await wait();
  await page.click('[data-sheet-danger]'); await wait(250);
  await page.click('#dlg-ok'); await page.click('#dlg-ok', { force: true, timeout: 300 }).catch(() => {});
  await wait(500);
  s = await state();
  expect(s.kids.length === 2, 'delete kid failed');
  expect(await page.evaluate(() => overlays.length) === 0 && !(await page.locator('.scrim').count()), 'overlay stack inconsistent after delete');
  await page.click('[data-act=tab][data-tab=home]'); await wait();
  await shot('home-final');
};
