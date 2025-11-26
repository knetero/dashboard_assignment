import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const limitHours = parseFloat(process.env.CONTACT_LIMIT_HOURS || '24')

    // Check if there's an active limit session
    const limitSession = await prisma.dailyContactView.findFirst({
      where: { userId },
      orderBy: { date: 'desc' }
    })

    // If session exists, check if it has expired
    if (limitSession) {
      const sessionExpiry = new Date(limitSession.date.getTime() + limitHours * 60 * 60 * 1000)
      const now = new Date()

      // If session has expired, delete ALL records and the session
      if (now >= sessionExpiry) {
        await prisma.$transaction([
          prisma.contactView.deleteMany({ where: { userId } }),
          prisma.dailyContactView.deleteMany({ where: { userId } })
        ])
      }
    }

    // Count current views
    const viewCount = await prisma.contactView.count({
      where: { userId }
    })

    // Get total contacts count
    const total = await prisma.contact.count()

    const remaining = Math.max(0, 50 - viewCount)
    const canView = viewCount < 50

    return NextResponse.json({
      viewCount,
      remaining,
      canView,
      limit: 50,
      total,
    })
  } catch (error) {
    console.error('Error checking view limit:', error)
    return NextResponse.json(
      { error: 'Failed to check view limit' },
      { status: 500 }
    )
  }
}
