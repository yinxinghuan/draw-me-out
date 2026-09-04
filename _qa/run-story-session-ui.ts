import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createServer } from 'vite'
import { createStorySessionLab } from '../server/storySessionLab'
import { resolveCartridge } from '../src/story/cartridges'
import { buildEndingSnapshot, fallbackEndingCandidate, finalizeEnding } from '../src/story/engine/endingDirector'

const gameBase = '/c699e284-58a9-43ca-8edf-223cd69588c9'
const directory = resolve(process.env.STORY_LAB_UI_DATABASE_DIR ?? '.story-session-lab/ui'); await mkdir(directory, { recursive: true })
const faults = { apiUnavailable: false, dropAndBlock: false }
let modelCalls = 0; let endingCalls = 0
const services = new Map<string, ReturnType<typeof createStorySessionLab>>(); const bases = new Map<string, string>()
for (const locale of ['zh','en'] as const) {
  const cartridge = resolveCartridge(null, locale)
  const service = createStorySessionLab({ cartridge, databasePath: resolve(directory, `${locale}.sqlite`), actorTokens: { 'qa-ui-a':'qa-ui-a','qa-ui-b':'qa-ui-b' },
    generator: { async send() { modelCalls += 1; return { content: locale === 'zh' ? '纸灰沿桥面飘过，你确认前方仍有一段道路没有褪色。\n[choices: "沿桥继续"|"检查总册痕迹"|"询问附近的见证者"]' : 'Paper ash crosses the bridge as you confirm that one stretch of road has not faded.\n[choices: "Continue across the bridge"|"Inspect the Ledger trace"|"Ask a nearby witness"]' } } },
    endingGenerator: { async generate(save) { endingCalls += 1; const snapshot = buildEndingSnapshot(save, cartridge); const candidate = fallbackEndingCandidate(snapshot, cartridge); return { snapshot, ending: finalizeEnding(candidate, snapshot, false), usedFallback: true, errors: ['QA_FIXTURE'] } } },
  })
  services.set(locale, service); bases.set(locale, (await service.listen()).baseUrl)
}
const vite = await createServer({ configFile: resolve('vite.config.ts'), server: { host:'127.0.0.1', port:Number(process.env.STORY_LAB_UI_PORT ?? 5197), strictPort:true }, plugins:[{ name:'draw-me-out-story-session-qa-only', configureServer(server) { server.middlewares.use(async (request,response,next) => {
  const path = new URL(request.url ?? '/', 'http://127.0.0.1').pathname
  if (!path.startsWith('/__story_lab/') && !path.startsWith(`${gameBase}/api/story/`)) { next(); return }
  response.setHeader('Cache-Control','no-store')
  try {
    const chunks:Buffer[]=[]; for await (const chunk of request) chunks.push(Buffer.from(chunk)); const requestBody=Buffer.concat(chunks).toString('utf8')
    if (path === '/__story_lab/control' && request.method === 'POST') { const update=JSON.parse(requestBody); if(typeof update.apiUnavailable==='boolean') faults.apiUnavailable=update.apiUnavailable; if(typeof update.dropAndBlock==='boolean') faults.dropAndBlock=update.dropAndBlock; response.setHeader('Content-Type','application/json'); response.end(JSON.stringify({ok:true,faults})); return }
    if (path === '/__story_lab/status' && request.method === 'GET') { response.setHeader('Content-Type','application/json'); response.end(JSON.stringify({ modelCalls, endingCalls, commits:Object.fromEntries([...services].map(([key,value])=>[key,value.committedCount()])), endingCommits:Object.fromEntries([...services].map(([key,value])=>[key,value.endingCommittedCount()])), liveModelCalled:false, liveMediaCalled:false, productionWrites:false, faults })); return }
    if (faults.apiUnavailable) { response.statusCode=503; response.end(JSON.stringify({code:'LAB_API_OFFLINE'})); return }
    const locale=request.headers['x-story-lab-locale']==='en'?'en':'zh'; const actor=request.headers['x-story-lab-actor']==='qa-b'?'qa-ui-b':'qa-ui-a'; const route=(request.url ?? '').slice(gameBase.length)
    const result=await fetch(`${bases.get(locale)}${route}`,{method:request.method,headers:{Authorization:`Bearer ${actor}`,'Content-Type':'application/json'},body:request.method==='GET'?undefined:requestBody}); const payload=await result.text()
    if(result.ok && (path.endsWith('/turns') || path.endsWith('/ending')) && faults.dropAndBlock){faults.dropAndBlock=false;faults.apiUnavailable=true;response.destroy();return}
    response.statusCode=result.status;response.setHeader('Content-Type','application/json');response.end(payload)
  } catch { response.statusCode=500; response.end(JSON.stringify({code:'LAB_PROXY_FAILURE'})) }
}) } }] })
await vite.listen(); console.log(JSON.stringify({url:`http://127.0.0.1:${vite.config.server.port}/_qa/story-session.html`,model:'fixture-only',productionWrites:false}))
let closing=false; for(const signal of ['SIGINT','SIGTERM'] as const) process.on(signal,()=>{if(closing)return;closing=true;void(async()=>{await vite.close();await Promise.all([...services.values()].map(service=>service.close()))})()})
