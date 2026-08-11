/**
 * Minimal AlterU deployment adapter for Draw Me Out.
 *
 * The deployment package serves the compiled `dist/` beside this handler.
 * Player identity, saves, narration, and generated media remain on the
 * platform runtime; this worker deliberately creates no second data layer.
 */
export async function handleApi(request) {
  const url = new URL(request.url)

  if (request.method === 'GET' && url.pathname === '/api/health') {
    return Response.json({
      ok: true,
      game: 'draw-me-out',
      campaign: 'complete',
    })
  }

  return new Response('Not Found', { status: 404 })
}
