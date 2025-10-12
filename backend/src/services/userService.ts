import { stores } from '../store'

import type { ListOptions, ListResult } from '../store/baseStore'

export async function listUsers(opts?: ListOptions<{ q?: string }>): Promise<ListResult<any>> {
  // Service may add business rules (e.g., filtering, masking)
  return stores.users.list(opts)
}

export async function createUser(input: { email: string; name: string }) {
  // Example business rule: normalize name capitalization
  const normalized = { ...input, name: input.name.trim() }
  return stores.users.create(normalized)
}
