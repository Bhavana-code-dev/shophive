const BASE_URL = 'https://dummyjson.com'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function getJson<T>(path: string): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`)
  } catch {
    throw new ApiError('Network error. Check your connection and try again.', 0)
  }
  if (!res.ok) {
    const message =
      res.status === 404 ? 'We could not find what you were looking for.' : `Request failed (${res.status}).`
    throw new ApiError(message, res.status)
  }
  return res.json() as Promise<T>
}
