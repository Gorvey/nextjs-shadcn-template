import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import type { JWT } from 'next-auth/jwt'
import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(_req: NextRequest) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }: { token: JWT | null }) => !!token,
    },
  }
)

export const config = {
  matcher: ['/upload'],
}
