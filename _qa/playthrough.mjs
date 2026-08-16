import { chromium } from '/Users/yin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'
import { mkdir, readFile } from 'node:fs/promises'

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
const imageRequests = []
let rejectFinalImageOnce = true
const semanticFixture = async (name) => `data:image/png;base64,${(await readFile(new URL(`./ui/semantic-cohort-v11/${name}`, import.meta.url))).toString('base64')}`
const semanticFixtures = {
  museum: await semanticFixture('1-label-museum-arrival-world.png'),
  meeting: await semanticFixture('2-endless-meeting-consequence-world.png'),
  flying: await semanticFixture('3-flying-city-problem-player.png'),
  latent: `data:image/png;base64,${(await readFile(new URL('./ui/latent-art-direction-sample-v5.png', import.meta.url))).toString('base64')}`,
}

await page.route('**/alteru-media/api/v1/images/generations', async (route) => {
  const body = route.request().postDataJSON()
  imageRequests.push(body)
  const prompt = String(body.prompt ?? body.input?.prompt ?? '')
  imagePrompts.push(prompt)
  if (/definitive 4:5 portrait ending illustration/i.test(prompt) && rejectFinalImageOnce) {
    rejectFinalImageOnce = false
    await route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify({
      error: { code: 'PROVIDER_REJECTED', message: 'QA one-shot ending image rejection', retryable: false },
    }) })
    return
  }
  const fixture = /definitive 4:5 portrait ending illustration/i.test(prompt) ? semanticFixtures.museum
    : /label museum side door/i.test(prompt) ? semanticFixtures.museum
    : /endless meeting room three/i.test(prompt) ? semanticFixtures.meeting
      : /flying city rope street/i.test(prompt) ? semanticFixtures.flying
        : /latent zero|outside the pictures|matte near-black non-space/i.test(prompt) ? semanticFixtures.latent
          : entryImage
  await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
    task_id: `qa-${body.request_id}`, request_id: body.request_id, type: 'image', status: 'succeeded',
    created_at: Date.now(), updated_at: Date.now(),
    media: { type: 'image', url: fixture, width: 512, height: 640, format: 'png' },
  }) })
})
await page.route('**/aigram/api/game-chat', async (route) => route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }))
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
  await page.locator('.ct-civic-viewport.is-result').waitFor({ state: 'visible', timeout: 8_000 })
  const next = page.getByRole('button', { name: /查看下一步选择/ })
  const readMore = page.getByRole('button', { name: /阅读下一段/ })
  if (await readMore.isVisible().catch(() => false) && await next.isVisible().catch(() => false)) {
    throw new Error('main next-choice CTA appeared before the result was fully read')
  }
  while (await page.locator('.ct-result-story>button:visible').count()) {
    await page.locator('.ct-result-story>button:visible').first().evaluate((button) => button.click())
    await page.waitForTimeout(25)
  }
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
await page.screenshot({ path: `${evidence}02-remnant-decision-platform-layout-${viewportTag}.png`, fullPage: true })
const remnantDecisionText = await page.locator('.ct-civic-viewport').innerText()
if (!/三道裂缝通往无法结束的画/.test(remnantDecisionText) || !/走进会飞走的城市入口/.test(remnantDecisionText)) {
  throw new Error('Little Remnant decision lacks the visible bridge from cracks to recognizable entrances')
}

const routes = [
  {
    entry: /七年.*会议/,
    steps: [/请黎姨指出第一天/, /让黎姨问谁真的有话要说/, /请黎姨亲手关掉会议室/],
  },
  {
    entry: /贴标签的博物馆/,
    steps: [/挡住飞向梁叔的标签/, /让梁叔描述真正的你/, /请梁叔保留一块空说明牌/],
    entryShot: '03-museum-entry-platform-layout-390x844.png',
    clueShot: '04-museum-clue-platform-layout-390x844.png',
    returnShot: '05-boundless-return-platform-layout-390x844.png',
    hubShot: '05-boundless-hub-decision-platform-layout-390x844.png',
  },
  {
    entry: /会飞走的城市/,
    steps: [/先接住掉下来的早餐/, /宣布早餐配送属于公共服务/, /把公共落地规则留给这里/],
  },
  {
    entry: /说话成真的王国/,
    steps: [/让国王先停在沉默里/, /把加冕词改成一个问题/, /让全城练习一句沉默/],
    clueShot: '06-fourth-clue-platform-layout-390x844.png',
    returnShot: '07-four-anchors-platform-layout-390x844.png',
    hubShot: '07-four-anchors-decision-platform-layout-390x844.png',
  },
]

