import { chromium } from '/Users/yin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'
import { mkdir } from 'node:fs/promises'

const base = 'http://127.0.0.1:4188/?story_mode=demo&lang=zh'
const evidence = new URL('./ui/', import.meta.url).pathname
const entryImage = 'https://cdn.aiwaves.tech/prod/telegram/avatar/643177116/1786469713308632.png'

await mkdir(evidence, { recursive: true })
const browser = await chromium.launch({ headless: true })

async function open(viewport) {
  const context = await browser.newContext({ viewportSize: viewport, deviceScaleFactor: 1 })
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

{
  const { context, page } = await open({ width: 390, height: 844 })
  await page.screenshot({ path: `${evidence}platform-layout-entry-390x844.png`, fullPage: true })
  await page.getByRole('button', { name: /碰一下停在半空的雨/ }).click()
  await page.waitForSelector('.ct-stage')
  await page.waitForTimeout(450)
  await page.screenshot({ path: `${evidence}platform-layout-opening-decision-390x844.png`, fullPage: true })
  await page.getByRole('button', { name: /碰一下眼前的雨滴/ }).click()
  await page.getByRole('button', { name: /查看下一步选择/ }).waitFor({ timeout: 8_000 })
  await page.screenshot({ path: `${evidence}platform-layout-first-result-390x844.png`, fullPage: true })
  await page.getByRole('button', { name: /查看下一步选择/ }).click()
  await page.waitForTimeout(250)
  await page.screenshot({ path: `${evidence}platform-layout-second-decision-390x844.png`, fullPage: true })
  await context.close()
}

{
  const { context, page } = await open({ width: 320, height: 568 })
  await page.getByRole('button', { name: /碰一下停在半空的雨/ }).click()
  await page.waitForSelector('.ct-stage')
  await page.waitForTimeout(350)
  await page.screenshot({ path: `${evidence}platform-layout-opening-decision-320x568.png`, fullPage: true })
  await context.close()
}

{
  const { context, page } = await open({ width: 1366, height: 768 })
  await page.screenshot({ path: `${evidence}platform-layout-entry-1366x768.png`, fullPage: true })
  await context.close()
}

{
  const context = await browser.newContext({ viewportSize: { width: 390, height: 844 }, deviceScaleFactor: 1 })
  const page = await context.newPage()
  await page.addInitScript(() => { localStorage.clear(); localStorage.setItem('game_locale', 'zh') })
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.screenshot({ path: `${evidence}external-guest-entry-390x844.png`, fullPage: true })
  await context.close()
}

await browser.close()
console.log(JSON.stringify({ ok: true, evidence }, null, 2))
