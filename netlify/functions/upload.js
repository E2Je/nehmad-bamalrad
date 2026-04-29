// Netlify Function: upload a file to GitHub and update protocols.json
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
  const { status, data } = await githubRequest(`contents/protocols.json`, 'GET', null, token)
  if (status === 200) {
    const content = Buffer.from(data.content, 'base64').toString('utf-8')
    return { data: JSON.parse(content), sha: data.sha }
  }
  return { data: { categories: [], protocols: [] }, sha: null }
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }

  const token = process.env.GITHUB_TOKEN
  if (!token) return { statusCode: 500, body: 'GitHub token not configured' }

  let body
  try { body = JSON.parse(event.body) }
  catch { return { statusCode: 400, body: 'Invalid JSON' } }

  const { fileName, content, title, category, tags, fileType } = body
  if (!fileName || !content || !title || !category) {
    return { statusCode: 400, body: 'Missing required fields' }
  }

  const safeName = fileName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_֐-׿]/g, '')
  const filePath = `protocols/${safeName}`

  try {
    // 1. Upload the file
    const existingSha = await getFileSha(filePath, token)
    const uploadBody = {
      message: `הוספת פרוטוקול: ${title}`,
      content,
      branch: BRANCH,
    }
    if (existingSha) uploadBody.sha = existingSha

    const uploadRes = await githubRequest(`contents/${filePath}`, 'PUT', uploadBody, token)
    if (uploadRes.status !== 200 && uploadRes.status !== 201) {
      return { statusCode: 500, body: `GitHub upload failed: ${JSON.stringify(uploadRes.data)}` }
    }

    // 2. Update protocols.json
    const { data: manifest, sha: manifestSha } = await getProtocolsJson(token)
    const id = safeName.replace(/\.[^.]+$/, '').toLowerCase()

    // Remove old entry with same id
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
      return { statusCode: 500, body: `Manifest update failed: ${JSON.stringify(manifestRes.data)}` }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, protocol: newProtocol }),
    }
  } catch (err) {
    return { statusCode: 500, body: `Error: ${err.message}` }
  }
}
