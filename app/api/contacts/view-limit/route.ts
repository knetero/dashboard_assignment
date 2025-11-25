import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/app/lib/prisma'

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get today's date range (start and end of day in UTC)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Count views for this user today
    const viewCount = await prisma.contactView.count({
      where: {
        userId,
        viewedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
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

export async function POST(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { contactIds } = await request.json()

    if (!contactIds || !Array.isArray(contactIds)) {
      return NextResponse.json({ error: 'Contact IDs array required' }, { status: 400 })
    }

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Count existing views for this user today
    const viewCount = await prisma.contactView.count({
      where: {
        userId,
        viewedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    if (viewCount >= 50) {
      return NextResponse.json(
        { error: 'Daily view limit reached', limit: 50 },
        { status: 403 }
      )
    }

    // Record views for all contacts
    const viewsToCreate = contactIds.map(contactId => ({
      userId,
      contactId,
    }))

    await prisma.contactView.createMany({
      data: viewsToCreate,
    })

    return NextResponse.json({ 
      success: true, 
      remaining: Math.max(0, 50 - viewCount - contactIds.length) 
    })
  } catch (error) {
    console.error('Error recording view:', error)
    return NextResponse.json(
      { error: 'Failed to record view' },
      { status: 500 }
    )
  }
}
