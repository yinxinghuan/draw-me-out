import { chromium } from '/Users/yin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'
import { mkdir } from 'node:fs/promises'

const evidence = new URL('./ui/caption-visibility/', import.meta.url).pathname
await mkdir(evidence, { recursive: true })
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 })
const page = await context.newPage()
const transparentGif = 'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='
let storyTurn = 0

await page.route('https://images.aiwaves.tech/alteru/guest-shell.js', (route) => route.fulfill({ contentType: 'application/javascript', body: '' }))
await page.route('**/alteru-media/api/v1/images/generations', async (route) => {
  const body = route.request().postDataJSON()
  await route.fulfill({ contentType: 'application/json', body: JSON.stringify({
    task_id: `qa-${body.request_id}`, request_id: body.request_id, type: 'image', status: 'succeeded',
    created_at: Date.now(), updated_at: Date.now(),
    media: { type: 'image', url: `data:image/gif;base64,${transparentGif}`, width: 512, height: 640, format: 'png' },
  }) })
})
await page.route('**/aigram/api/game-chat', async (route) => {
  storyTurn += 1
  const content = `左边的路正在褪色，右边传来小残的呼救。
image_prompt:"two diverging painted roads beneath suspended rain, no text"
image_subject:"environment"
[choices: "走向左路"|"回应小残"|"检查脚下白线"]`
  await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ choices: [{ message: { content } }] }) })
})
await page.addInitScript(() => { localStorage.setItem('game_locale', 'zh') })
await page.goto('http://127.0.0.1:4188/?ui=civic&lang=zh', { waitUntil: 'networkidle' })
await page.addStyleTag({ content: '#alteru-guest-banner{display:none!important}' })
const advance = async (action) => {
  await page.getByRole('button', { name: action }).click()
  await page.getByRole('button', { name: /查看下一步选择/ }).waitFor({ timeout: 10_000 })
  await page.getByRole('button', { name: /查看下一步选择/ }).click()
}
await page.getByRole('button', { name: /碰一下停在半空的雨/ }).click()
await page.getByRole('button', { name: /查看下一步选择/ }).waitFor({ timeout: 10_000 })
await page.getByRole('button', { name: /查看下一步选择/ }).click()
await advance(/叫住换脸的路人/)
await advance(/拿走门框上的发亮按键/)
await advance(/沿着红线往前摸/)
await advance(/去救快飞走的送货员/)
await advance(/告诉收费塔早餐属于公共服务/)
if (storyTurn !== 0) throw new Error(`governed opening made ${storyTurn} unexpected AI request(s)`)

if (await page.locator('.ct-stage__caption').count()) throw new Error(`protocol residue or generic choice prompt still created a caption card: ${await page.locator('.ct-stage__caption').allTextContents()}`)
if (await page.getByText(/image_subject|image_prompt|请做出选择/).count()) throw new Error('internal or redundant copy remained visible')
await page.screenshot({ path: `${evidence}01-caption-absent-platform-layout-390x844.png`, fullPage: true })
await page.setViewportSize({ width: 320, height: 568 })
if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)) throw new Error('caption-absent state overflows at 320x568')
await page.screenshot({ path: `${evidence}01-caption-absent-platform-layout-320x568.png`, fullPage: true })
await page.setViewportSize({ width: 390, height: 844 })

await advance(/问小残回家还缺什么/)
if (storyTurn !== 1) throw new Error(`free action made ${storyTurn} AI request(s), expected exactly one`)
await page.getByRole('button', { name: /走向左路/ }).waitFor()
const caption = page.locator('.ct-stage__caption')
await caption.waitFor()
if (!await caption.getByText('此刻', { exact: true }).isVisible()) throw new Error('meaningful narration did not use the neutral current-moment label')
if (!await caption.getByText('左边的路正在褪色，右边传来小残的呼救。', { exact: true }).isVisible()) throw new Error('meaningful decision context was not retained')
if (await page.getByText(/接下来，你要怎么做|请做出选择/).count()) throw new Error('choice invitation was repeated above the actual choices')
await page.screenshot({ path: `${evidence}02-context-caption-platform-layout-390x844.png`, fullPage: true })
await page.setViewportSize({ width: 320, height: 568 })
if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)) throw new Error('meaningful-caption state overflows at 320x568')
await page.screenshot({ path: `${evidence}02-context-caption-platform-layout-320x568.png`, fullPage: true })

console.log(JSON.stringify({ ok: true, viewports: ['390x844', '320x568'], emptyWhenRedundant: true, governedRequestsBeforeFreeAction: 0, freeActionRequests: 1, governedResultNotRepeated: true, meaningfulContextKept: true }))
await browser.close()
