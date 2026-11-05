/** Read the public total from hosting. Never submit a counting request or use local traffic. */
export async function readWebsiteVisitors(siteUrl, request = fetch) {
  const response = await request(new URL('visitor-count.php', siteUrl.replace(/\/?$/, '/')), {
    method: 'GET',
    headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
    redirect: 'error',
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) throw new Error('Website visitor count unavailable')
  const data = await response.json()
  if (!Number.isSafeInteger(data?.count) || data.count < 0)
    throw new Error('Invalid website visitor count')
  return data.count
}
