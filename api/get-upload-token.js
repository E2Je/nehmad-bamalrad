const ADMIN_CODES = ['06918', '35321']

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const { adminCode } = body || {}
  if (!ADMIN_CODES.includes(String(adminCode))) {
    return res.status(401).json({ error: 'WRONG_CODE', received: String(adminCode) })
  }
  const token = process.env.GITHUB_TOKEN
  if (!token) return res.status(500).json({ error: 'NO_TOKEN' })
  res.status(200).json({ token })
}
