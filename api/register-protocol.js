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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const token = process.env.GITHUB_TOKEN
  if (!token) return res.status(500).send('Token not configured')

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const { id, title, category, tags, fileType, fileName, githubPath } = body || {}
  if (!id || !title || !category) return res.status(400).send('Missing required fields')

  const { status, data } = await githubRequest('contents/protocols.json', 'GET', null, token)
  if (status !== 200) return res.status(500).send('Cannot read protocols.json')

  const manifest = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'))

  const newProtocol = {
    id,
    title,
    category,
    tags: tags || [],
    fileName,
    fileType: fileType || 'image',
    githubPath,
    updatedAt: new Date().toISOString().split('T')[0],
    isLatest: true,
  }

  const existingIndex = manifest.protocols.findIndex(p => p.id === id)
  if (existingIndex >= 0) manifest.protocols[existingIndex] = newProtocol
  else manifest.protocols.push(newProtocol)

  const updateRes = await githubRequest('contents/protocols.json', 'PUT', {
    message: `עדכון manifest: ${title}`,
    content: Buffer.from(JSON.stringify(manifest, null, 2)).toString('base64'),
    sha: data.sha,
    branch: BRANCH,
  }, token)

  if (updateRes.status !== 200 && updateRes.status !== 201) {
    return res.status(500).send('Failed to update manifest')
  }

  return res.status(200).json({ success: true, protocol: newProtocol })
}
