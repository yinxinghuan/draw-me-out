import { chromium } from '/Users/yin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'
import { mkdir } from 'node:fs/promises'

const entryImage = 'https://cdn.aiwaves.tech/prod/telegram/avatar/643177116/1786469713308632.png'
const viewport = {
  width: Number(process.env.QA_WIDTH || 390),
  height: Number(process.env.QA_HEIGHT || 844),
}
const viewportTag = `${viewport.width}x${viewport.height}`
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport })
const evidence = new URL('./ui/campaign-director/', import.meta.url).pathname
await mkdir(evidence, { recursive: true })
const imagePrompts = []

await page.route('**/alteru-media/api/v1/images/generations', async (route) => {
  const body = route.request().postDataJSON()
  imagePrompts.push(String(body.prompt ?? body.input?.prompt ?? ''))
  await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
    task_id: `qa-${body.request_id}`, request_id: body.request_id, type: 'image', status: 'succeeded',
    created_at: Date.now(), updated_at: Date.now(),
    media: { type: 'image', url: entryImage, width: 512, height: 640, format: 'png' },
  }) })
})
await page.addInitScript(() => {
  if (!sessionStorage.getItem('dmo-qa-seeded')) {
    localStorage.clear()
    sessionStorage.setItem('dmo-qa-seeded', '1')
  }
  localStorage.setItem('game_locale', 'zh')
})
await page.goto(`${process.env.QA_URL || 'http://127.0.0.1:4188'}/?story_mode=demo&lang=zh&user_name=QA&avatar_url=${encodeURIComponent(entryImage)}`, { waitUntil: 'networkidle' })
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

async function advance(resultShot) {
  const next = page.getByRole('button', { name: /查看下一步选择/ })
  await next.waitFor({ timeout: 8_000 })
  if (resultShot) await page.screenshot({ path: `${evidence}${resultShot.replace('390x844', viewportTag)}`, fullPage: true })
  await next.click()
  await page.waitForTimeout(40)
}

async function choose(label, resultShot) {
  await page.getByRole('button', { name: label }).click()
  await advance(resultShot)
}

await page.getByRole('button', { name: /碰一下停在半空的雨/ }).click()
await advance('01-opening-result-platform-layout-390x844.png')
await choose(/叫住换脸的路人/)
await choose(/拿走门框上的发亮按键/)
await choose(/沿着红线往前摸/)

const routes = [
  {
    entry: /七年会议/,
    steps: [/请黎姨指出第一天/, /让黎姨问谁真的有话要说/, /请黎姨亲手关掉会议室/],
  },
  {
    entry: /贴标签的博物馆/,
    steps: [/挡住飞向梁叔的标签/, /让梁叔描述真正的你/, /请梁叔保留一块空说明牌/],
    entryShot: '02-museum-entry-platform-layout-390x844.png',
    endShot: '03-museum-return-platform-layout-390x844.png',
  },
  {
    entry: /会飞走的城市/,
    steps: [/先接住掉下来的早餐/, /宣布早餐配送属于公共服务/, /把公共落地规则留给这里/],
  },
  {
    entry: /说话成真的王国/,
    steps: [/让国王先停在沉默里/, /把加冕词改成一个问题/, /让全城练习一句沉默/],
    endShot: '04-four-clues-platform-layout-390x844.png',
  },
]

for (let index = 0; index < routes.length; index += 1) {
  const route = routes[index]
  await choose(route.entry, route.entryShot)
  for (const step of route.steps) await choose(step)
  if (route.endShot) await page.screenshot({ path: `${evidence}${route.endShot.replace('390x844', viewportTag)}`, fullPage: true })
  const beforeReload = await readWorld()
  if (beforeReload.facts['home-clue-count'] !== index + 1) throw new Error(`clue count drift after route ${index + 1}`)
  if (routes[index + 1] && !beforeReload.choices.some((choice) => routes[index + 1].entry.test(choice.label))) {
    throw new Error(`next route missing before reload: ${beforeReload.choices.map((choice) => choice.label).join(' / ')}`)
  }
  await page.reload({ waitUntil: 'networkidle' })
  await page.addStyleTag({ content: '#alteru-guest-banner{display:none!important}' })
  const resume = page.getByRole('button', { name: /继续游戏/ })
  await resume.waitFor({ state: 'visible', timeout: 8_000 })
  await resume.click()
  await page.locator('.st-quick-replies button').first().waitFor({ state: 'visible', timeout: 8_000 })
  if (routes[index + 1]) {
    const visibleLabels = await page.locator('.st-quick-replies button').allTextContents()
    if (!visibleLabels.some((label) => routes[index + 1].entry.test(label))) throw new Error(`next route missing after reload: ${visibleLabels.join(' / ')}`)
  }
}

await choose(/寻找抹平者留下的白痕/)
await choose(/用四条线索照出出口/)
await page.getByRole('button', { name: /开始处理最终出口/ }).click()
await page.waitForFunction(() => {
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)
    if (!key?.endsWith(':draw-me-out-save')) continue
    const archive = JSON.parse(localStorage.getItem(key) || '{}')
    if (archive?.worlds?.['draw-me-out']?.finale?.status === 'ready') return true
  }
  return false
}, { timeout: 8_000 })
await page.screenshot({ path: `${evidence}05-finale-ready-platform-layout-${viewportTag}.png`, fullPage: true })

const world = await readWorld()
if (world.version !== 8) throw new Error(`expected save v8, got ${world.version}`)
if (world.facts['home-clue-count'] !== 4 || world.facts['coordinates-four'] !== true) throw new Error('four clue campaign did not complete')
if (new Set(world.inventory.filter((item) => item.id.startsWith('coordinate-')).map((item) => item.id)).size !== 4) throw new Error('clue ids are missing or duplicated')
if (world.campaign.completedEpisodes.length !== 4 || world.campaign.currentEpisode) throw new Error('campaign checkpoint did not return to the hub')
if (world.blocks.some((block) => block.kind === 'check')) throw new Error('governed campaign turns received an independent danger check')
if (world.finale.status !== 'ready' || !world.sessionEnded) throw new Error('finale gate did not become ready')
if (!world.characters.some((character) => character.id === 'default-seven' && character.status === 'known')) throw new Error('Default Seven was not visibly introduced before the finale')

const snapshots = world.blocks.filter((block) => block.kind === 'image' && block.data?.visualSnapshot)
if (snapshots.length !== 19) throw new Error(`expected 19 authoritative campaign frames, got ${snapshots.length}`)
for (const block of snapshots) {
  const snapshot = JSON.parse(block.data.visualSnapshot)
  if (!snapshot.locationId || !snapshot.action || !snapshot.result || !snapshot.avoid?.includes('montage')) throw new Error(`incomplete visual snapshot on ${block.id}`)
  const prompt = String(block.data.prompt || '')
  if (!prompt.includes('AUTHORITATIVE SCENE SNAPSHOT') || !prompt.includes(snapshot.locationId.replaceAll('-', ' '))) throw new Error(`prompt is not derived from snapshot on ${block.id}`)
}

const bodyText = await page.locator('body').innerText()
if (bodyText.includes('image_subject:') || bodyText.includes('请做出选择')) throw new Error('transport metadata or redundant prompt leaked into visible UI')

console.log(JSON.stringify({
  ok: true,
  finalScene: world.scene,
  clueCount: world.facts['home-clue-count'],
  episodes: world.campaign.completedEpisodes,
  authoritativeFrames: snapshots.length,
  imageRequests: imagePrompts.length,
  reloads: routes.length,
  evidence,
}, null, 2))
await browser.close()
