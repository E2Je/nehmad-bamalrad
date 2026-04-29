// Netlify Function: update protocol metadata in protocols.json
const REPO = 'E2Je/nehmad-bamalrad'
const BRANCH = 'main'

async function githubRequest(path, method, body, token) {
  const res = await fetch(`https://api.github.com/repos/${REPO}/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status, data: await res.json() }
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
  const token = process.env.GITHUB_TOKEN
  if (!token) return { statusCode: 500, body: 'GitHub token not configured' }

  const { id, title, tags, category } = JSON.parse(event.body || '{}')
  if (!id) return { statusCode: 400, body: 'Missing id' }

  // Get current protocols.json
  const { status, data } = await githubRequest('contents/protocols.json', 'GET', null, token)
  if (status !== 200) return { statusCode: 500, body: 'Cannot read protocols.json' }

  const manifest = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'))
  const idx = manifest.protocols.findIndex((p) => p.id === id)
  if (idx < 0) return { statusCode: 404, body: 'Protocol not found' }

  if (title !== undefined) manifest.protocols[idx].title = title
  if (tags !== undefined) manifest.protocols[idx].tags = tags
  if (category !== undefined) manifest.protocols[idx].category = category
  manifest.protocols[idx].updatedAt = new Date().toISOString().split('T')[0]

  const updateRes = await githubRequest('contents/protocols.json', 'PUT', {
    message: `עדכון פרוטוקול: ${manifest.protocols[idx].title}`,
    content: Buffer.from(JSON.stringify(manifest, null, 2)).toString('base64'),
    sha: data.sha,
    branch: BRANCH,
  }, token)

  if (updateRes.status !== 200 && updateRes.status !== 201) {
    return { statusCode: 500, body: 'Failed to update' }
  }
  return { statusCode: 200, body: JSON.stringify({ success: true }) }
}
