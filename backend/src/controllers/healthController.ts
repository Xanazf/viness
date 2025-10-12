import type { Request, Response } from 'express'

export function ping(_req: Request, res: Response) {
  res.send('Is someone there?.. Must have been the wind.')
}
