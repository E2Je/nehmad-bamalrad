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

async function getFileSha(path, token) {
  const { status, data } = await githubRequest(`contents/${path}`, 'GET', null, token)
  if (status === 200) return data.sha
  return null
}

async function getProtocolsJson(token) {
  const { status, data } = await githubRequest('contents/protocols.json', 'GET', null, token)
  if (status === 200) {
    const content = Buffer.from(data.content, 'base64').toString('utf-8')
    return { data: JSON.parse(content), sha: data.sha }
  }
  return { data: { categories: [], protocols: [] }, sha: null }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed')

  const token = process.env.GITHUB_TOKEN
  if (!token) return res.status(500).send('GitHub token not configured')

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const { fileName, content, title, category, tags, fileType } = body || {}

  if (!fileName || !content || !title || !category) {
    return res.status(400).send('Missing required fields')
  }

  const safeName = fileName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_֐-׿]/g, '')
  const filePath = `protocols/${safeName}`

  try {
    const existingSha = await getFileSha(filePath, token)
    const uploadBody = {
      message: `הוספת פרוטוקול: ${title}`,
      content,
      branch: BRANCH,
    }
    if (existingSha) uploadBody.sha = existingSha

    const uploadRes = await githubRequest(`contents/${filePath}`, 'PUT', uploadBody, token)
    if (uploadRes.status !== 200 && uploadRes.status !== 201) {
      return res.status(500).send(`GitHub upload failed: ${JSON.stringify(uploadRes.data)}`)
    }

    const { data: manifest, sha: manifestSha } = await getProtocolsJson(token)
    const id = safeName.replace(/\.[^.]+$/, '').toLowerCase()

    const existingIndex = manifest.protocols.findIndex((p) => p.id === id)
    const newProtocol = {
      id,
      title,
      category,
      tags: tags || [],
      fileName: safeName,
      fileType: fileType || 'image',
      githubPath: filePath,
      updatedAt: new Date().toISOString().split('T')[0],
      isLatest: true,
    }

    if (existingIndex >= 0) manifest.protocols[existingIndex] = newProtocol
    else manifest.protocols.push(newProtocol)

    const manifestBody = {
      message: `עדכון manifest: ${title}`,
      content: Buffer.from(JSON.stringify(manifest, null, 2)).toString('base64'),
      branch: BRANCH,
    }
    if (manifestSha) manifestBody.sha = manifestSha

    const manifestRes = await githubRequest('contents/protocols.json', 'PUT', manifestBody, token)
    if (manifestRes.status !== 200 && manifestRes.status !== 201) {
      return res.status(500).send(`Manifest update failed: ${JSON.stringify(manifestRes.data)}`)
    }

    return res.status(200).json({ success: true, protocol: newProtocol })
  } catch (err) {
    return res.status(500).send(`Error: ${err.message}`)
  }
}
