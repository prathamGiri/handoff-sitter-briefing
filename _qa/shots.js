// Store screenshots with the sample family.
module.exports = async (page, shot) => {
  const wait = (ms) => page.waitForTimeout(ms || 350);
  await page.click('[data-act=sample]'); await wait(600);
  await shot('home');
  await page.click('#plan-tonight'); await wait(500);
  await page.evaluate(() => document.querySelector('.bt-list').scrollIntoView({ block: 'start' })); await page.evaluate(() => window.scrollBy(0, -90)); await wait();
  await shot('tonight-timeline');
  await page.click('#preview-btn'); await wait(500);
  await shot('briefing-preview');
  await page.click('[data-act=back]'); await wait(); await page.click('[data-act=back]'); await wait();
  await page.click('[data-act=tab][data-tab=kids]'); await wait();
  await page.click('.kid-card'); await wait();
  await page.evaluate(() => document.querySelector('.routine').scrollIntoView({ block: 'center' })); await wait();
  await shot('kid-routine');
  await page.click('[data-act=back]'); await wait();
  await page.click('[data-act=tab][data-tab=history]'); await wait();
  await shot('history');
};
