import { chromium } from '/Users/yin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'

const entryImage = 'https://cdn.aiwaves.tech/prod/telegram/avatar/643177116/1786469713308632.png'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })

await page.route('**/alteru-media/api/v1/images/generations', async (route) => {
  const body = route.request().postDataJSON()
  await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
    task_id: `qa-${body.request_id}`, request_id: body.request_id, type: 'image', status: 'succeeded',
    created_at: Date.now(), updated_at: Date.now(),
    media: { type: 'image', url: entryImage, width: 512, height: 640, format: 'png' },
  }) })
})
await page.addInitScript(() => { localStorage.clear(); localStorage.setItem('game_locale', 'zh') })
await page.goto('http://127.0.0.1:4188/?story_mode=demo&lang=zh', { waitUntil: 'networkidle' })
await page.addStyleTag({ content: '#alteru-guest-banner{display:none!important}' })

async function choose(label) {
  await page.getByRole('button', { name: label }).click()
  const next = page.getByRole('button', { name: /查看下一步选择/ })
  await next.waitFor({ timeout: 8_000 })
  const visibleChoicesDuringResult = await page.locator('.ct-choice:visible').count()
  if (visibleChoicesDuringResult !== 0) throw new Error(`choices remained visible during result: ${label}`)
  await next.click()
  await page.waitForTimeout(80)
}

await page.getByRole('button', { name: /碰一下停在半空的雨/ }).click()
await choose(/抓住雨滴/)
await choose(/冲向那扇通往纯色的门/)
await choose(/撕下门框边一枚发亮的按键/)
await choose(/抓住从上方垂下的红色细线/)
await choose(/沿红线寻找它的另一端/)
await choose(/进入失重续费城/)
await choose(/抓住送货员和早餐箱/)
await choose(/问残差为什么能看见我的选择/)
await choose(/让残差继续读出屏幕外的东西/)

await page.getByRole('button', { name: /把撤销键按进取景框/ }).click()
await page.waitForFunction(() => {
  const raw = localStorage.getItem('alteru:c699e284-58a9-43ca-8edf-223cd69588c9:draw-me-out-save')
  if (!raw) return false
  const archive = JSON.parse(raw)
  return archive?.worlds?.['draw-me-out']?.sessionEnded === true
}, { timeout: 8_000 })
const bodyText = await page.locator('body').innerText()
if (bodyText.includes('继续这段旅程')) throw new Error('generic single-choice fallback appeared')

console.log(JSON.stringify({ ok: true, completeLoop: true, fallbackAbsent: true }, null, 2))
await browser.close()
