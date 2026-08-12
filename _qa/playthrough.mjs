import { chromium } from '/Users/yin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'
import { mkdir } from 'node:fs/promises'

const entryImage = 'https://cdn.aiwaves.tech/prod/telegram/avatar/643177116/1786469713308632.png'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
const evidence = new URL('./ui/', import.meta.url).pathname
await mkdir(evidence, { recursive: true })

await page.route('**/alteru-media/api/v1/images/generations', async (route) => {
  const body = route.request().postDataJSON()
  await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
    task_id: `qa-${body.request_id}`, request_id: body.request_id, type: 'image', status: 'succeeded',
    created_at: Date.now(), updated_at: Date.now(),
    media: { type: 'image', url: entryImage, width: 512, height: 640, format: 'png' },
  }) })
})
await page.addInitScript(() => { localStorage.clear(); localStorage.setItem('game_locale', 'zh') })
await page.goto(`${process.env.QA_URL || 'http://127.0.0.1:4188'}/?story_mode=demo&lang=zh`, { waitUntil: 'networkidle' })
await page.addStyleTag({ content: '#alteru-guest-banner{display:none!important}' })

async function readWorld() {
  return page.evaluate(() => {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index)
      if (!key?.endsWith(':draw-me-out-save')) continue
      const archive = JSON.parse(localStorage.getItem(key) || '{}')
      if (archive?.worlds?.['draw-me-out']) return archive.worlds['draw-me-out']
    }
    return null
  })
}

async function choose(label, resultShot) {
  await page.getByRole('button', { name: label }).click()
  const next = page.getByRole('button', { name: /查看下一步选择/ })
  await next.waitFor({ timeout: 8_000 })
  const visibleChoicesDuringResult = await page.locator('.ct-choice:visible').count()
  if (visibleChoicesDuringResult !== 0) throw new Error(`choices remained visible during result: ${label}`)
  if (resultShot) await page.screenshot({ path: `${evidence}${resultShot}`, fullPage: true })
  await next.click()
  await page.waitForTimeout(80)
}

await page.getByRole('button', { name: /碰一下停在半空的雨/ }).click()
await choose(/碰一下眼前的雨滴/)
await choose(/跑向远处那扇门/)
await choose(/直接跑向那扇门/)
await choose(/拿走门框上的发亮按键/, 'domain-platform-layout-undo-key-acquired-390x844.png')
let world = await readWorld()
if (world.inventory.find((item) => item.id === 'undo-key')?.count !== 1) throw new Error('Undo Key must be one persistent item')
if (world.inventory.find((item) => item.id === 'undo-key')?.metrics?.find((metric) => metric.id === 'remaining-uses')?.value !== '3') throw new Error('Undo Key must begin with three derived uses')
await choose(/抓住那根红线/)
await choose(/沿着红线往前摸/)
await choose(/去救快飞走的送货员/)
await choose(/抓住送货员和早餐箱/, 'domain-platform-layout-first-clue-390x844.png')
world = await readWorld()
if (world.inventory.find((item) => item.id === 'coordinate-weight')?.count !== 1) throw new Error('first clue must be awarded exactly once')
if (world.facts['home-clue-count'] !== 1 || world.facts['first-coordinate-earned'] !== true || world.facts['coordinates-four'] !== false) throw new Error('derived clue facts drifted from inventory')
await page.getByRole('textbox', { name: '自定义行动' }).fill('告诉收费塔早餐属于公共服务')
await page.getByRole('button', { name: '发送行动' }).click()
await page.getByRole('button', { name: /查看下一步选择/ }).waitFor({ timeout: 8_000 })
await page.screenshot({ path: `${evidence}domain-platform-layout-repeat-clue-rejected-390x844.png`, fullPage: true })
world = await readWorld()
if (world.inventory.find((item) => item.id === 'coordinate-weight')?.count !== 1 || world.facts['home-clue-count'] !== 1) throw new Error('repeated clue claim must reject without a duplicate')
await page.getByRole('button', { name: /查看下一步选择/ }).click()
await choose(/问小残回家还缺什么/)
await choose(/让小残说它还看见什么/)

await choose(/按下撤销键退回刚才/, 'domain-platform-layout-free-undo-rejected-390x844.png')
world = await readWorld()
if (world.facts['undo-key-uses'] !== 0 || world.sessionEnded) throw new Error('free Undo must reject with zero partial effects')
if (!await page.getByRole('button', { name: /用撤销键，忘掉悬停的雨/ }).isVisible()) throw new Error('rejection must offer a feasible explicit-cost recovery')
await page.getByRole('button', { name: /用撤销键，忘掉悬停的雨/ }).click()
await page.waitForFunction(() => {
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)
    if (!key?.endsWith(':draw-me-out-save')) continue
    const archive = JSON.parse(localStorage.getItem(key) || '{}')
    if (archive?.worlds?.['draw-me-out']?.sessionEnded === true) return true
  }
  return false
}, { timeout: 8_000 })
await page.getByRole('button', { name: /查看下一步选择/ }).waitFor({ timeout: 8_000 })
await page.screenshot({ path: `${evidence}domain-platform-layout-paid-undo-390x844.png`, fullPage: true })
world = await readWorld()
if (world.facts['undo-key-uses'] !== 1 || world.facts['rain-is-pixels'] !== false || world.facts['undo-cost-rain-spent'] !== true) throw new Error('paid Undo transaction did not persist atomically')
if (world.inventory.find((item) => item.id === 'undo-key')?.metrics?.find((metric) => metric.id === 'remaining-uses')?.value !== '2') throw new Error('derived remaining uses must be two')
const bodyText = await page.locator('body').innerText()
if (bodyText.includes('继续这段旅程')) throw new Error('generic single-choice fallback appeared')

console.log(JSON.stringify({ ok: true, completeLoop: true, fallbackAbsent: true, undoUses: world.facts['undo-key-uses'], clueCount: world.facts['home-clue-count'], evidence }, null, 2))
await browser.close()