for (let index = 0; index < routes.length; index += 1) {
  const route = routes[index]
  const decisionLabels = await page.locator('.st-quick-replies button').allTextContents()
  if (!decisionLabels.some((label) => route.entry.test(label))) {
    const diagnostic = await readWorld()
    throw new Error(`route entry missing at scene ${diagnostic?.scene}: ${decisionLabels.join(' / ')}; saved=${diagnostic?.choices?.map((choice) => choice.label).join(' / ')}`)
  }
  await choose(route.entry, route.entryShot)
  for (const step of route.steps) await choose(step)
  if (route.clueShot) await page.screenshot({ path: `${evidence}${route.clueShot.replace('390x844', viewportTag)}`, fullPage: true })
  const beforeReturn = await readWorld()
  if (beforeReturn.campaign.phase !== 'return' || !beforeReturn.campaign.currentEpisode) throw new Error(`world ${index + 1} did not stop at the explicit return gate`)
  if (beforeReturn.map.find((node) => node.current)?.id === 'latent-zero') throw new Error(`world ${index + 1} moved to the hub before the player returned`)
  if (beforeReturn.choices.some((choice) => /走进|入口$/.test(choice.label))) throw new Error(`next-world choice leaked before the Boundless return: ${beforeReturn.choices.map((choice) => choice.label).join(' / ')}`)
  await choose(/跟着小残穿回画外之地/, route.returnShot)
  const beforeReload = await readWorld()
  if (beforeReload.facts['home-clue-count'] !== index + 1) throw new Error(`clue count drift after route ${index + 1}`)
  if (beforeReload.map.find((node) => node.current)?.id !== 'latent-zero') throw new Error(`route ${index + 1} did not arrive at the Boundless transit station`)
  if (beforeReload.campaign.hubReturnCount !== index + 1) throw new Error(`return anchor count drift after route ${index + 1}`)
  if (!/红线环/.test(beforeReload.decisionContext)) throw new Error(`route ${index + 1} lacks the persistent Boundless visual anchor context`)
  if (route.hubShot) await page.screenshot({ path: `${evidence}${route.hubShot.replace('390x844', viewportTag)}`, fullPage: true })
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
await page.screenshot({ path: `${evidence}08-finale-ready-platform-layout-${viewportTag}.png`, fullPage: true })

await page.getByRole('button', { name: /完成属于你的结局/ }).click()
await page.locator('.st-ending').waitFor({ state: 'visible', timeout: 8_000 })
await page.getByText(/最后一张画没有显影成功/).waitFor({ state: 'visible', timeout: 8_000 })
await page.screenshot({ path: `${evidence}09-ending-image-failed-platform-layout-${viewportTag}.png`, fullPage: true })
if (!await page.getByRole('button', { name: /继续尾声/ }).isVisible()) throw new Error('ending image failure blocked the text ending or continuation')
await page.getByRole('button', { name: /重新显影结局图/ }).click()
await page.locator('.st-ending__media>img').waitFor({ state: 'visible', timeout: 8_000 })
await page.screenshot({ path: `${evidence}10-ending-complete-platform-layout-${viewportTag}.png`, fullPage: true })
const endingLayout = await page.evaluate(() => {
  const ending = document.querySelector('.st-ending')
  const button = document.querySelector('.st-ending footer button')
  const icon = button?.querySelector('svg')
  const hero = document.querySelector('.st-ending__hero')
  return {
    overflow: ending ? ending.scrollWidth - ending.clientWidth : 999,
    buttonHeight: button?.getBoundingClientRect().height ?? 999,
    iconWidth: icon?.getBoundingClientRect().width ?? 999,
    heroWidth: hero?.getBoundingClientRect().width ?? 0,
    heroHeight: hero?.getBoundingClientRect().height ?? 0,
  }
})
if (endingLayout.overflow > 1) throw new Error(`ending has horizontal overflow: ${JSON.stringify(endingLayout)}`)
if (endingLayout.buttonHeight > 80 || endingLayout.iconWidth > 24) throw new Error(`ending CTA regressed to an oversized block: ${JSON.stringify(endingLayout)}`)
if (endingLayout.heroWidth < 280 || endingLayout.heroHeight <= endingLayout.heroWidth) throw new Error(`ending image is not a readable 4:5 hero: ${JSON.stringify(endingLayout)}`)

const world = await readWorld()
if (world.version !== 8) throw new Error(`expected save v8, got ${world.version}`)
if (world.facts['home-clue-count'] !== 4 || world.facts['coordinates-four'] !== true) throw new Error('four clue campaign did not complete')
if (new Set(world.inventory.filter((item) => item.id.startsWith('coordinate-')).map((item) => item.id)).size !== 4) throw new Error('clue ids are missing or duplicated')
if (world.campaign.completedEpisodes.length !== 4 || world.campaign.currentEpisode) throw new Error('campaign checkpoint did not return to the hub')
if (world.campaign.hubReturnCount !== 4) throw new Error('not every picture world passed through the Boundless transit station')
if (world.blocks.some((block) => block.kind === 'check')) throw new Error('governed campaign turns received an independent danger check')
if (world.finale.status !== 'complete' || !world.sessionEnded) throw new Error('finale did not remain complete after the ending image flow')
if (!world.characters.some((character) => character.id === 'default-seven' && character.status === 'known')) throw new Error('Default Seven was not visibly introduced before the finale')
const finalWorld = await readWorld()
const endingImageBlocks = finalWorld.blocks.filter((block) => block.kind === 'image' && block.data?.purpose === 'finale')
if (finalWorld.finale.status !== 'complete' || endingImageBlocks.length !== 1 || endingImageBlocks[0].data?.status !== 'ready') throw new Error('ending image was not persisted exactly once')

const snapshots = world.blocks.filter((block) => block.kind === 'image' && block.data?.visualSnapshot)
if (snapshots.length !== 27) throw new Error(`expected 27 authoritative story frames, got ${snapshots.length}`)
for (const block of snapshots) {
  const snapshot = JSON.parse(block.data.visualSnapshot)
  if (!snapshot.locationId || !snapshot.action || !snapshot.result || !snapshot.avoid?.length || snapshot.planVersion !== 2 || !snapshot.camera) throw new Error(`incomplete visual snapshot on ${block.id}`)
  if (!['unfinished-rain-city', 'latent-zero'].includes(snapshot.locationId) && !snapshot.avoid.includes('montage')) throw new Error(`campaign snapshot lacks montage guard on ${block.id}`)
  const prompt = String(block.data.prompt || '')
  if (!prompt.includes('AUTHORITATIVE SCENE SNAPSHOT') || !prompt.includes(snapshot.locationId.replaceAll('-', ' '))) throw new Error(`prompt is not derived from snapshot on ${block.id}`)
}
const returnSnapshots = snapshots.map((block) => JSON.parse(block.data.visualSnapshot)).filter((snapshot) => snapshot.shot === 'return' && snapshot.locationId === 'latent-zero')
if (returnSnapshots.length !== 4) throw new Error(`expected four explicit Boundless returns, got ${returnSnapshots.length}`)
if (returnSnapshots.some((snapshot) => !snapshot.props.includes('one thin central red-filament transit ring') || !snapshot.continuity.some((rule) => rule.includes('same frontal camera')))) {
  throw new Error('a Boundless return lost the fixed transit composition')
}

const bodyText = await page.locator('body').innerText()
if (bodyText.includes('image_subject:') || bodyText.includes('请做出选择')) throw new Error('transport metadata or redundant prompt leaked into visible UI')
if (imageRequests.some((request) => !Array.isArray(request.reference_urls) || request.reference_urls.length > 1)) throw new Error('an image request has an invalid reference list')
if (!imageRequests.some((request) => request.mode === 'text' && request.reference_urls.length === 0)) throw new Error('campaign never released an NPC/environment-owned text frame')
if (!imageRequests.some((request) => request.mode === 'edit' && request.reference_urls.length === 1)) throw new Error('campaign never released a player-owned edit frame')
if (imageRequests.some((request) => request.mode === 'text' && request.reference_urls.length !== 0)) throw new Error('a non-player frame carried the avatar reference')

console.log(JSON.stringify({
  ok: true,
  finalScene: world.scene,
  clueCount: world.facts['home-clue-count'],
  episodes: world.campaign.completedEpisodes,
  authoritativeFrames: snapshots.length,
  imageRequests: imagePrompts.length,
  reloads: routes.length,
  evidence,
  endingLayout,
}, null, 2))
await browser.close()
