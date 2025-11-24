import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetRateLimits() {
  try {
    console.log('Resetting all contact view rate limits...')
    
    const result = await prisma.contactView.deleteMany({})
    
    console.log(`✅ Successfully deleted ${result.count} contact view records`)
    console.log('All rate limits have been reset!')
  } catch (error) {
    console.error('❌ Error resetting rate limits:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

resetRateLimits()
