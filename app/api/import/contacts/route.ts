import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())

    if (lines.length < 2) {
      return NextResponse.json({ error: 'Invalid CSV format' }, { status: 400 })
    }

    // Parse CSV - headers: id,first_name,last_name,email,phone,title,email_type,contact_form_url,created_at,updated_at,agency_id,firm_id,department
    const headers = lines[0].split(',').map(h => h.trim())
    const contacts = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      const contact: Record<string, string> = {}

      for (let index = 0; index < headers.length; index++) {
        contact[headers[index]] = values[index] || ''
      }

      contacts.push({
        id: contact.id,
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        email: contact.email || `contact${i}@example.com`,
        phone: contact.phone || null,
        title: contact.title || null,
        email_type: contact.email_type || null,
        contact_form_url: contact.contact_form_url || null,
        department: contact.department || null,
        firm_id: contact.firm_id || null,
        agency_id: contact.agency_id,
      })
    }

    // Bulk insert contacts
    const result = await prisma.contact.createMany({
      data: contacts,
    })

    return NextResponse.json({
      message: 'Contacts imported successfully',
      count: result.count,
    })
  } catch (error) {
    console.error('Error importing contacts:', error)
    return NextResponse.json(
      { error: 'Failed to import contacts' },
      { status: 500 }
    )
  }
}
