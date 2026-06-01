import { NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'

function checkSecret(request: NextRequest): boolean {
  const secret = request.nextUrl.searchParams.get('secret')
  return secret === process.env.REVALIDATE_SECRET
}

export async function GET(request: NextRequest) {
  if (!checkSecret(request)) {
    return Response.json({ message: 'Invalid secret' }, { status: 401 })
  }
  const path = request.nextUrl.searchParams.get('path') ?? '/'
  revalidatePath(path)
  return Response.json({ revalidated: path, ts: Date.now() })
}

export async function POST(request: NextRequest) {
  if (!checkSecret(request)) {
    return Response.json({ message: 'Invalid secret' }, { status: 401 })
  }
  let paths: string[] = ['/']
  try {
    const body = await request.json() as { paths?: string[] }
    if (Array.isArray(body.paths)) paths = body.paths
  } catch {
    // fall through — revalidate root
  }
  paths.forEach((p) => revalidatePath(p))
  return Response.json({ revalidated: paths, ts: Date.now() })
}
