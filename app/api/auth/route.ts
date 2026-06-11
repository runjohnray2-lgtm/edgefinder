import { NextResponse } from 'next/server'
export async function POST(request: Request) {
  try {
    const { code } = (await request.json()) as { code?: string }
    const validCodes = (process.env.ACCESS_CODES ?? '').split(',').map(c => c.trim()).filter(Boolean)
    if (!code || !validCodes.includes(code)) return NextResponse.json({ error: 'Invalid access code' }, { status: 401 })
    const response = NextResponse.json({ success: true })
    response.cookies.set('ef_token', code, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 60 * 60 * 24 * 30, path: '/' })
    return response
  } catch { return NextResponse.json({ error: 'Bad request' }, { status: 400 }) }
}
export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.set('ef_token', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 0, path: '/' })
  return response
}