// Netlify Function: proxy protocols.json from GitHub (avoids CORS issues)
const REPO = 'E2Je/nehmad-bamalrad'

exports.handler = async () => {
  const token = process.env.GITHUB_TOKEN
  const headers = {
    Authorization: token ? `Bearer ${token}` : undefined,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  Object.keys(headers).forEach((k) => headers[k] === undefined && delete headers[k])

  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/protocols.json`, { headers })
  if (!res.ok) return { statusCode: 500, body: 'Cannot fetch protocols' }

  const data = await res.json()
  const content = Buffer.from(data.content, 'base64').toString('utf-8')
  const manifest = JSON.parse(content)

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(manifest.protocols),
  }
}
