import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/app/lib/prisma'

const DAILY_CONTACT_LIMIT = 50
const DISABLE_LIMIT = false // Set to false to re-enable limiting

export async function GET(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get pagination parameters from query string
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '5', 10)
    const skip = (page - 1) * limit

    // Get today's date range (UTC midnight to midnight)
    const now = new Date()
    const startOfDay = new Date(now.setUTCHours(0, 0, 0, 0))
    const endOfDay = new Date(now.setUTCHours(23, 59, 59, 999))

    // Count how many contacts the user has viewed today
    const viewedToday = await prisma.contactView.count({
      where: {
        userId,
        viewedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    })

    const remaining = DISABLE_LIMIT ? 999999 : Math.max(0, DAILY_CONTACT_LIMIT - viewedToday)

    if (!DISABLE_LIMIT && remaining === 0) {
      return NextResponse.json(
        { 
          error: 'Daily limit reached',
          viewCount: viewedToday,
          remaining: 0,
          limit: DAILY_CONTACT_LIMIT,
        },
        { 
          status: 403,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        }
      )
    }

    // Get total count of contacts
    const total = await prisma.contact.count()

    // Calculate how many contacts we can return for this page
    const maxContactsToReturn = DISABLE_LIMIT ? limit : Math.min(limit, remaining)

    // Get contacts for this page
    const contacts = await prisma.contact.findMany({
      skip,
      take: maxContactsToReturn,
      orderBy: { created_at: 'desc' },
      include: {
        agency: {
          select: {
            name: true,
          },
        },
      },
    })

    // Record views for the contacts on this page
    if (contacts.length > 0) {
      const contactIds = contacts.map(c => c.id)
      
      // Get already viewed contact IDs to avoid duplicates
      const alreadyViewed = await prisma.contactView.findMany({
        where: {
          userId,
          contactId: { in: contactIds },
          viewedAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        select: { contactId: true },
      })

      const alreadyViewedIds = new Set(alreadyViewed.map(v => v.contactId))
      const newContactIds = contactIds.filter(id => !alreadyViewedIds.has(id))

      if (newContactIds.length > 0) {
        await prisma.contactView.createMany({
          data: newContactIds.map(contactId => ({
            userId,
            contactId,
          })),
        })
      }
    }

    // Recalculate view count after recording
    const updatedViewCount = await prisma.contactView.count({
      where: {
        userId,
        viewedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    })

    const updatedRemaining = DISABLE_LIMIT ? 999999 : Math.max(0, DAILY_CONTACT_LIMIT - updatedViewCount)

    return NextResponse.json({
      contacts,
      total,
      viewCount: updatedViewCount,
      remaining: updatedRemaining,
      limit: DAILY_CONTACT_LIMIT,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
}
