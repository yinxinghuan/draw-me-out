import { chromium } from '/Users/yin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'
import { mkdir } from 'node:fs/promises'

const base = `${process.env.QA_URL || 'http://127.0.0.1:4188'}/?story_mode=demo&lang=zh`
const evidence = new URL('./ui/', import.meta.url).pathname
const entryImage = 'https://cdn.aiwaves.tech/prod/telegram/avatar/643177116/1786469713308632.png'

await mkdir(evidence, { recursive: true })
const browser = await chromium.launch({ headless: true })

async function open(viewport) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 })
  const page = await context.newPage()
  await page.route('**/alteru-media/api/v1/images/generations', async (route) => {
    const body = route.request().postDataJSON()
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        task_id: `qa-${body.request_id}`,
        request_id: body.request_id,
        type: 'image',
        status: 'succeeded',
        created_at: Date.now(),
        updated_at: Date.now(),
        media: { type: 'image', url: entryImage, width: 512, height: 640, format: 'png' },
      }),
    })
  })
  await page.addInitScript(() => {
    localStorage.clear()
    localStorage.setItem('game_locale', 'zh')
  })
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.addStyleTag({ content: '#alteru-guest-banner{display:none!important}' })
  return { context, page }
}

async function readResult(page) {
  await page.locator('.ct-civic-viewport.is-result').waitFor({ state: 'visible', timeout: 8_000 })
  while (await page.locator('.ct-result-story>button:visible').count()) {
    await page.locator('.ct-result-story>button:visible').first().click()
  }
  await page.getByRole('button', { name: /查看下一步选择/ }).waitFor({ timeout: 8_000 })
}

{
  const { context, page } = await open({ width: 390, height: 844 })
  await page.screenshot({ path: `${evidence}platform-layout-entry-390x844.png`, fullPage: true })
  await page.getByRole('button', { name: /碰一下停在半空的雨/ }).click()
  await page.waitForSelector('.ct-stage')
  await readResult(page)
  if (await page.locator('.st-composer').count()) throw new Error('Composer appeared before the opening result was acknowledged')
  if (await page.getByRole('button', { name: /碰.*雨/ }).count()) throw new Error('touch-rain action was duplicated after entry')
  await page.screenshot({ path: `${evidence}platform-layout-first-result-390x844.png`, fullPage: true })
  await page.getByRole('button', { name: /查看下一步选择/ }).click()
  await page.getByRole('button', { name: /叫住换脸的路人/ }).waitFor()
  if (await page.locator('.st-chat-stat').count() !== 1) throw new Error('only Strength should be visible after the first causal reveal')
  await page.screenshot({ path: `${evidence}platform-layout-opening-decision-390x844.png`, fullPage: true })
  await page.getByRole('button', { name: /叫住换脸的路人/ }).click()
  await readResult(page)
  await page.getByRole('button', { name: /查看下一步选择/ }).click()
  const openingPager = page.locator('.ct-stage__caption-page')
  if (await openingPager.count()) {
    if (await page.locator('.st-composer').count()) throw new Error('Composer appeared before all opening context pages were read')
    while (!(await openingPager.locator('span').textContent())?.match(/(\d+)\/\1/)) await openingPager.click()
  }
  await page.getByRole('button', { name: /拿走门框上的发亮按键/ }).waitFor()
  if (await page.locator('.st-chat-stat').count() !== 2) throw new Error('Detected should appear after the street notices the player')
  await page.screenshot({ path: `${evidence}platform-layout-second-decision-390x844.png`, fullPage: true })
  await context.close()
}

{
  const { context, page } = await open({ width: 320, height: 568 })
  await page.getByRole('button', { name: /碰一下停在半空的雨/ }).click()
  await page.waitForSelector('.ct-stage')
  await readResult(page)
  if (await page.locator('.st-composer').count()) throw new Error('narrow Composer appeared before opening result acknowledgement')
  await page.screenshot({ path: `${evidence}platform-layout-first-result-320x568.png`, fullPage: true })
  await page.getByRole('button', { name: /查看下一步选择/ }).click()
  await page.getByRole('button', { name: /叫住换脸的路人/ }).waitFor()
  if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)) throw new Error('opening decision overflows at 320x568')
  await page.screenshot({ path: `${evidence}platform-layout-opening-decision-320x568.png`, fullPage: true })
  await context.close()
}

{
  const { context, page } = await open({ width: 1366, height: 768 })
  await page.screenshot({ path: `${evidence}platform-layout-entry-1366x768.png`, fullPage: true })
  await context.close()
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 })
  const page = await context.newPage()
  await page.addInitScript(() => { localStorage.clear(); localStorage.setItem('game_locale', 'zh') })
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.screenshot({ path: `${evidence}external-guest-entry-390x844.png`, fullPage: true })
  await context.close()
}

await browser.close()
console.log(JSON.stringify({ ok: true, evidence }, null, 2))
