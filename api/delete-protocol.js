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
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

  const token = process.env.GITHUB_TOKEN
  if (!token) return res.status(500).send('GitHub token not configured')

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const { id } = body || {}
  if (!id) return res.status(400).send('Missing id')

  const { status, data } = await githubRequest('contents/protocols.json', 'GET', null, token)
  if (status !== 200) return res.status(500).send('Cannot read protocols.json')

  const manifest = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'))
  manifest.protocols = manifest.protocols.filter((p) => p.id !== id)

  const updateRes = await githubRequest('contents/protocols.json', 'PUT', {
    message: `מחיקת פרוטוקול: ${id}`,
    content: Buffer.from(JSON.stringify(manifest, null, 2)).toString('base64'),
    sha: data.sha,
    branch: BRANCH,
  }, token)

  if (updateRes.status !== 200 && updateRes.status !== 201) {
    return res.status(500).send('Failed to delete')
  }
  return res.status(200).json({ success: true })
}
