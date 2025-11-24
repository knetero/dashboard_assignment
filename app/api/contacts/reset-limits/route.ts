import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/app/lib/prisma'

export async function POST() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Delete all contact view records to reset rate limits
    const result = await prisma.contactView.deleteMany({})

    return NextResponse.json({
      success: true,
      message: 'All contact view rate limits have been reset',
      deletedRecords: result.count,
    })
  } catch (error) {
    console.error('Error resetting rate limits:', error)
    return NextResponse.json(
      { error: 'Failed to reset rate limits' },
      { status: 500 }
    )
  }
}
