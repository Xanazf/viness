import { describe, it, expect } from 'vitest'
import { httpRequest, postJson, putJson, patchJson, deleteJson, HttpError } from './httpClient'
import http from 'node:http'

function createServer(handler: http.RequestListener) {
  const server = http.createServer(handler)
  return new Promise<{ url: string; close: () => Promise<void> }>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      const port = typeof address === 'object' && address ? address.port : 0
      resolve({
        url: `http://127.0.0.1:${port}`,
        close: () => new Promise((r) => server.close(() => r())),
      })
    })
  })
}

describe('httpClient', () => {
  it('performs GET and parses JSON', async () => {
    const srv = await createServer((_req, res) => {
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify({ ok: true }))
    })
    try {
      const data = await httpRequest<{ ok: boolean }>({ url: `${srv.url}/` })
      expect(data.ok).toBe(true)
    } finally {
      await srv.close()
    }
  })

  it('post/put/patch/delete helpers work and propagate errors', async () => {
    const srv = await createServer((req, res) => {
      if (req.method === 'POST') {
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify({ method: 'POST' }))
      } else if (req.method === 'PUT') {
        res.statusCode = 400
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify({ error: 'bad' }))
      } else if (req.method === 'PATCH') {
        res.end('ok')
      } else if (req.method === 'DELETE') {
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify({ deleted: true }))
      } else {
        res.end('noop')
      }
    })

    try {
      const p = await postJson<{ method: string }, { x: number }>({ url: `${srv.url}/`, body: { x: 1 } })
      expect(p.method).toBe('POST')

      await expect(putJson({ url: `${srv.url}/`, body: { x: 1 } })).rejects.toBeInstanceOf(HttpError)

      const patch = await patchJson<string, { x: number }>({ url: `${srv.url}/`, body: { x: 1 } })
      expect(patch).toBe('ok')

      const del = await deleteJson<{ deleted: boolean }>({ url: `${srv.url}/` })
      expect(del.deleted).toBe(true)
    } finally {
      await srv.close()
    }
  })
})
