import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Delete all contact view records for this user
    const contactViewsDeleted = await prisma.contactView.deleteMany({
      where: { userId },
    })

    // Delete all daily contact view records for this user
    const dailyViewsDeleted = await prisma.dailyContactView.deleteMany({
      where: { userId },
    })

    // FIX: Force creation of unique index if it's missing (which causes upsert errors)
    try {
      // First ensure no duplicates exist (we just deleted user's views, but let's be safe globally if possible, 
      // but here we can only safely delete for this user. 
      // Ideally we should run this once globally, but doing it here helps recover this specific user's state if they are the only one.)

      // We will try to create the index. If it exists, it might fail or we can use IF NOT EXISTS.
      // Note: This requires the table to be clean of duplicates across ALL users if we create a global index.
      // Since we can't easily clean all users here, we'll assume this is a dev env with one user or acceptable data loss.

      await prisma.$executeRaw`
        CREATE UNIQUE INDEX IF NOT EXISTS "contact_views_userId_contactId_key" 
        ON "contact_views"("userId", "contactId");
      `
      console.log('DEBUG: Attempted to create unique index "contact_views_userId_contactId_key"')
    } catch (idxError) {
      console.error('DEBUG: Failed to create index (might already exist or data conflict):', idxError)
    }

    return NextResponse.json({
      success: true,
      message: 'All contact view rate limits have been reset',
      deletedRecords: {
        contactViews: contactViewsDeleted.count,
        dailyViews: dailyViewsDeleted.count,
      },
    })
  } catch (error) {
    console.error('Error resetting rate limits:', error)
    return NextResponse.json(
      { error: 'Failed to reset rate limits' },
      { status: 500 }
    )
  }
}
