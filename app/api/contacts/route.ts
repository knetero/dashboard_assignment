import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

const DAILY_CONTACT_LIMIT = 50
const DISABLE_LIMIT = false

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
    const currentViewCount = await prisma.contactView.count({
      where: { userId }
    })
    const remaining = DISABLE_LIMIT ? 999999 : Math.max(0, DAILY_CONTACT_LIMIT - currentViewCount)

    // If limit reached, return 403
    if (!DISABLE_LIMIT && remaining === 0) {
      return NextResponse.json(
        {
          error: 'Daily limit reached',
          viewCount: currentViewCount,
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
      orderBy: [
        { created_at: 'desc' },
        { id: 'asc' }, // Secondary sort for stable pagination
      ],
      include: {
        agency: {
          select: {
            name: true,
          },
        },
      },
    })

    // Get which of these contacts the user has already viewed
    const contactIds = contacts.map(c => c.id)
    const viewedContactIds = await prisma.contactView.findMany({
      where: {
        userId,
        contactId: { in: contactIds },
      },
      select: { contactId: true },
    })

    // Determine which contacts are NEW views
    const alreadyViewedIds = new Set(viewedContactIds.map((v: { contactId: string }) => v.contactId))
    const newContacts = contacts.filter(c => !alreadyViewedIds.has(c.id))

    // Record or update individual contact views
    // Use upsert to ensure we update the timestamp even if the record exists
    if (contacts.length > 0 && !DISABLE_LIMIT) {
      await prisma.$transaction(
        contacts.map(c =>
          prisma.contactView.upsert({
            where: {
              userId_contactId: {
                userId,
                contactId: c.id
              }
            },
            update: {
              viewedAt: new Date()
            },
            create: {
              userId,
              contactId: c.id,
              viewedAt: new Date()
            }
          })
        )
      )
    }

    // Recalculate view count after recording new views
    const updatedViewCount = DISABLE_LIMIT ? 0 : await prisma.contactView.count({
      where: { userId }
    })

    // If user just hit the limit, create/update the limit session
    if (updatedViewCount >= DAILY_CONTACT_LIMIT && !DISABLE_LIMIT) {
      await prisma.dailyContactView.upsert({
        where: {
          userId_date: {
            userId,
            date: new Date()
          }
        },
        update: {
          viewCount: updatedViewCount
        },
        create: {
          userId,
          viewCount: updatedViewCount,
          date: new Date()
        }
      })
    }

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

    // DEBUG: Check indexes if error occurs
    try {
      const indexes = await prisma.$queryRaw`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE tablename = 'contact_views';
      `
      console.log('DEBUG: Current Indexes on contact_views:', JSON.stringify(indexes, null, 2))
    } catch (idxError) {
      console.error('Failed to query indexes:', idxError)
    }

    return NextResponse.json(
      { error: 'Failed to fetch contacts', details: String(error) },
      { status: 500 }
    )
  }
}
